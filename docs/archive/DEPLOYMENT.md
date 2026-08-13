# DEPLOYMENT.md: EcoFlow AI — Panduan Deployment Production

> Panduan lengkap untuk men-deploy EcoFlow AI ke server production (VPS).
> Target referensi: **Hostinger VPS** (Ubuntu 22.04/24.04 LTS), namun berlaku umum untuk VPS Linux lainnya.

---

## 1. Arsitektur Deployment

```
Internet
   │
   ▼
┌─────────────────────────────────────────────────────┐
│                    VPS (Production)                 │
│                                                     │
│  ┌──────────────┐   ┌────────────────────────────┐  │
│  │  Nginx       │   │  Docker / docker-compose   │  │
│  │  Reverse     │──▶│                            │  │
│  │  Proxy + SSL │   │  ┌──────────┐ ┌─────────┐  │  │
│  │              │   │  │ Frontend │ │ Backend │  │  │
│  │  app.example │   │  │ (Next.js)│ │(FastAPI)│  │  │
│  │  .com :443   │   │  │  :3000   │ │  :8000  │  │  │
│  │  api.example │   │  └──────────┘ └─────────┘  │  │
│  │  .com :443   │   │  ┌──────────┐ ┌─────────┐  │  │
│  │              │   │  │PostgreSQL│ │  MinIO  │  │  │
│  │              │   │  │   :5432  │ │ :9000   │  │  │
│  └──────────────┘   │  └──────────┘ └─────────┘  │  │
│                     └────────────────────────────┘  │
│                                                     │
│  Firebase Auth (cloud, di luar VPS)                 │
└─────────────────────────────────────────────────────┘
```

### Komponen yang di-deploy

| Komponen | Teknologi | Port Internal | Port Public |
|----------|-----------|---------------|-------------|
| Frontend | Next.js 15 (Node.js 20) | 3000 | — (via Nginx) |
| Backend | FastAPI (Python 3.11) + Uvicorn | 8000 | — (via Nginx) |
| Database | PostgreSQL 16 | 5432 | — (internal) |
| Object Storage | MinIO | 9000 / 9001 | — (internal) |
| Reverse Proxy | Nginx + Let's Encrypt | 80 / 443 | 80 / 443 |
| Auth | Firebase Auth (cloud service) | — | — |

---

## 2. Prerequisites

### 2.1 Server Requirements (Minimum)

| Resource | Minimum | Disarankan |
|----------|---------|------------|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 2 GB | 4 GB |
| Storage | 20 GB SSD | 40 GB SSD (MinIO menyimpan file) |
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| Bandwidth | 1 TB | Unmetered |

### 2.2 Hal yang Harus Disiapkan Sebelumnya

1. **VPS** dengan akses SSH root.
2. **Domain** (contoh: `app.example.com` dan `api.example.com`) dengan DNS A record menunjuk ke IP VPS.
3. **Proyek Firebase** yang sudah dikonfigurasi (lihat `FIREBASE_SETUP_COMPLETE.md`).
4. **Service account JSON** Firebase Admin SDK (`firebase-credentials.json`).
5. **Git** untuk clone repository.

---

## 3. Konfigurasi Awal Server

### 3.1 Login & Update Sistem

```bash
ssh root@YOUR_SERVER_IP

# Update sistem
apt update && apt upgrade -y

# Set timezone
timedatectl set-timezone Asia/Jakarta

# Install dasar
apt install -y git curl ufw fail2ban
```

### 3.2 Buat User Deploy (disarankan)

```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

### 3.3 Konfigurasi Firewall (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

> Jangan buka port 3000, 8000, 5432, 9000 ke publik — semua diakses internal lewat Nginx.

### 3.4 Install Docker & Docker Compose

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker deploy

# Docker Compose plugin
sudo apt install -y docker-compose-plugin

# Verifikasi
docker --version
docker compose version
```

> Logout & login ulang agar group `docker` aktif.

---

## 4. Persiapan Repository & Konfigurasi

### 4.1 Clone Repository

```bash
mkdir -p ~/apps && cd ~/apps
git clone https://github.com/GomalRajaGula/EcoFlow-AI.git ecoflow
cd ecoflow
```

