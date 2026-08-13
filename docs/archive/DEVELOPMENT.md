# DEVELOPMENT.md: EcoFlow AI — Panduan Pengembangan

> Panduan setup environment development, workflow harian, debugging, dan masalah umum.
> Ini pelengkap detail dari [README.md](./README.md) (quick start).

---

## 1. Prerequisites

| Tools | Versi | Catatan |
|-------|-------|---------|
| Node.js | 20.x (LTS) | Wajib, CI pakai Node 20 |
| npm | 10+ | |
| Python | 3.11 – 3.14 | CI pakai 3.14, Docker pakai 3.11 |
| PostgreSQL | 16+ | Lokal atau via Docker |
| Git | 2.x | |
| (opsional) Docker | 24+ | Untuk DB lokal via compose |

---

## 2. Setup Development Environment

### 2.1 Clone & Dependencies

```bash
git clone https://github.com/GomalRajaGula/EcoFlow-AI.git
cd EcoFlow-AI

# Backend
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 2.2 Database Lokal (3 opsi)

**Opsi A — Docker Compose (disarankan):**
```bash
docker compose up -d postgres minio
```

**Opsi B — PostgreSQL native:**
```bash
sudo -u postgres createdb ecoflow
sudo -u postgres createuser ecoflow_user --pwprompt
# lalu set DATABASE_URL sesuai
```

**Opsi C — SQLite untuk quick test (tidak disarankan production):**
```bash
# Set DATABASE_URL=sqlite:///./ecoflow.db di .env
```

### 2.3 Environment Variables

**Backend (`backend/.env`):**
```env
DATABASE_URL=postgresql://ecoflow_user:ecoflow_password@localhost:5432/ecoflow
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
SECRET_KEY=dev-secret-key
ENVIRONMENT=development
# Opsional dev:
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
RATE_LIMIT=60
RATE_LIMIT_WINDOW=60
```

**Firebase credentials:** ambil service account JSON dari Firebase Console → Project settings → Service accounts → Generate new private key. Simpan sebagai `backend/firebase-credentials.json`.

**Frontend (`frontend/.env.local`):** salin dari `.env.example`, isi nilai `NEXT_PUBLIC_FIREBASE_*` dari Firebase Console → Project settings → General → Your apps.

### 2.4 Jalankan Migrasi

```bash
cd backend
source venv/bin/activate
alembic upgrade head
```

### 2.5 Jalankan Dev Servers

```bash
# Terminal 1 — Backend (port 8000, auto-reload)
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

Akses:
- Frontend: http://localhost:3000
- API docs (Swagger): http://localhost:8000/docs
- Health: http://localhost:8000/health

---

## 3. Rekomendasi IDE (VSCode)

### Extensions Wajib

| Extension | Fungsi |
|-----------|--------|
| Python (ms-python.python) | IntelliSense, linting, debugging |
| Pylance | Type checking Python |
| ESLint (dbaeumer.vscode-eslint) | Lint frontend |
| Playwright Test (ms-playwright.playwright) | Debug E2E tests |
| Docker | Manage containers |

### Settings yang Disarankan (`.vscode/settings.json`)

```json
{
  "python.defaultInterpreterPath": "backend/venv/bin/python",
  "python.testing.pytestEnabled": true,
  "python.testing.pytestArgs": ["backend/tests"],
  "eslint.workingDirectories": ["./frontend"],
  "files.exclude": {
    "**/__pycache__": true,
    "**/.next": true,
    "**/node_modules": true
  },
  "editor.formatOnSave": true
}
```

### Snippet Alur Kerja

1. **Backend dev:** Ctrl+Shift+P → "Python: Select Interpreter" → pilih `backend/venv`.
2. **Run single test:** buka file test → ikon play di dekorasi kode, atau `pytest path/to/test.py::TestClass::test_method`.
3. **Frontend dev:** `npm run dev`, error lint muncul di Problems panel.

---

## 4. Workflow Development Harian

```
1. git pull origin main
2. Backend: aktifkan venv, uvicorn --reload
3. Frontend: npm run dev
4. Buat branch: git checkout -b feat/xxx
5. Implementasi + test (Section 5)
6. Jalankan test & lint (Section 6)
7. Commit & push → buat PR ke main
```

> CI akan menjalankan: backend tests (pytest) + frontend lint & build. Pastikan hijau sebelum merge.

---

## 5. Menulis & Menjalankan Test

### Backend (pytest)

```bash
cd backend && source venv/bin/activate

# Semua test
pytest tests/ -q

# Satu file
pytest tests/test_fermentation_assistant.py -q

# Satu test class
pytest tests/test_eco_enzyme.py::TestEcoEnzymeService -q

# Satu test
pytest tests/test_ratio_api.py::TestCheckIngredientRatio::test_exact_ratio_no_warning

# Dengan verbose
pytest tests/ -v
```

**Struktur test yang ada:**
| File | Cakupan |
|------|---------|
| `test_eco_enzyme.py` | Unit test rasio bahan & deviasi |
| `test_fermentation_assistant.py` | Unit test klasifikasi AI, health score, harvest alert |
| `test_ratio_api.py` | Integration test API (TestClient + dependency override) |
| `test_security.py` | Security headers, CORS, TrustedHost, rate limit |

### Frontend (E2E Playwright)

```bash
cd frontend

# Jalankan semua E2E (butuh backend & DB berjalan, lihat catatan)
npx playwright test

# Satu spec
npx playwright test tests/e2e/login.spec.ts

# Mode UI/debug
npx playwright test --ui
npx playwright test --debug

# Dengan trace
npx playwright test --trace on
```

