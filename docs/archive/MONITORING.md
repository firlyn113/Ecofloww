# MONITORING.md: EcoFlow AI — Observability & Monitoring

> Panduan setup dan penggunaan monitoring untuk aplikasi EcoFlow AI di production.
> Mencakup metrik yang harus dipantau, alert thresholds, dashboard, dan log aggregation.

---

## 1. Pendekatan Monitoring

EcoFlow AI menggunakan pendekatan **lightweight monitoring** yang sesuai dengan resource VPS (2–4 GB RAM). Tidak ada full-stack observability (Prometheus/Grafana stack) pada MVP — digantikan oleh:

1. **Health checks berkala** (cron + UptimeRobot/Healthchecks.io)
2. **Container monitoring** (docker stats, restart counts)
3. **Log monitoring** (grep error patterns, logrotate)
4. **Database monitoring** (pg_stat_activity, pg_stat_statements)
5. **Uptime monitoring** (ping HTTPS ke domain)

> Jika tim berkembang, lihat Section 8 untuk upgrade path ke Prometheus + Grafana.

---

## 2. Metrik yang Harus Dipantau

### 2.1 Metrik Infrastruktur (VPS)

| Metrik | Threshold Normal | Warning | Critical | Cara Cek |
|--------|------------------|---------|----------|----------|
| CPU usage | < 50% | > 70% selama 5 menit | > 90% selama 10 menit | `top`, `mpstat` |
| RAM usage | < 60% | > 80% | > 90% atau swap aktif | `free -h` |
| Disk usage | < 70% | > 80% | > 90% | `df -h` |
| Load average | < #CPU | > #CPU selama 5 menit | > 2× #CPU selama 15 menit | `uptime` |
| Network | — | — | Bandwidth > 80% limit | `vnstat` |

### 2.2 Metrik Aplikasi (Backend)

| Metrik | Threshold | Sumber |
|--------|-----------|--------|
| Health endpoint status | `{"status": "healthy"}` | `curl /health` |
| 5xx error rate | 0 (warning jika > 1% requests) | Log backend, `grep -c " 5[0-9][0-9]"` |
| 429 rate-limit hits | Sporadic | Redis `KEYS ratelimit:*` |
| Response time p95 | < 500 ms | Nginx access log / manual `curl -w` |
| Restart count backend | 0 restart di luar deploy | `docker inspect ecoflow_backend -f '{{.RestartCount}}'` |
| Upload success rate | > 99% | Log MinIO & backend |

### 2.3 Metrik Database (PostgreSQL)

| Metrik | Threshold | Command |
|--------|-----------|---------|
| Active connections | < 80% dari max_connections | `pg_stat_activity` |
| Idle connections | Tidak membesar terus | `pg_stat_activity` |
| Slow queries (>1s) | 0 | `pg_stat_statements` |
| Table size growth | Naik wajar per bulan | `pg_total_relation_size` |
| VACUUM age | < 100M transactions | `SELECT age(datfrozenxid) FROM pg_database` |

### 4. Metrik Storage (MinIO)

| Metrik | Threshold |
|--------|-----------|
| Bucket size | Review bulanan |
| Health endpoint | `200 OK` dari `/minio/health/live` |
| Upload/download failures | 0 |

---

## 3. Setup Monitoring Minimal (Disarankan)

### 3.1 Cron Health Check Script

Buat `/home/deploy/scripts/monitor.sh`:

