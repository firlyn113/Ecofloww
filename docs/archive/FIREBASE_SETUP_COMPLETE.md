# Firebase Configuration Guide

Panduan lengkap untuk mengkonfigurasi Firebase di EcoFlow-AI (Frontend + Backend).

---

## PART 1: FRONTEND Setup

### 1.1 Buka Firebase Console
- Kunjungi: https://console.firebase.google.com
- Login dengan akun Google Anda

### 1.2 Buat atau Pilih Project
- Klik "Create Project" atau pilih project yang sudah ada
- Nama: "EcoFlow-AI" (atau nama pilihan Anda)
- Lanjutkan proses pembuatan

### 1.3 Daftarkan Web App
- Di halaman project overview, cari bagian "Get started by adding Firebase to your app"
- Klik icon `</>` (Web)
- Nama app: "ecoflow-web"
- Klik "Register app"

### 1.4 Copy Firebase Config
Firebase akan menampilkan code seperti:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD_xxxxxxxxxxxx_xxxxx",
  authDomain: "ecoflow-ai.firebaseapp.com",
  projectId: "ecoflow-ai",
  storageBucket: "ecoflow-ai.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefg123456"
};
```

### 1.5 Isi Environment Variables

**File:** `frontend/.env.local`

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD_xxxxxxxxxxxx_xxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ecoflow-ai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ecoflow-ai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ecoflow-ai.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdefg123456

NEXT_PUBLIC_API_URL=http://localhost:8000
```

**PENTING:**
- Ganti nilai `YOUR_*` dengan nilai dari Firebase Config
- File `.env.local` sudah ada, tinggal isi nilainya
- **Jangan** commit `.env.local` ke git (sudah di `.gitignore`)

### 1.6 Aktifkan Email/Password Authentication
- Di Firebase Console: **Authentication** → **Sign-in method**
- Cari "Email/Password"
- Klik tombol untuk **Enable**
- Klik **Save**

### 1.7 Restart Frontend
```bash
cd frontend
npm run dev
```

Akses: http://localhost:3000

---

## PART 2: BACKEND Setup

### 2.1 Download Service Account Key dari Firebase

**Di Firebase Console:**
- Pergi ke: **Project Settings** (icon gear di kiri atas) → **Service Accounts**
- Tab "Firebase Admin SDK"
- Klik tombol **"Generate New Private Key"**
- File JSON akan ter-download otomatis

### 2.2 Letakkan Credentials di Backend

**File:** `backend/firebase-credentials.json`

Salin isi JSON yang ter-download ke file ini:

```json
{
  "type": "service_account",
  "project_id": "ecoflow-ai",
  "private_key_id": "xxxx...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@ecoflow-ai.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/..."
}
```

### 2.3 Konfigurasi Backend Environment

**File:** `backend/.env`

```
DATABASE_URL=postgresql://ecoflow_user:ecoflow_password@localhost:5432/ecoflow
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
SECRET_KEY=dev-secret-key-not-for-production
ENVIRONMENT=development
```

**PENTING:**
- `FIREBASE_CREDENTIALS_PATH` harus menunjuk ke file JSON yang benar
- File `.env` sudah ada, pastikan nilainya sesuai
- **Jangan** commit `firebase-credentials.json` ke git (sudah di `.gitignore`)

### 2.4 Verifikasi Backend Setup

```bash
cd backend
source venv/bin/activate
python -m pytest tests/ -q
```

Seharusnya semua test pass (20 passed).

---

## PART 3: Testing End-to-End

### 3.1 Jalankan Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

Backend akan jalan di: `http://localhost:8000`

### 3.2 Jalankan Frontend
```bash
cd frontend
npm run dev
```

Frontend akan jalan di: `http://localhost:3000`

### 3.3 Test Sign Up / Sign In
1. Buka http://localhost:3000
2. Klik "Sign Up" atau "Sign In"
3. Masukkan email dan password
4. Klik tombol untuk authenticate
5. Jika berhasil, redirect ke `/dashboard`

---

## Troubleshooting

### Error: "Firebase: Error (auth/api-key-not-valid...)"
- Pastikan `NEXT_PUBLIC_FIREBASE_API_KEY` benar di `.env.local`
- Restart dev server setelah mengubah `.env.local`
- Cek di Firebase Console apakah API Key sudah valid

### Error: "Firebase initialization warning..."
- Pastikan file `firebase-credentials.json` ada di backend root
- Pastikan path di `.env` benar: `FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json`

### Token verification failed di backend
- Pastikan Email/Password authentication sudah diaktifkan di Firebase Console
- Pastikan service account key (firebase-credentials.json) sudah ter-download dengan benar

### Database connection error
- Backend menggunakan PostgreSQL: `postgresql://ecoflow_user:ecoflow_password@localhost:5432/ecoflow` (lihat `docker-compose.yml`)
- Jika `alembic upgrade head` gagal, pastikan container PostgreSQL berjalan (`docker compose up -d db`)

---

## Security Notes

⚠️ **JANGAN pernah commit:**
- `firebase-credentials.json` (service account key)
- `.env.local` (API keys)
- `.env` (secrets)

✅ **Sudah di `.gitignore`:**
- `firebase-credentials.json`
- `.env*`
- Database files (`*.db`)

---

## Next Steps

1. ✅ Isi `frontend/.env.local` dengan Firebase config
2. ✅ Copy `firebase-credentials.json` ke backend root
3. ✅ Aktifkan Email/Password auth di Firebase Console
4. ✅ Restart dev servers (backend dan frontend)
5. ✅ Test Sign Up/Sign In di http://localhost:3000