**Setup E2E membutuhkan:**
- Backend berjalan di `http://127.0.0.1:8000`
- PostgreSQL running (docker compose)
- Firebase credentials valid
- Test user dengan role admin (lihat `frontend/tests/e2e/fixtures/`)

> **Loopback rate-limit exemption:** client IP `127.0.0.1` dikecualikan dari rate limiter di backend — E2E aman dari 429.

---

## 6. Lint & Typecheck

```bash
# Frontend lint
cd frontend && npm run lint

# Frontend build (termasuk typecheck Next.js)
cd frontend && npm run build

# Backend: tidak ada lint config terpisah; gunakan:
cd backend && source venv/bin/activate
python -m compileall app/ -q      # cek syntax
# (opsional jika terinstall) ruff check app/ tests/
```

---

## 7. Migrasi Database (Alembic)

### Buat Migration Baru

```bash
cd backend && source venv/bin/activate

# Setelah mengubah model di app/models/base.py:
alembic revision --autogenerate -m "deskripsi_perubahan"

# Review file yang dibuat di alembic/versions/ — JANGAN langsung apply
# Jalankan hanya setelah direview:
alembic upgrade head
```

### Rollback Migration

```bash
# Turun satu step
alembic downgrade -1

# Turun ke rev tertentu
alembic downgrade <revision_id>
```

### Tips

- Satu PR = satu migration (idealnya).
- Migration yang sudah di-production **jangan diubah** — buat migration baru.
- Naming convention: `add_xxx_to_table` / `create_table_xxx`.

---

## 8. Database Seeding

Backend otomatis me-seed **8 product templates** saat startup jika tabel kosong (lihat `app/main.py:151`).

Seed data tambahan (user, batch demo) belum ada tooling otomatis — bisa dibuat manual via:
```python
# backend/scripts/seed_demo.py (contoh, belum ada di repo)
from app.core.database import SessionLocal
from app.models.base import User
db = SessionLocal()
db.add(User(id="demo-uid", email="demo@example.com", name="Demo User", role="user"))
db.commit()
```

---

## 9. Debugging Tips

### Backend

| Masalah | Cara Debug |
|---------|-----------|
| Request error → traceback | Lihat log uvicorn di terminal (logging module + `logger.error(exc_info=True)`) |
| 401 Unauthorized | Cek token Firebase valid: `firebase_admin.auth.verify_id_token(token)` di shell |
| 422 Validation Error | Cek payload vs Pydantic schema di `app/schemas/base.py` |
| DB error | `docker logs ecoflow_postgres --tail 50` |
| SQLAlchemy query | Aktifkan echo: `engine = create_engine(url, echo=True)` sementara |
| Test gagal hanya di CI | Cek env di `.github/workflows/ci.yml` vs `.env` lokal |

### Frontend

| Masalah | Cara Debug |
|---------|-----------|
| API error | Network tab di DevTools; cek `apiClient` interceptor di `lib/api.ts` |
| Auth aneh | `localStorage` firebase token; logout → login ulang |
| 401 dari API | Cek `NEXT_PUBLIC_API_URL` & CORS di backend env |
| E2E flaky | `npx playwright test --trace on`, buka trace report HTML |
| Build error | `npm run build` untuk lihat typecheck error lengkap |

### Tools Bantu

```bash
# Log backend dengan format readable
uvicorn app.main:app --reload --log-level debug

# Inspect DB via psql
docker exec -it ecoflow_postgres psql -U ecoflow_user ecoflow

# Test API manual (curl)
curl -X POST http://localhost:8000/api/v1/check-ingredient-ratio \
  -H "Content-Type: application/json" \
  -d '{"waste_kg":10,"water_liters":30,"sugar_kg":10}'
```

---

## 10. Masalah Umum & Solusi

### 10.1 `ImportError: firebase_admin` saat run test

Test membutuhkan file `firebase-credentials.json` (walaupun fake). Sediakan dummy:
```bash
cd backend
echo '{}' > firebase-credentials.json
```
> Firebase init hanya print warning jika credential invalid — tidak crash.

### 10.2 Alembic gagal koneksi DB

```bash
# Pastikan DATABASE_URL di .env benar & DB up
docker compose up -d postgres
docker exec -it ecoflow_postgres pg_isready -U ecoflow_user
```

### 10.3 `npm install` error EACCES (Linux)

```bash
# Jangan pakai sudo. Perbaiki permission:
sudo chown -R $(whoami) ~/.npm
```

### 10.4 Port 3000/8000 sudah terpakai

```bash
# Jalankan di port lain
cd frontend && npm run dev -- -p 3001
uvicorn app.main:app --port 8001

# Atau matikan proses pemakai port
lsof -i :3000
kill <PID>
```

### 10.5 CORS error di browser (frontend→backend)

- Cek `CORS_ORIGINS` di `backend/.env` mengandung `http://localhost:3000` (atau port yang dipakai).
- Restart backend setelah ubah `.env`.
- Untuk port frontend lain (mis. 3001), tambahkan ke CORS list.

### 10.6 E2E test gagal karena admin user tidak ada

- Pastikan `ADMIN_UIDS` di backend `.env` berisi UID test admin.
- Cek `frontend/tests/e2e/fixtures/` untuk kredensial test user.

### 10.7 Migration autogenerate tidak mendeteksi perubahan

- Pastikan model baru di-import di `alembic/env.py` (daftar import `app.models.base`).
- Restart terminal (env cache).

---

## 11. Referensi

- [README.md](./README.md) — quick start
- [TESTING.md](./TESTING.md) — strategi testing global
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) — cara menulis test
- [DEPLOYMENT.md](./DEPLOYMENT.md) — deployment production
- [API.md](./API.md) — endpoint reference
