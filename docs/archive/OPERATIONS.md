# OPERATIONS.md: EcoFlow AI — Runbook & Panduan Operasional

> Panduan operasional untuk tim yang mengelola aplikasi EcoFlow AI di production.
> Berisi task rutin, troubleshooting, maintenance database, backup, dan prosedur incident response.

---

## 1. Arsitektur Produksi (Ringkasan)

| Service | Container/Proses | Port | Status Command |
|---------|------------------|------|----------------|
| Backend API | `ecoflow_backend` (Docker) | 127.0.0.1:8000 | `docker ps \| grep ecoflow_backend` |
| PostgreSQL | `ecoflow_postgres` (Docker) | internal | `docker ps \| grep ecoflow_postgres` |
| MinIO | `ecoflow_minio` (Docker) | internal | `docker ps \| grep ecoflow_minio` |
| Redis | `ecoflow_redis` (Docker) | internal | `docker ps \| grep ecoflow_redis` |
| Frontend | `ecoflow-frontend` (systemd) | 127.0.0.1:3000 | `systemctl status ecoflow-frontend` |
| Reverse Proxy | Nginx (systemd) | 80/443 | `systemctl status nginx` |

**Paths utama di server:**
- Aplikasi: `/home/deploy/apps/ecoflow/`
- Log docker: `docker logs <container>`
- Log frontend: `journalctl -u ecoflow-frontend`
- Log Nginx: `/var/log/nginx/{access,error}.log`
- Backup: `/home/deploy/backups/`

---

## 2. Status & Health Check

### 2.1 Quick Health Check

```bash
# 1. Health endpoint backend
curl -s https://api.example.com/health
# => {"status": "healthy"}

# 2. Frontend merespons
curl -s -o /dev/null -w "%{http_code}" https://app.example.com
# => 200

# 3. Semua container up
docker ps --filter "name=ecoflow_" --format "table {{.Names}}\t{{.Status}}"

# 4. Disk usage
df -h

# 5. Memory
free -h

# 6. Load average
uptime
```

### 2.2 Health Checklist Rutin

| Interval | Cek |
|----------|-----|
| Harian | Health endpoint, disk usage, backup job sukses |
| Mingguan | Log errors, SSL cert expiry, disk growth MinIO |
| Bulanan | Test restore backup, review rate-limit hits, update sistem |

---

## 3. Task Operasional Rutin

### 3.1 Restart Backend

```bash
cd /home/deploy/apps/ecoflow
docker compose -f docker-compose.prod.yml --env-file .env.prod restart backend
```

### 3.2 Restart Frontend

```bash
sudo systemctl restart ecoflow-frontend
```

### 3.3 Restart Semua Service

```bash
# Graceful: stop semua, start semua
cd /home/deploy/apps/ecoflow
docker compose -f docker-compose.prod.yml --env-file .env.prod restart
sudo systemctl restart ecoflow-frontend
```

### 3.4 Melihat Log

```bash
# Backend — 100 baris terakhir
docker logs ecoflow_backend --tail 100

# Backend — follow (real-time)
docker logs -f ecoflow_backend

# Backend — filter error
docker logs ecoflow_backend 2>&1 | grep -iE "error|exception|traceback"

# Frontend
journalctl -u ecoflow-frontend -n 100
journalctl -u ecoflow-frontend -f

# Nginx
tail -f /var/log/nginx/error.log
```

### 3.5 Cek Migrasi Database

```bash
# Versi migration saat ini
docker exec -it ecoflow_backend alembic current

# History
docker exec -it ecoflow_backend alembic history
```

### 3.6 Menambahkan Admin User

```bash
# 1. Dapatkan Firebase UID user (dari Firebase Console atau database)
# 2. Tambahkan ke env ADMIN_UIDS di .env backend:
#    ADMIN_UIDS=uid1,uid2
# 3. Restart backend
docker compose -f docker-compose.prod.yml --env-file .env.prod restart backend
```

### 3.7 Flush Redis Cache (jika performance menurun)

```bash
docker exec -it ecoflow_redis redis-cli FLUSHDB
```

> Hati-hati: ini menghapus semua cache & rate-limit counter. Rate limiter akan reset.

### 3.8 Cek Penggunaan Disk