### 4.2 Konfigurasi Backend (`.env`)

```bash
cd backend
cp .env.example .env
nano .env
```

Isi dengan nilai production:

```env
# Database (gunakan password yang kuat!)
DATABASE_URL=postgresql://ecoflow_user:CHANGE_ME_STRONG_PASSWORD@postgres:5432/ecoflow

# Firebase Admin SDK
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json

# JWT secret acak (generate: openssl rand -hex 32)
SECRET_KEY=GENERATE_RANDOM_HEX_32_BYTES

ENVIRONMENT=production

# Google OAuth (jika dipakai)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Production overrides — WAJIB diisi!
CORS_ORIGINS=https://app.example.com
ALLOWED_HOSTS=app.example.com,api.example.com
RATE_LIMIT=60
RATE_LIMIT_WINDOW=60
REDIS_URL=redis://redis:6379/0
RETENTION_DAYS=365
ADMIN_UIDS=firebase_uid_admin_1,firebase_uid_admin_2
```

> **Catatan penting:**
> - `DATABASE_URL` harus memakai hostname service docker `postgres`, bukan `localhost`.
> - `ALLOWED_HOSTS` dan `CORS_ORIGINS` harus berisi domain production, jika tidak request akan ditolak (TrustedHostMiddleware & CORS).

### 4.3 Upload Firebase Credentials

```bash
# Dari mesin lokal:
scp firebase-credentials.json deploy@YOUR_SERVER_IP:~/apps/ecoflow/backend/
```

Pastikan path di `.env` (`FIREBASE_CREDENTIALS_PATH`) sesuai lokasi file.

### 4.4 Konfigurasi Frontend

Frontend di-build sebagai **static export** atau dijalankan via `next start`. Lihat `frontend/.env.local`:

```bash
cd ../frontend
cp .env.example .env.local
nano .env.local
```

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
NEXT_PUBLIC_API_URL=https://api.example.com
```

> `NEXT_PUBLIC_API_URL` wajib mengarah ke domain API production (bukan `localhost`).

---

## 5. Build & Deploy Backend dengan Docker

### 5.1 Dockerfile (sudah tersedia di `backend/Dockerfile`)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 5.2 docker-compose.prod.yml (production override)

Buat file `docker-compose.prod.yml` di root repo:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: ecoflow_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ecoflow_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ecoflow
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ecoflow_user"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ecoflow_net

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ecoflow_backend
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://ecoflow_user:${POSTGRES_PASSWORD}@postgres:5432/ecoflow
      FIREBASE_CREDENTIALS_PATH: /app/firebase-credentials.json
      SECRET_KEY: ${SECRET_KEY}
      ENVIRONMENT: production
      CORS_ORIGINS: https://app.example.com
      ALLOWED_HOSTS: app.example.com,api.example.com
      MINIO_ENDPOINT: http://minio:9000
      MINIO_ACCESS_KEY: ${MINIO_ACCESS_KEY}
      MINIO_SECRET_KEY: ${MINIO_SECRET_KEY}
      MINIO_BUCKET_NAME: ecoflow-bucket
      REDIS_URL: redis://redis:6379/0
    ports:
      - "127.0.0.1:8000:8000"
    volumes:
      - ./backend/firebase-credentials.json:/app/firebase-credentials.json:ro
    depends_on:
      postgres:
        condition: service_healthy
      minio:
        condition: service_healthy
    networks:
      - ecoflow_net

  minio:
    image: minio/minio:latest
    container_name: ecoflow_minio
    restart: unless-stopped
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes:
      - minio_data:/minio_data
    command: server /minio_data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
    networks:
      - ecoflow_net

  redis:
    image: redis:7-alpine
    container_name: ecoflow_redis
    restart: unless-stopped
    networks:
      - ecoflow_net

volumes:
  postgres_data:
  minio_data:

networks:
  ecoflow_net:
```

### 5.3 Environment Production (`.env.prod`)

Buat `.env.prod` di root repo:

```bash
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD
SECRET_KEY=GENERATE_RANDOM_HEX_32_BYTES
MINIO_ACCESS_KEY=minio_production_user
MINIO_SECRET_KEY=CHANGE_ME_MINIO_PASSWORD
```

### 5.4 Deploy Backend

