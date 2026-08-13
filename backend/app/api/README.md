# Backend Routes — Dokumentasi Struktur

> Dokumentasi organisasi route di `backend/app/routes/`.
> Untuk detail payload request/response per endpoint, lihat `API.md` di root repo.

---

## 1. Organisasi Router

Semua router di-register di `app/main.py`:

```python
app.include_router(rec_router)      # routes/recommendations.py — prefix /api/v1
app.include_router(impact_router)   # routes/impact.py        — prefix /api/v1
app.include_router(roadmap_router)  # routes/roadmap.py       — prefix /api/v1
app.include_router(admin_router)    # routes/admin.py         — prefix /api/v1/admin
app.include_router(users_router)    # routes/users.py         — prefix /api/v1/users
```

| File | Prefix | Tags (Swagger) | Tanggung Jawab |
|------|--------|----------------|----------------|
| `recommendations.py` | `/api/v1` | recommendations | Rekomendasi produk, business analysis, dashboard, ratio check |
| `impact.py` | `/api/v1` | impact | Dampak lingkungan (user & batch) |
| `roadmap.py` | `/api/v1` | roadmap | Generate/track roadmap & download PDF |
| `admin.py` | `/api/v1/admin` | admin | CRUD komunitas, template produk, statistik, user roles |
| `users.py` | `/api/v1/users` | users | Profil user (get/update) |

Endpoint utama non-router (`app/main.py`):
- `POST /api/v1/batches` — buat batch baru
- `GET /api/v1/batches` — list batch user
- `GET /api/v1/batches/{batch_id}` — detail batch
- `POST /api/v1/batches/{batch_id}/logs` — catat fermentation log (+ AI klasifikasi)
- `GET /api/v1/batches/{batch_id}/logs` — list log batch
- `POST /api/v1/upload` — upload gambar (JPEG/PNG/WebP, max 5MB)
- `GET /health` — health check (tanpa auth)

---

## 2. Autentikasi & Middleware

### Alur Auth (`core/auth.py`)

```
Request → HTTPBearer (extract Bearer token)
        → verify_token(token) di core/firebase.py (Firebase Admin SDK)
        → user_id = decoded.uid
        → Cari/auto-create User di DB (role "admin" jika UID ada di ADMIN_UIDS)
        → return current_user
```

- **Semua endpoint `/api/v1/*`** memerlukan `Authorization: Bearer <firebase_id_token>` kecuali `/health`.
- Token diverifikasi dengan **Firebase Admin SDK** — tidak ada JWT buatan sendiri.
- User pertama kali login akan **auto-register** di tabel `users` dengan role default `user`.

### Role & Otorisasi

| Role | Level Akses |
|------|-------------|
| `user` | Hanya data miliknya sendiri |
| `admin` | Akses admin (dari `ADMIN_UIDS` env atau di-set manual) |
| `community_admin` | Admin untuk satu komunitas (scope ke `community_id` sendiri) |
| `platform_admin` | Akses semua komunitas |

`require_role(*roles)` dependency di `core/auth.py:53`:
```python
Depends(require_role("admin", "platform_admin"))
```
→ Return 403 "Insufficient permissions" jika role user tidak termasuk.

**Catatan:** Role di-upgrade otomatis ke `admin` saat login jika UID ada di env `ADMIN_UIDS`.

### Endpoint Publik

| Endpoint | Keterangan |
|----------|------------|
| `GET /health` | Health check, tanpa auth |

---

## 3. Error Handling Patterns

### Response Error Standar

Semua error berbentuk `HTTPException` yang di-render FastAPI:

```json
{
  "detail": "Batch not found"
}
```

### Kode Status yang Digunakan

| Status | Arti | Contoh |
|--------|------|--------|
| 400 | Request invalid | "Invalid input parameters", "Roadmap already exists for this batch" |
| 401 | Token invalid/expired | "Invalid authentication claims" |
| 403 | Role tidak cukup | "Insufficient permissions" |
| 404 | Resource tidak ada | "Batch not found", "Product template not found" |
| 409 | Konflik | "Community already exists" |
| 413 | File terlalu besar | "File too large (max 5MB)" |
| 429 | Rate limit | "Rate limit exceeded" |
| 500 | Internal error | "Failed to create batch" |

### Pola Try/Except

```python
try:
    # business logic
except ValueError as e:
    raise HTTPException(status_code=400, detail=str(e))   # error validasi bisnis
except HTTPException:
    raise                                                # re-raise auth/404
except Exception as e:
    logger.error(f"...", exc_info=True)
    raise HTTPException(status_code=500, detail="...")   # jangan expose detail internal
```

### Batch Ownership Check (pola penting)

Setiap endpoint yang mengakses batch user **wajib** memfilter `user_id == current_user.id`:

```python
batch = db.query(FermentationBatch).filter(
    FermentationBatch.id == batch_id,
    FermentationBatch.user_id == current_user.id
).first()
```

Ini mencegah horizontal privilege escalation (user A mengakses batch milik user B).

---

## 4. Rate Limiting

Diterapkan di middleware `app/main.py:76` (bukan per-route):

| Konfigurasi | Env | Default |
|-------------|-----|---------|
| Max requests | `RATE_LIMIT` | 60 |
| Window (detik) | `RATE_LIMIT_WINDOW` | 60 |
| Backend | `REDIS_URL` | in-memory (fallback) |

Aturan:
- Key per IP client (`ratelimit:ip:{client_ip}`).
- Loopback (`127.0.0.1`, `::1`, `localhost`) **dikecualikan** (untuk E2E tests).
- Redis digunakan jika `REDIS_URL` ter-set & reachable, jika gagal → fallback in-memory per-proses.
- Response 429: `{"detail": "Rate limit exceeded"}`.

---

## 5. Validasi Request

- Semua request body adalah Pydantic model (definisi inline di masing-masing route file atau di `schemas/base.py`).
- Konvensi naming: `XxxRequest` di route file, `XxxCreate`/`XxxUpdate` untuk model DB di `schemas/base.py`.
- Validasi dasar: `Field(min_length=..., max_length=...)`, `ge=` untuk angka, tipe enum via Literal bila perlu.
- File upload divalidasi di `main.py:upload_image`: MIME type (jpeg/png/webp), size ≤ 5MB, extension whitelist.

---

## 6. Response Format

Semua endpoint (kecuali download file) mengembalikan `APIResponse`:

```json
{
  "status": "success",
  "message": "optional",
  "data": { }
}
```

File download endpoints mengembalikan raw content:
- **PDF:** `media_type="application/pdf"` + `Content-Disposition: attachment; filename="..."`
- **CSV:** `media_type="text/csv"` + `Content-Disposition: attachment; filename="community-compliance-report.csv"`

---

## 7. Menambahkan Route Baru

1. Buat `APIRouter` dengan prefix yang sesuai (ikuti pattern di atas).
2. Gunakan `Depends(get_current_user)` untuk auth — **jangan pernah** mem-bypass.
3. Gunakan `Depends(get_db)` untuk session — jangan buat session manual.
4. Jika hanya untuk role tertentu, gunakan `Depends(require_role("admin", ...))`.
5. Filter ownership (batch milik user) jika akses data per-user.
6. Balut business logic dengan try/except sesuai Section 3.
7. Register router di `app/main.py` (`app.include_router(...)`).
8. Dokumentasikan endpoint di `API.md`.