```bash
# Top-level
du -sh /home/deploy/apps/ecoflow/* | sort -rh

# Volume Docker
docker system df

# Ukuran MinIO data
sudo du -sh /var/lib/docker/volumes/*minio*/_data
```

---

## 4. Troubleshooting Guide

### 4.1 Aplikasi Lambat

**Langkah:**
```bash
# 1. Cek CPU & memory
top
free -h

# 2. Cek slow queries di Postgres
docker exec -it ecoflow_postgres psql -U ecoflow_user ecoflow -c \
  "SELECT pid, now() - query_start AS duration, query FROM pg_stat_activity WHERE state = 'active' ORDER BY duration DESC LIMIT 10;"

# 3. Cek jumlah koneksi DB
docker exec -it ecoflow_postgres psql -U ecoflow_user ecoflow -c \
  "SELECT count(*) FROM pg_stat_activity;"

# 4. Cek redis (rate limiter)
docker exec -it ecoflow_redis redis-cli INFO memory

# 5. Cek log error
docker logs ecoflow_backend --tail 200 2>&1 | grep -i error
```

**Solusi umum:**
- Koneksi DB penuh → restart backend (connection pool reset): `docker compose ... restart backend`
- RAM habis → cek OOM: `journalctl -k | grep -i oom`
- Disk penuh → lihat Section 4.6

### 4.2 Error 502 / 504 Bad Gateway

```bash
# Backend crash?
docker ps | grep ecoflow_backend
docker logs ecoflow_backend --tail 100

# Frontend crash?
sudo systemctl status ecoflow-frontend

# Nginx error log
tail -50 /var/log/nginx/error.log
```

**Jika backend restart loop:**
```bash
docker logs ecoflow_backend --tail 50
# Jika crash karena DB tidak reachable → cek postgres
docker ps | grep ecoflow_postgres
docker logs ecoflow_postgres --tail 50
```

### 4.3 Error 429 Too Many Requests (Rate Limited)

```bash
# Cek rate limit config
docker exec ecoflow_backend env | grep RATE_LIMIT

# Cek counter di redis
docker exec -it ecoflow_redis redis-cli KEYS "ratelimit:*"
```

**Solusi:** Naikkan `RATE_LIMIT` di `.env` backend, restart backend. Atau tunggu window (60 detik default).

### 4.4 Error 401/403 Unauthorized

```bash
# 1. Cek Firebase credentials valid
docker exec -it ecoflow_backend ls -la /app/firebase-credentials.json

# 2. Cek token Firebase project cocok dengan frontend
#    - Firebase project di frontend env vs service account di backend HARUS sama

# 3. Cek log auth
docker logs ecoflow_backend 2>&1 | grep -iE "auth|token|firebase"
```

### 4.5 Upload Gambar Gagal / MinIO Error

```bash
# Cek MinIO health
curl http://localhost:9000/minio/health/live

# Cek log MinIO
docker logs ecoflow_minio --tail 100

# Cek bucket ada
docker exec -it ecoflow_minio mc ls local/  # jika mc terinstall
```

**Solusi umum:**
- MinIO down → restart: `docker compose ... restart minio`
- Disk penuh di volume MinIO → lihat Section 4.6
- Credential salah → cek `MINIO_ACCESS_KEY`/`MINIO_SECRET_KEY` di `.env.prod`

### 4.6 Disk Penuh

```bash
# 1. Identifikasi pemakaian
df -h
sudo du -sh /var/lib/docker/volumes/* 2>/dev/null | sort -rh

# 2. Bersihkan Docker cache/images tidak terpakai
docker system prune -f --volumes   # HATI-HATI: hapus volume jika tidak dipakai

# 3. Bersihkan backup lama
find /home/deploy/backups/postgres -name "*.sql.gz" -mtime +7 -delete

# 4. Kompres/archive log Nginx
sudo logrotate -f /etc/logrotate.d/nginx
```

> **Peringatan:** `docker system prune --volumes` akan menghapus `postgres_data` dan `minio_data` jika container tidak jalan. Selalu backup dulu.

### 4.7 SSL Certificate Issue

```bash
# Cek expiry
sudo certbot certificates

# Renew paksa
sudo certbot renew --force-renewal
sudo systemctl reload nginx

# Cek auto-renew timer
sudo systemctl list-timers | grep certbot
```

