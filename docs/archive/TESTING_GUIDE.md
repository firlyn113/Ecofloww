# TESTING_GUIDE.md: EcoFlow AI — Panduan Menulis Test

> Konvensi & best practice menulis test untuk backend (pytest) dan frontend (Playwright).
> Strategi umum ada di [TESTING.md](./TESTING.md) — dokumen ini fokus ke *cara menulis*.

---

## 1. Ringkasan Stack Testing

| Layer | Framework | Lokasi | Command |
|-------|-----------|--------|---------|
| Backend unit & integration | pytest + pytest-asyncio + httpx TestClient | `backend/tests/` | `cd backend && pytest tests/ -q` |
| Frontend lint/build | ESLint 9 + Next.js build | — | `cd frontend && npm run lint && npm run build` |
| Frontend E2E | Playwright (chromium) | `frontend/tests/e2e/` | `cd frontend && npx playwright test` |
| CI | GitHub Actions | `.github/workflows/ci.yml` | — |

---

## 2. Backend — Konvensi Test (pytest)

### 2.1 Struktur File

```
backend/tests/
├── test_eco_enzyme.py               # unit: pure service logic
├── test_fermentation_assistant.py   # unit: AI classification
├── test_ratio_api.py                # integration: API + dependency override
└── test_security.py                 # integration: headers, CORS, rate limit
```

**Naming conventions:**
- File: `test_<module>.py`
- Class: `Test<ServiceName>` (mis. `TestEcoEnzymeService`)
- Method: `test_<behavior>_<condition>` (mis. `test_classify_fermentation_failed_aroma`)
- Assert pakai kata behavior, bukan implementasi detail.

### 2.2 Tiga Jenis Test

**1. Unit test (pure logic)** — tanpa DB, tanpa HTTP:
```python
import pytest
from app.services.eco_enzyme import EcoEnzymeService

class TestEcoEnzymeService:
    def test_calculate_ingredients_basic(self):
        result = EcoEnzymeService.calculate_ingredients(10)
        assert result["ideal_water_liters"] == 30
        assert result["ideal_sugar_kg"] == 10
```

**2. Integration test API** — pakai `TestClient` + `dependency_overrides`:
```python
from fastapi.testclient import TestClient
from app.main import app
from app.core.auth import get_current_user

def fake_current_user():
    return FakeUser(id="test-user-123", email="test@example.com", name="Test User", role="user")

@pytest.fixture
def client():
    app.dependency_overrides[get_current_user] = fake_current_user
    with TestClient(app, base_url="http://localhost") as c:
        yield c
    app.dependency_overrides.clear()
```

**3. Security test** — middleware & headers:
```python
class TestSecurityHeaders:
    def test_security_headers_present(self):
        r = client.get("/")
        assert r.headers["X-Content-Type-Options"] == "nosniff"
```

### 2.3 Mocking Strategies

| Yang Dimock | Cara |
|-------------|------|
| `get_current_user` (auth) | `app.dependency_overrides[get_current_user] = fake` — **jangan pernah** mock token real |
| Firebase verify | Tidak perlu — override dependency auth sudah cukup |
| MinIO/storage | Mock `upload_file_to_storage` (async): `@pytest.mark.asyncio` + monkeypatch, atau mock `s3_client.put_object` |
| Redis | Set `REDIS_URL=""` → fallback in-memory otomatis |
| DB session | Integration test memakai DB nyata (test DB terpisah) — jangan mock SQLAlchemy |

### 2.4 Pola Assert yang Bagus

```python
# ✅ Behavioral & specific
assert status == "Normal"
assert "normally" in suggestion.lower()

# ❌ Implementasi detail
assert suggestion == "Fermentation progressing normally. Continue monitoring daily."

# ✅ Bounded range
assert 0 <= score <= 100

# ✅ Anti-regression untuk rumus
assert result["ideal_water_liters"] == waste_kg * 3
```

### 2.5 Edge Cases yang WAJIB Di-cover

| Service | Edge Cases |
|---------|-----------|
| EcoEnzyme | waste=0 atau negatif, deviasi tepat di threshold (boundary) |
| FermentationAssistant | Semua kombinasi indikator failed/caution, suhu batas 20/30°C, hari 0, hari 90+ |
| ProductRecommendation | Volume 0, intent commercial, produk di luar template (id tidak valid → score 0) |
| BusinessAnalysis | Production volume 0 (divide by zero), SRP 0, profit negatif |
| API | Payload invalid → 422, batch milik user lain → 404, resource tidak ada → 404 |

---

## 3. Frontend — Konvensi Test (Playwright)

### 3.1 Struktur

```
frontend/tests/e2e/
├── landing.spec.ts        # landing page statis
├── login.spec.ts          # login form & validasi
├── dashboard.spec.ts      # dashboard utama (auth)
├── admin.spec.ts          # dashboard admin (role)
├── auth-guard.spec.ts     # proteksi route tanpa login
└── fixtures/
    └── sample.png         # fixture upload
```

### 3.2 Prinsip E2E