```bash
#!/bin/bash
# Monitor EcoFlow AI — kirim alert via webhook jika ada masalah
ALERT_WEBHOOK="" # URL webhook (Telegram/Discord/Slack)
LOG_FILE=/home/deploy/logs/monitor.log

check() {
  local name="$1" cmd="$2"
  if ! eval "$cmd" > /dev/null 2>&1; then
    echo "[$(date)] FAIL: $name" >> "$LOG_FILE"
    if [ -n "$ALERT_WEBHOOK" ]; then
      curl -s -X POST "$ALERT_WEBHOOK" \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"[EcoFlow AI] ALERT: $name is DOWN\"}" > /dev/null
    fi
  else
    echo "[$(date)] OK: $name" >> "$LOG_FILE"
  fi
}

check "backend_health" "curl -sf https://api.example.com/health"
check "frontend_http" "curl -sf -o /dev/null -w '%{http_code}' https://app.example.com | grep -q 200"
check "postgres" "docker exec ecoflow_postgres pg_isready -U ecoflow_user"
check "minio" "curl -sf http://localhost:9000/minio/health/live"
check "redis" "docker exec ecoflow_redis redis-cli ping | grep -q PONG"

# Disk usage
DISK=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
if [ "$DISK" -gt 85 ]; then
  echo "[$(date)] WARN: Disk at ${DISK}%" >> "$LOG_FILE"
  curl -s -X POST "$ALERT_WEBHOOK" -H "Content-Type: application/json" \
    -d "{\"text\": \"[EcoFlow AI] WARN: Disk usage ${DISK}%\"}" > /dev/null
fi
```

```bash
chmod +x /home/deploy/scripts/monitor.sh
mkdir -p /home/deploy/logs

# Cron tiap 5 menit
crontab -e
# */5 * * * * /home/deploy/scripts/monitor.sh
```

### 3.2 Uptime Monitoring Eksternal (gratis)

Gunakan **UptimeRobot** (50 monitor gratis) atau **Healthchecks.io**:

| Monitor | URL | Interval |
|---------|-----|----------|
| Frontend | `https://app.example.com` | 5 menit |
| Backend | `https://api.example.com/health` | 5 menit |

Alert ke email + Telegram/Discord/Slack webhook.

### 3.3 Log Rotation

Pastikan logrotate aktif untuk mencegah disk penuh:

```bash
# Nginx sudah default. Cek:
sudo logrotate -d /etc/logrotate.d/nginx

# Tambah log aplikasi (journald auto-rotate):
# /etc/logrotate.d/ecoflow
/home/deploy/logs/*.log {
    daily
    rotate 14
    compress
    missingok
    notifempty
}
sudo logrotate -f /etc/logrotate.d/ecoflow
```

---

## 4. Alert Thresholds & Policy

| Level | Kondisi | Contoh | Aksi |
|-------|---------|--------|------|
| **INFO** | Event normal | Deploy sukses, backup sukses | Catat di log, no alert |
| **WARN** | Degradasi minor | Disk > 80%, CPU > 70% 5 menit | Notifikasi, cek dalam 24 jam |
| **CRITICAL** | Service down / data risk | Health check fail 3× berturut, disk > 90% | Alert segera, ikuti OPERATIONS.md incident response |
| **SEVERE** | Data loss risk | DB unreachable, backup gagal 2× berturut | Alert + restart service, restore dari backup jika perlu |

**Golden rule:** Semua alert harus actionable — tidak ada alert yang tidak punya prosedur balasan.

---

## 5. Checklist Monitoring Rutin

### 5.1 Harian (2 menit)

```bash
/home/deploy/scripts/monitor.sh && cat /home/deploy/logs/monitor.log | tail -20
```

### 5.2 Mingguan (10 menit)

```bash
# 1. Cek log error backend selama seminggu
docker logs ecoflow_backend --since 7d 2>&1 | grep -iE "error|exception|traceback" | head -20

# 2. Cek error Nginx
sudo grep -c " 5[0-9][0-9]" /var/log/nginx/access.log

# 3. Cek pertumbuhan DB & MinIO
docker exec -it ecoflow_postgres psql -U ecoflow_user ecoflow -c \
  "SELECT pg_size_pretty(pg_database_size('ecoflow'));"
sudo du -sh /var/lib/docker/volumes/*minio*/_data

# 4. Cek SSL expiry
sudo certbot certificates | grep "Expiry"

# 5. Cek restart count semua container
for c in ecoflow_backend ecoflow_postgres ecoflow_minio; do
  echo "$c: $(docker inspect $c -f '{{.RestartCount}}')";
done
```

### 5.3 Bulanan (30 menit)

- Review metrik pertumbuhan (DB size, MinIO size, user count)
- Test restore backup di environment test
- Update sistem: `sudo apt update && sudo apt upgrade -y`
- Review rate-limit hits abnormal (brute force indicator)

---

## 6. Logging Strategy