### 4.8 Database Connection Errors

```bash
# Cek postgres up
docker ps | grep ecoflow_postgres

# Cek koneksi langsung
docker exec -it ecoflow_postgres psql -U ecoflow_user ecoflow -c "SELECT 1;"

# Cek pg_stat_activity untuk koneksi terbuka
docker exec -it ecoflow_postgres psql -U ecoflow_user ecoflow -c \
  "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"

# Kill koneksi idle
docker exec -it ecoflow_postgres psql -U ecoflow_user ecoflow -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND pid <> pg_backend_pid();"
```

### 4.9 AI Prediction Output Tidak Sesuai Harapan

> AI pada EcoFlow bersifat deterministic (rule-based), bukan model ML eksternal. Jika hasil klasifikasi aneh:
> 1. Cek input log di database (aroma, color, gas, temperature)
> 2. Cek log perhitungan: `docker logs ecoflow_backend 2>&1 | grep -i ferment`
> 3. Referensi aturan: `backend/app/services/fermentation_assistant.py`
> 4. Jika ada bug → buat issue & perbaiki dengan deployment baru

---

## 5. Database Maintenance

### 5.1 Vacuum & Analyze (rutin, bulanan)

```bash
docker exec -it ecoflow_postgres psql -U ecoflow_user ecoflow -c "VACUUM ANALYZE;"
```

### 5.2 Cek Ukuran Database & Table

```bash
docker exec -it ecoflow_postgres psql -U ecoflow_user ecoflow -c \
  "SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename)) AS size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(tablename) DESC LIMIT 10;"
```

### 5.3 Cek Index Usage

```bash
docker exec -it ecoflow_postgres psql -U ecoflow_user ecoflow -c \
  "SELECT schemaname, relname, indexrelname, idx_scan, idx_tup_read FROM pg_stat_user_indexes ORDER BY idx_scan ASC LIMIT 10;"
```

### 5.4 Query Monitoring

```bash
# Slow queries (>1 detik)
docker exec -it ecoflow_postgres psql -U ecoflow_user ecoflow -c \
  "SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

> Perlu ekstensi `pg_stat_statements` diaktifkan di `postgresql.conf` (sering belum aktif di default docker image).

### 5.5 Reset Password Database

```bash
# Ganti password (harus sinkron dengan DATABASE_URL di .env backend)
docker exec -it ecoflow_postgres psql -U ecoflow_user ecoflow -c \
  "ALTER USER ecoflow_user WITH PASSWORD 'NEW_PASSWORD';"
# Lalu update .env backend & restart
```

---

## 6. Backup & Restore

### 6.1 Verifikasi Backup Harian Berjalan

```bash
tail -20 /home/deploy/backups/backup.log
ls -lh /home/deploy/backups/postgres/ | tail -5
```

### 6.2 Restore Database (prosedur lengkap)

```bash
# 1. Stop backend sementara
cd /home/deploy/apps/ecoflow
docker compose -f docker-compose.prod.yml --env-file .env.prod stop backend

# 2. Drop & recreate database
docker exec -it ecoflow_postgres psql -U ecoflow_user postgres -c "DROP DATABASE IF EXISTS ecoflow;"
docker exec -it ecoflow_postgres psql -U ecoflow_user postgres -c "CREATE DATABASE ecoflow OWNER ecoflow_user;"

# 3. Restore dari backup
gunzip -c /home/deploy/backups/postgres/ecoflow_LATEST.sql.gz \
  | docker exec -i ecoflow_postgres psql -U ecoflow_user ecoflow

# 4. Verifikasi
docker exec -it ecoflow_postgres psql -U ecoflow_user ecoflow -c "SELECT count(*) FROM users;"