1. **Test behavior user, bukan implementasi** — gunakan selector berbasis label/role (`getByRole`, `getByLabel`), **bukan** class CSS.
2. **Satu alur per test** — jangan gabung login + create batch + rekomendasi dalam satu test (kecuali smoke flow).
3. **Gunakan `page.goto('/')` dengan `baseURL` dari config** — jangan hardcode URL.
4. **Wait pada UI state, bukan sleep** — pakai `await expect(...).toBeVisible()` / `toBeEnabled()`.
5. **Rate limit exemption:** backend mengecualikan `127.0.0.1` — gunakan `http://127.0.0.1:3000` (sudah default di config).

### 3.3 Template Spec

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
  test('renders email/password and toggle states', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel('Password')).toBeVisible();
    await page.getByLabel('Password').fill('secret');
    await expect(page.getByLabel('Password')).toHaveAttribute('type', 'password');
  });
});
```

### 3.4 Menangani Flakiness

| Sumber Flaky | Solusi |
|--------------|--------|
| Animasi/modal Chakra | `await expect(modal).toBeVisible()` sebelum interaksi |
| Network latency | Timeout `expect` di config 5000ms; gunakan `--retries 2` di CI |
| Parallel workers | Config `workers: 1`, `fullyParallel: false` (state global terbagi) |
| Upload file | Gunakan fixture: `page.setInputFiles('input[type=file]', 'tests/e2e/fixtures/sample.png')` |
| Reset state antar run | Hapus localStorage token di `beforeEach` |

### 3.5 Menjalankan Test E2E

```bash
cd frontend

# Persiapan (satu kali / saat backend berubah):
# - Backend berjalan di 127.0.0.1:8000
# - DB up (docker compose up -d postgres minio)
# - User test & ADMIN_UIDS sudah diset

npx playwright test                 # semua
npx playwright test --ui            # mode interaktif
npx playwright test --debug         # step-by-step
npx playwright test --trace on      # record trace untuk debugging
npx playwright show-report          # buka report HTML
```

---

## 4. Test Data Management

### Backend
- **Unit test:** data dibuat inline di test (self-contained).
- **Integration test:** test DB terpisah (`ecoflow_test`), migration dijalankan sebelum test. **Jangan** pakai DB development.
- **Seed:** jangan bergantung pada seed otomatis di startup untuk assertion — buat data sendiri di test setup.

### Frontend E2E
- User test dengan role admin: kredensial dari fixture di `frontend/tests/e2e/fixtures/` (lihat `ADMIN_UIDS` di backend env).
- File upload: `sample.png` sebagai fixture.
- Setelah test, data test user/batch tersisa di DB — boleh dibiarkan (idempotent), atau hapus manual.

---

## 5. Coverage Requirements

| Module | Target Coverage | Prioritas |
|--------|-----------------|-----------|
| `eco_enzyme.py` | 100% branch | Wajib |
| `fermentation_assistant.py` | 100% branch (semua kombinasi status) | Wajib |
| `product_recommendation.py` | ≥ 90% (scoring & ranking) | Wajib |
| `business_analysis.py` | ≥ 90% (semua formula & edge cases) | Wajib |
| `environmental_impact.py` | 100% (pure math) | Wajib |
| `roadmap.py` | ≥ 80% (state transitions) | Disarankan |
| Routes (API) | Happy path + 404/422/401 | Disarankan |
| Security middleware | 100% (headers, CORS, rate limit) | Wajib |

**Cek coverage:**
```bash
cd backend && source venv/bin/activate
pytest tests/ --cov=app --cov-report=term-missing
```

> `pytest-cov` perlu ditambahkan ke requirements jika belum ada.

---

## 6. Test di CI (GitHub Actions)

`.github/workflows/ci.yml` menjalankan:
1. **Backend:** Python 3.14, Postgres 16 service, `alembic upgrade head`, `pytest tests/ -q`.
2. **Frontend:** Node 20, `npm ci`, `npm run lint`, `npm run build`.

**Aturan CI:**
- PR yang gagal test **tidak boleh di-merge**.
- Jangan menambahkan test yang bergantung pada service eksternal (Firebase live, MinIO) di CI.
- E2E Playwright **tidak** dijalankan di CI saat ini — hanya lokal. Jangan commit test yang broken karena env.

---

## 7. Checklist Sebelum Submit Test

```markdown
- [ ] Naming sesuai konvensi (test_<behavior>_<condition>)
- [ ] Unit test tanpa dependency eksternal
- [ ] Integration test pakai dependency_overrides untuk auth
- [ ] Edge cases di-cover (lihat Section 2.5)
- [ ] Tidak ada sleep() / hard wait
- [ ] Selector E2E berbasis role/label, bukan CSS
- [ ] `pytest tests/ -q` hijau lokal
- [ ] `npm run lint && npm run build` hijau lokal
- [ ] E2E hijau lokal (`npx playwright test`)
```

---

## 8. Referensi

- [TESTING.md](./TESTING.md) — strategi & target coverage global
- [DEVELOPMENT.md](./DEVELOPMENT.md) — menjalankan test & setup
- [E2E_TESTING_QA_PLAN.md](./E2E_TESTING_QA_PLAN.md) — skenario manual QA
- `.github/workflows/ci.yml` — pipeline CI
