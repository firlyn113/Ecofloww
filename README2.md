# EcoFlow - README 2

Panduan menjalankan proyek EcoFlow di berbagai platform.

## 1) Persiapan Umum

Pastikan kamu sudah menyiapkan:
- Node.js 20+ dan npm
- Python 3.11+
- PostgreSQL
- Redis
- MinIO
- File environment:
  - `frontend/.env.local`
  - `backend/.env`

Contoh variabel penting:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `FIREBASE_CREDENTIALS_PATH`
- `DATABASE_URL`
- `MINIO_ENDPOINT`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET_NAME`

## 2) Menjalankan Backend

Masuk ke folder backend, lalu install dependency dan jalankan server.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Jika memakai Windows, aktifkan virtual environment dengan:

```powershell
.venv\Scripts\activate
```

## 3) Menjalankan Frontend

Masuk ke folder frontend, install dependency, lalu jalankan Next.js.

```bash
cd frontend
npm install
npm run dev
```

Buka:
- Frontend: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`

## 4) Windows

### Opsi Command Prompt / PowerShell

1. Buka terminal di folder project.
2. Jalankan backend:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3. Buka terminal baru untuk frontend:

```powershell
cd frontend
npm install
npm run dev
```

4. Akses aplikasi di browser:
- `http://localhost:3000`

## 5) Linux

### Opsi Terminal

1. Buka terminal.
2. Jalankan backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3. Buka terminal baru untuk frontend:

```bash
cd frontend
npm install
npm run dev
```

4. Akses aplikasi di browser:
- `http://localhost:3000`

## 6) macOS

### Opsi Terminal

1. Buka Terminal.
2. Jalankan backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3. Buka Terminal baru untuk frontend:

```bash
cd frontend
npm install
npm run dev
```

4. Akses aplikasi di browser:
- `http://localhost:3000`

## 7) Mobile

### Akses via HP

1. Jalankan backend dan frontend di komputer/laptop yang sama jaringan Wi-Fi.
2. Cari IP lokal komputer, misalnya `192.168.1.10`.
3. Buka frontend dari HP dengan alamat:

```text
http://192.168.1.10:3000
```

4. Jika backend tidak bisa diakses dari HP, jalankan backend dengan host `0.0.0.0`.
5. Untuk PWA, buka menu browser lalu pilih **Add to Home Screen** / **Install App**.

### Catatan
- Pastikan firewall mengizinkan port `3000` dan `8000`.
- Gunakan jaringan yang sama antara HP dan komputer.

## 8) Build Production

### Frontend

```bash
cd frontend
npm run build
npm run start
```

### Backend

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 9) Halaman Penting

- Dashboard: `/dashboard`
- Batch: `/dashboard/batches`
- Komunitas: `/dashboard/community`
- Perbandingan batch: `/dashboard/compare`
- Pengaturan: `/dashboard/settings`
- Login: `/login`

## 10) Cek Kalau Ada Error

Jika aplikasi gagal jalan, cek:
- `.env` belum terisi
- PostgreSQL belum aktif
- Redis belum aktif
- MinIO belum aktif
- Firebase credentials belum tersedia
- Port `3000` atau `8000` sedang dipakai aplikasi lain