# 5. Start backend kembali
docker compose -f docker-compose.prod.yml --env-file .env.prod start backend
```

### 6.3 Restore MinIO

```bash
rclone sync /home/deploy/backups/minio/ecoflow-bucket minio:ecoflow-bucket
```

---

## 7. Incident Response

### 7.1 Severity Levels

| Level | Definisi | Contoh | Target Response |
|-------|----------|--------|-----------------|
| **SEV-1** | Total outage, data loss risk | Site down, DB corrupt | < 1 jam |
| **SEV-2** | Mayor feature down, degraded | Login gagal massal, upload error | < 4 jam |
| **SEV-3** | Minor issue, workaround ada | UI glitch, slow response | < 24 jam |
| **SEV-4** | Cosmetic / enhancement | Typo, styling issue | Next release |

### 7.2 Prosedur SEV-1 / SEV-2

```
1. DETECT  → Konfirmasi masalah (reproduce, cek health endpoint)
2. DECLARE → Umumkan ke tim (channel komunikasi internal)
3. TRIAGE  → Identifikasi komponen mana yang down:
               - Backend crash?    → Section 4.2
               - Database down?    → Section 4.8
               - MinIO down?       → Section 4.5
               - Frontend down?    → Section 4.2
               - Nginx down?       → systemctl status nginx
4. MITIGATE→ Prioritas: restore service. Rollback jika perlu (lihat DEPLOYMENT.md Section 10)
5. RESOLVE → Verifikasi health check normal kembali
6. LEARN   → Post-mortem (template di bawah)
```

### 7.3 Post-Mortem Template

```markdown
# Post-Mortem: <Judul Insiden>

- **Tanggal:** YYYY-MM-DD HH:MM
- **Durasi:** X jam Y menit
- **Severity:** SEV-X
- **Impact:** <siapa yang terdampak, apa yang terdampak>

## Timeline
- HH:MM — Deteksi pertama (dari siapa, bagaimana)
- HH:MM — Triase & dugaan awal
- HH:MM — Mitigasi dilakukan
- HH:MM — Service pulih

## Root Cause
<penjelasan akar masalah>

## Action Items
- [ ] <tindakan preventif 1> (owner, deadline)
- [ ] <tindakan preventif 2> (owner, deadline)

## Lessons Learned
<apa yang bisa diperbaiki dari proses>
```

### 7.4 Escalation Path

```
Operator / On-call (VPS admin)
    │ tidak bisa resolve dalam target time
    ▼
Backend Developer (FastAPI/Docker)
    │
    ▼
Frontend Developer (Next.js/Firebase)
    │
    ▼
Project Lead / Tim ITechnoCup 2026
```

---

## 8. Keamanan Operasional

### 8.1 Checklist Keamanan Rutin

| Frekuensi | Cek |
|-----------|-----|
| Bulanan | `apt update && apt upgrade -y` untuk security patch |
| Bulanan | Review user SSH: `/etc/passwd` untuk akun tidak dikenal |
| Bulanan | Cek failed login: `sudo grep "Failed password" /var/log/auth.log \| tail` |
| Bulanan | `docker system df` — bersihkan image tidak terpakai |
| Bulanan | Cek SSL cert: `sudo certbot certificates` |
| Kuartal | Review database users & permissions |

### 8.2 Cek Uptime Service

```bash
# Uptime semua container
docker ps --filter "name=ecoflow_" --format "{{.Names}}: {{.Status}}"

# Restart count (indikasi crash loop)
docker inspect ecoflow_backend --format '{{.RestartCount}}'
```

---

## 9. Checklist Harian Operator

```bash
#!/bin/bash
# /home/deploy/scripts/daily_check.sh
echo "=== $(date) ==="
echo "--- Health ---"
curl -s https://api.example.com/health
echo ""
curl -s -o /dev/null -w "Frontend: %{http_code}\n" https://app.example.com
echo "--- Containers ---"
docker ps --filter "name=ecoflow_" --format "{{.Names}}: {{.Status}}"
echo "--- Disk ---"
df -h / | tail -1
echo "--- Backup log ---"
tail -3 /home/deploy/backups/backup.log
echo "--- SSL ---"
sudo certbot certificates 2>/dev/null | grep "Expiry Date" || echo "certbot check via cron"
```

---

## 10. Referensi

- [DEPLOYMENT.md](./DEPLOYMENT.md) — Panduan deployment production
- [MONITORING.md](./MONITORING.md) — Setup monitoring & alerting
- [SECURITY_HARDENING_REPORT.md](./SECURITY_HARDENING_REPORT.md) — Audit keamanan
- [TESTING.md](./TESTING.md) — Strategi testing