```bash
cd ~/apps/ecoflow

# Build & start
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Cek status
docker compose -f docker-compose.prod.yml ps
docker logs -f ecoflow_backend
```

### 5.5 Jalankan Database Migrations

```bash
docker exec -it ecoflow_backend alembic upgrade head
```

> Jalankan sekali setelah container pertama kali up. Untuk update berikutnya, jalankan ulang command ini setiap kali ada migration baru.

### 5.6 Verifikasi Backend

```bash
curl http://localhost:8000/health        # Health check endpoint
curl http://localhost:8000/docs          # Swagger UI (hanya internal)
```

---

## 6. Build & Deploy Frontend

Frontend di-build secara **standalone** dengan Next.js.

### 6.1 Production Build

```bash
cd ~/apps/ecoflow/frontend
npm ci
npm run build
```

### 6.2 Jalankan Frontend dengan systemd (disarankan)

Buat file `/etc/systemd/system/ecoflow-frontend.service`:

```ini
[Unit]
Description=EcoFlow AI Frontend (Next.js)
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/home/deploy/apps/ecoflow/frontend
ExecStart=/usr/bin/npm run start -- -p 3000
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable ecoflow-frontend
sudo systemctl start ecoflow-frontend

# Cek status
sudo systemctl status ecoflow-frontend
curl http://localhost:3000
```

---

## 7. Reverse Proxy dengan Nginx + SSL

### 7.1 Install Nginx & Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 7.2 Konfigurasi Nginx — Frontend

Buat `/etc/nginx/sites-available/ecoflow-frontend`:

```nginx
server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7.3 Konfigurasi Nginx — Backend API

Buat `/etc/nginx/sites-available/ecoflow-api`:

```nginx
server {
    listen 80;
    server_name api.example.com;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
```

### 7.4 Aktifkan Site & SSL

```bash
# Aktifkan konfigurasi
sudo ln -s /etc/nginx/sites-available/ecoflow-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/ecoflow-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test konfigurasi
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Generate SSL certificate (Let's Encrypt)
sudo certbot --nginx -d app.example.com -d api.example.com

# Test auto-renewal
sudo certbot renew --dry-run
```

> **Pastikan DNS A record untuk `app.example.com` dan `api.example.com` sudah menunjuk ke IP VPS sebelum menjalankan certbot.**

---

## 8. Health Check & Verifikasi

### 8.1 Checklist Verifikasi

```bash
# 1. Frontend dapat diakses via HTTPS
curl -I https://app.example.com

# 2. Backend dapat diakses via HTTPS
curl https://api.example.com/health

# 3. Swagger UI
curl -I https://api.example.com/docs

# 4. CORS bekerja (dari frontend)
curl -H "Origin: https://app.example.com" -I https://api.example.com/health

# 5. Database migration status
docker exec -it ecoflow_backend alembic current

# 6. MinIO healthy
curl http://localhost:9000/minio/health/live
```

### 8.2 Verifikasi Login E2E

1. Buka `https://app.example.com`
2. Login dengan akun Firebase
3. Buat batch baru → simpan
4. Tambah fermentation log → upload gambar (verifikasi MinIO)
5. Jalankan business analysis → download PDF (verifikasi report generation)

---

## 9. Backup & Restore

### 9.1 Backup Otomatis PostgreSQL (cron harian)

Buat `/home/deploy/scripts/backup_db.sh`:

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/home/deploy/backups/postgres
mkdir -p "$BACKUP_DIR"

# Dump database
docker exec ecoflow_postgres pg_dump -U ecoflow_user ecoflow | gzip > "$BACKUP_DIR/ecoflow_$TIMESTAMP.sql.gz"

# Hapus backup lebih dari 7 hari
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete
```

```bash
chmod +x /home/deploy/scripts/backup_db.sh

# Cron setiap hari 02:00
crontab -e
# 0 2 * * * /home/deploy/scripts/backup_db.sh >> /home/deploy/backups/backup.log 2>&1
```

### 9.2 Backup MinIO (object storage)

```bash
#!/bin/bash
# Gunakan mc (MinIO client) atau rclone
# Contoh dengan rclone (S3-compatible):
rclone sync minio:ecoflow-bucket /home/deploy/backups/minio/ecoflow-bucket
```

### 9.3 Restore Database

```bash
# Copy backup ke VPS lalu:
gunzip -c ecoflow_20260101_020000.sql.gz | docker exec -i ecoflow_postgres psql -U ecoflow_user ecoflow
```

### 9.4 Testing Backup (wajib rutin)

```bash
# Buat container test DB terpisah dan restore ke sana
docker run --rm --name restore_test -e POSTGRES_PASSWORD=test -d postgres:16-alpine
gunzip -c backup.sql.gz | docker exec -i restore_test psql -U postgres postgres
```

---

## 10. Rollback & Update

### 10.1 Update Aplikasi

```bash
cd ~/apps/ecoflow

# 1. Simpan versi berjalan
docker compose -f docker-compose.prod.yml --env-file .env.prod images > /home/deploy/backups/current_images.txt

# 2. Pull perubahan
git pull origin main

# 3. Rebuild backend
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build backend

# 4. Migrasi database (jika ada)
docker exec -it ecoflow_backend alembic upgrade head

# 5. Rebuild frontend
cd frontend && npm ci && npm run build
sudo systemctl restart ecoflow-frontend
```

### 10.2 Rollback Backend

```bash
# Build image sebelumnya (misal dari git tag)
git checkout v1.2.0
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build backend
git checkout main

# Atau dari image tersimpan:
docker tag ecoflow_backend:latest ecoflow_backend:rollback_broken
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --no-build
```

### 10.3 Rollback Database (dari backup)

```bash
# Restore backup terakhir yang baik
gunzip -c /home/deploy/backups/postgres/ecoflow_LATEST.sql.gz \
  | docker exec -i ecoflow_postgres psql -U ecoflow_user ecoflow
```

> **Penting:** Migrasi DB bersifat forward-only. Pastikan migration diuji di staging sebelum dijalankan di production.

---

## 11. Keamanan Production

| Area | Langkah |
|------|---------|
| SSH | Nonaktifkan password login, gunakan SSH key, ubah port default |
| fail2ban | Aktifkan untuk proteksi brute-force SSH & Nginx |
| Firewall | Hanya buka port 22, 80, 443 (lihat Section 3.3) |
| Secrets | Semua credentials di `.env.prod` — jangan pernah commit ke git |
| Container | Backend hanya bind ke `127.0.0.1`, tidak expose ke publik |
| CORS | Hanya domain production yang diizinkan |
| Backup | Backup DB harian + testing restore bulanan |
| Update | `apt update && apt upgrade` rutin (security patches) |
| Rate limiting | Aktifkan `RATE_LIMIT` di env backend |

Lihat `SECURITY_HARDENING_REPORT.md` untuk audit keamanan lengkap.

---

## 12. Troubleshooting Deployment

### 12.1 Backend tidak bisa start — database connection refused

```bash
# Cek apakah postgres healthy
docker compose -f docker-compose.prod.yml --env-file .env.prod ps

# Cek log postgres
docker logs ecoflow_postgres --tail 100
```

### 12.2 502 Bad Gateway dari Nginx

```bash
# Backend down?
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
docker logs ecoflow_backend --tail 100

# Frontend down?
sudo systemctl status ecoflow-frontend
```

### 12.3 Error CORS / Forbidden Host

```bash
# Pastikan CORS_ORIGINS & ALLOWED_HOSTS di .env backend berisi domain production
docker exec -it ecoflow_backend env | grep -E "CORS|ALLOWED"
```

### 12.4 Upload file gagal (MinIO)

```bash
docker logs ecoflow_minio --tail 100
curl http://localhost:9000/minio/health/live
```

### 12.5 SSL certificate expired

```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## 13. Referensi

- [README.md](./README.md) — Quick start development
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Arsitektur sistem
- [FIREBASE_SETUP_COMPLETE.md](./FIREBASE_SETUP_COMPLETE.md) — Setup Firebase
- [OPERATIONS.md](./OPERATIONS.md) — Runbook & troubleshooting operasional
- [SECURITY_HARDENING_REPORT.md](./SECURITY_HARDENING_REPORT.md) — Audit keamanan
- [TESTING.md](./TESTING.md) — Strategi testing