### 6.1 Sumber Log

| Source | Lokasi | Retention |
|--------|--------|-----------|
| Backend (uvicorn) | `docker logs ecoflow_backend` | 7–14 hari (docker) |
| Frontend (Next.js) | `journalctl -u ecoflow-frontend` | journald default (≈10 hari) |
| PostgreSQL | `docker logs ecoflow_postgres` | 7 hari |
| MinIO | `docker logs ecoflow_minio` | 7 hari |
| Nginx access/error | `/var/log/nginx/` | 14 hari (logrotate) |
| Monitor script | `/home/deploy/logs/monitor.log` | 14 hari (logrotate) |

### 6.2 Menambah Log yang Berguna

Backend menggunakan standard `logging` module — aktifkan debug sementara jika perlu:

```bash
# Di .env backend, atau override saat run:
docker compose -f docker-compose.prod.yml --env-file .env.prod run --rm \
  -e LOG_LEVEL=DEBUG backend
```

### 6.3 Pattern Error yang Perlu Diperhatikan

```bash
# Cek traceback Python (error tak tertangani)
docker logs ecoflow_backend 2>&1 | grep -A 20 "Traceback"

# Cek SQL errors
docker logs ecoflow_backend 2>&1 | grep -iE "psycopg2|sqlalchemy.*error"

# Cek auth failures (indikasi serangan)
docker logs ecoflow_backend 2>&1 | grep -iE "unauthorized|invalid token|401"

# Cek upload gagal (indikasi storage issue)
docker logs ecoflow_backend 2>&1 | grep -iE "upload.*fail"
```

---

## 7. Performance Baselines

Baseline awal untuk VPS 2 vCPU / 4 GB RAM (gunakan sebagai referensi, bukan target mutlak):

| Metrik | Baseline | Catatan |
|--------|----------|---------|
| API response p50 | < 100 ms | Tanpa file upload |
| API response p95 | < 500 ms | |
| Login (Firebase verify) | < 1 s | Tergantung Firebase |
| Upload 1 MB image | < 2 s | Tergantung bandwidth VPS |
| Report PDF generation | < 3 s | |
| Concurrent users (smooth) | ~50 | Monolithic, rule-based AI (tanpa ML runtime) |
| Concurrent users (max) | ~100 | Dengan rate limit 60 req/min |

Jika performa turun di bawah baseline, lakukan:
1. Cek Section 4.1 di OPERATIONS.md (slow queries, memory)
2. Naikkan resource VPS jika perlu
3. Pertimbangkan Redis cache untuk endpoint yang sering dipanggil

---

## 8. Upgrade Path: Prometheus + Grafana (Opsional)

Jika resource dan kebutuhan berkembang, arsitektur monitoring penuh:

```
┌────────────┐   scrape   ┌───────────────┐
│ Docker     │───────────▶│  Prometheus   │
│ cadvisor   │            │    (VPS)      │
│ node_      │            └──────┬────────┘
│ exporter   │                   │ query
└────────────┘            ┌──────▼────────┐
┌────────────┐            │    Grafana    │
│ FastAPI    │            │ (dashboard +  │
│ prometheus-│  /metrics  │  alert rules) │
│ fastapi    │───────────▶└───────────────┘
└────────────┘
┌────────────┐
│ Postgres   │  postgres_exporter
│ exporter   │
└────────────┘
```

```yaml
# docker-compose.monitoring.yml (contoh tambahan)
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "127.0.0.1:9090:9090"

  grafana:
    image: grafana/grafana:latest
    ports:
      - "127.0.0.1:3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}

  node-exporter:
    image: prom/node-exporter:latest
    network_mode: host
```

> **Disclaimer:** Full Prometheus/Grafana stack memakan ±500 MB RAM + storage untuk TSDB. Tidak disarankan untuk VPS 2 GB kecuali hanya pada tahap development/staging.

---

## 9. Referensi

- [OPERATIONS.md](./OPERATIONS.md) — Runbook & troubleshooting
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Panduan deployment
- [SECURITY_HARDENING_REPORT.md](./SECURITY_HARDENING_REPORT.md) — Audit keamanan
- [TESTING.md](./TESTING.md) — Strategi testing
