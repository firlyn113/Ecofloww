# DATA_DICTIONARY.md: EcoFlow AI — Data Dictionary

> Referensi lengkap setiap tabel, kolom, business rules, dan relasi di database.
> Skema SQL resmi: `backend/app/models/base.py` + migrasi Alembic (`backend/alembic/versions/`).
> Lihat juga `DATABASE.md` untuk ERD dan gambaran umum.

---

## 1. Ringkasan Tabel

| Tabel | Model Class | Deskripsi | Relasi Keluar |
|-------|-------------|-----------|---------------|
| `communities` | `Community` | Komunitas/kelompok pengguna | → `users` |
| `users` | `User` | Pengguna terdaftar | → `communities`, `fermentation_batches`, `roadmap_progress` |
| `fermentation_batches` | `FermentationBatch` | Batch fermentasi eco-enzyme | → `users`, `product_templates`, `fermentation_logs`, `product_recommendations` |
| `fermentation_logs` | `FermentationLog` | Log observasi harian fermentasi | → `fermentation_batches` |
| `product_templates` | `ProductTemplate` | Template produk turunan eco-enzyme | → `fermentation_batches`, `product_recommendations`, `roadmap_progress` |
| `product_recommendations` | `ProductRecommendation` | Hasil rekomendasi & analisis bisnis per batch | → `fermentation_batches`, `product_templates` |
| `roadmap_progress` | `RoadmapProgress` | Progress roadmap pengolahan produk | → `users`, `fermentation_batches`, `product_templates` |

---

## 2. Tabel: `communities`

Kolom yang dihasilkan: **auto** (timestamps).

| Kolom | Tipe | Nullable | Default | Deskripsi |
|-------|------|----------|---------|-----------|
| `id` | Integer | NO (PK, auto-increment) | — | ID unik komunitas |
| `name` | String | NO (**unique**) | — | Nama komunitas (1–120 char, validasi schema) |
| `region` | String | YES (**index**) | — | Wilayah/daerah komunitas (≤120 char) |
| `created_at` | DateTime | NO | `utcnow` | Waktu dibuat |
| `updated_at` | DateTime | NO | `utcnow` (onupdate) | Waktu terakhir diubah |

**Business Rules:**
- Nama harus unik → conflict → HTTP 409 "Community already exists".
- Tidak ada cascade delete dari relasi ini (user dengan `community_id` tidak ikut terhapus).

---

## 3. Tabel: `users`

| Kolom | Tipe | Nullable | Default | Deskripsi |
|-------|------|----------|---------|-----------|
| `id` | String | NO (PK) | — | Firebase UID dari token auth |
| `email` | String | YES (**unique**, index) | — | Email pengguna (3–254 char) |
| `name` | String | YES | — | Nama pengguna (1–100 char) |
| `phone` | String | YES | — | Nomor telepon (≤30 char) |
| `role` | String | NO | `"user"` | Role akses: `user` / `admin` / `community_admin` / `platform_admin` |
| `community_id` | Integer FK → `communities.id` | YES (**index**) | — | Komunitas milik user |
| `waste_diverted_kg` | Float | NO | `0.0` | Akumulasi sampah yang dialihkan (kg), bertambah saat create batch |
| `created_at` | DateTime | NO | `utcnow` | Waktu dibuat |
| `updated_at` | DateTime | NO | `utcnow` (onupdate) | Waktu terakhir diubah |

**Business Rules:**
- `id` = Firebase UID, auto-created pada login pertama (`get_current_user`).
- Role auto-upgrade ke `admin` saat login jika UID ada di env `ADMIN_UIDS`.
- `waste_diverted_kg` di-increment dengan `waste_weight_kg` setiap create batch (`main.py:192`).
- Valid role list: `("user", "admin", "community_admin", "platform_admin")` — enforced di `PATCH /api/v1/admin/users/{user_id}/role`.

---

## 4. Tabel: `fermentation_batches`

| Kolom | Tipe | Nullable | Default | Deskripsi |
|-------|------|----------|---------|-----------|
| `id` | Integer | NO (PK, auto-increment) | — | ID batch |
| `user_id` | String FK → `users.id` | NO | — | Pemilik batch |
| `name` | String | NO | — | Nama batch (1–100 char) |
| `status` | String | NO | `"pending"` | Status lifecycle batch (lihat di bawah) |
| `waste_weight_kg` | Float | NO | — | Berat sampah organik (kg). Validasi: `> 0`, `≤ 100000` |
| `water_liters` | Float | NO | — | Air (L). Dihitung otomatis = 3× waste |
| `sugar_kg` | Float | NO | — | Gula (kg). Dihitung otomatis = 1× waste |
| `start_date` | DateTime | NO | — | Tanggal mulai fermentasi |
| `harvest_date` | DateTime | YES | — | Tanggal panen harapan = start + 90 hari |
| `final_volume_liters` | Float | YES | — | Volume panen final (liter) — diisi saat rekomendasi |
| `final_color` | String | YES | — | Warna akhir liquid — diisi saat rekomendasi |
| `final_aroma_intensity` | String | YES | — | Intensitas aroma akhir — diisi saat rekomendasi |
| `selected_product_id` | Integer FK → `product_templates.id` | YES | — | Produk yang dipilih user |
| `created_at` | DateTime | NO | `utcnow` | Waktu dibuat |
| `updated_at` | DateTime | NO | `utcnow` (onupdate) | Waktu terakhir diubah |

### Status Lifecycle Batch

| Status | Set Kapan | Transition |
|--------|-----------|------------|
| `pending` | Default model | — |
| `pending_start` | Create batch (API) | → `in_progress` saat log pertama |
| `in_progress` | Log fermentasi pertama | → `harvested` saat rekomendasi |
| `harvested` | Rekomendasi produk dibuat | — |

**Business Rules:**
- `water_liters` / `sugar_kg` tidak boleh diisi manual user — dihitung oleh `EcoEnzymeService.calculate_ingredients()` (rasio 1:3:10).
- Ownership: semua akses harus `user_id == current_user.id` (anti privilege escalation).

---

## 5. Tabel: `fermentation_logs`

| Kolom | Tipe | Nullable | Default | Deskripsi |
|-------|------|----------|---------|-----------|
| `id` | Integer | NO (PK, auto-increment) | — | ID log |
| `batch_id` | Integer FK → `fermentation_batches.id` | NO | — | Batch terkait |
| `log_date` | DateTime | NO | — | Tanggal pencatatan observasi |
| `aroma` | String | NO | — | Aroma (1–50 char). Valid values lihat di bawah |
| `color` | String | NO | — | Warna (1–50 char). Valid values lihat di bawah |
| `gas_presence` | Boolean | NO | — | Ada gelembung gas atau tidak |
| `temperature_c` | Float | NO | — | Suhu (°C). Validasi: `-50` s.d. `100` |
| `notes` | Text | YES | — | Catatan user (≤2000 char) |
| `image_url` | String | YES | — | URL foto di MinIO (≤500 char) |
| `ai_status` | String | YES | — | Hasil AI: `Normal` / `Caution` / `Failed` |
| `ai_confidence` | Float | YES | — | Confidence AI: 0.7–0.9 |
| `ai_suggestion` | Text | YES | — | Saran korektif dari AI |
| `created_at` | DateTime | NO | `utcnow` | Waktu dibuat |

### Enumerasi Valid Input (dipakai AI classification)

**Aroma:**
| Kategori | Nilai |
|----------|-------|
| Normal | `sweet`, `sour` |
| Caution | `slightly_rotten`, `unusual` |
| Failed | `strongly_rotten`, `moldy` |

**Warna:**
| Kategori | Nilai |
|----------|-------|
| Normal | `brown`, `dark_brown`, `amber` |
| Caution | `unexpected_shift`, `unusual` |
| Failed | `black`, `green`, `white_mold` |

> Catatan: Validasi enum tidak strict di schema (string bebas ≤50 char) — AI mengklasifikasikan berdasarkan list di atas, nilai lain dianggap unknown.

**Business Rules:**
- `ai_*` fields diisi otomatis oleh `FermentationAssistantService.classify_fermentation()`.
- `incubation_day` dihitung = `log_date - batch.start_date` (bukan kolom tersimpan).
- Log pertama mengubah status batch → `in_progress`.

---

## 6. Tabel: `product_templates`

| Kolom | Tipe | Nullable | Default | Deskripsi |
|-------|------|----------|---------|-----------|
| `id` | Integer | NO (PK, auto-increment) | — | ID template |
| `name` | String | NO (**unique**, index) | — | Nama produk (1–120 char) |
| `description` | Text | NO | — | Deskripsi (1–2000 char) |
| `processing_instructions` | Text | NO | — | Instruksi pengolahan (1–5000 char) |
| `ingredients` | JSON (List[str]) | NO | `[]` | Daftar bahan (max 50 items) |
| `equipment` | JSON (List[str]) | NO | `[]` | Daftar peralatan (max 50 items) |
| `time_estimate_hours` | Float | NO | — | Estimasi waktu (jam). Validasi: `> 0`, `≤ 10000` |
| `safety_warnings` | Text | NO | — | Peringatan keamanan (1–2000 char) |
| `base_compatibility_score` | Float | NO | `0.5` | Skor kompatibilitas dasar (0–1) |
| `ideal_ph_min` | Float | YES | — | pH ideal minimum (untuk rekomendasi) |
| `ideal_ph_max` | Float | YES | — | pH ideal maksimum |
| `ideal_aroma` | String | YES | — | Aroma ideal |
| `ideal_color` | String | YES | — | Warna ideal |
| `tutorial_url` | String | YES | — | Link tutorial (≤500 char), dipakai QR code di PDF |
| `regional_average_price` | Float | YES | — | Harga pasar regional (≥ 0), untuk SRP calculation |
| `created_at` | DateTime | NO | `utcnow` | Waktu dibuat |
| `updated_at` | DateTime | NO | `utcnow` (onupdate) | Waktu terakhir diubah |

**Business Rules:**
- 8 template default di-seed otomatis saat startup jika tabel kosong (`main.py:151`).
- Nama unik → duplicate → HTTP 409.
- `ideal_ph`/`ideal_aroma`/`ideal_color` dipakai `ProductRecommendationService.calculate_compatibility()`.
- `regional_average_price` di-update batch via `POST /api/v1/admin/product-templates/import-pricing`.

---

## 7. Tabel: `product_recommendations`

| Kolom | Tipe | Nullable | Default | Deskripsi |
|-------|------|----------|---------|-----------|
| `id` | Integer | NO (PK, auto-increment) | — | ID rekomendasi |
| `batch_id` | Integer FK → `fermentation_batches.id` | NO (**index**) | — | Batch terkait (1-to-1) |
| `recommended_products_json` | JSON | NO | — | Array hasil ranking produk (top 8) |
| `selected_product_id` | Integer FK → `product_templates.id` | YES | — | Produk yang dipilih user |
| `selection_date` | DateTime | YES | — | Kapan user memilih produk |
| `is_commercial_orientation` | Boolean | NO | `False` | Intent user: komersial atau household |
| `business_analysis_json` | JSON | YES | — | Hasil lengkap analisis bisnis |
| `created_at` | DateTime | NO | `utcnow` | Waktu dibuat |
| `updated_at` | DateTime | NO | `utcnow` (onupdate) | Waktu terakhir diubah |

### Struktur `recommended_products_json` (per item)

```json
{
  "product_id": 1,
  "name": "Household Cleaner",
  "compatibility_score": 87.5,
  "description": "...",
  "processing_instruction_summary": "..."
}
```

### Struktur `business_analysis_json`

```json
{
  "cogs_per_liter": 12000.0,
  "suggested_retail_price": 18000.0,
  "gross_margin_per_liter": 6000.0,
  "gross_margin_percentage": 33.33,
  "total_revenue": 1800000.0,
  "total_gross_profit": 600000.0,
  "break_even_units_liters": 200.0,
  "break_even_revenue": 3600000.0,
  "monthly_revenue": 150000.0,
  "monthly_net_profit": 50000.0,
  "yearly_net_profit": 600000.0,
  "breakeven_months": 12.0,
  "sensitivity_analysis": {
    "base_case": 600000.0,
    "pessimistic": 540000.0,
    "optimistic": 660000.0,
    "variance_percentage": 10.0
  },
  "viability_rating": "Viable"
}
```

**Business Rules:**
- Satu batch = satu rekomendasi (uselist=False). Create kedua → update row existing.
- `selection_date` set saat `POST /batches/{id}/select-product`.
- Nilai uang dalam **Rupiah** (konvensi aplikasi).

---

## 8. Tabel: `roadmap_progress`

| Kolom | Tipe | Nullable | Default | Deskripsi |
|-------|------|----------|---------|-----------|
| `id` | Integer | NO (PK, auto-increment) | — | ID roadmap |
| `batch_id` | Integer FK → `fermentation_batches.id` | NO (**index**) | — | Batch terkait |
| `product_template_id` | Integer FK → `product_templates.id` | NO (**index**) | — | Produk yang diolah |
| `user_id` | String FK → `users.id` | NO (**index**) | — | Pemilik roadmap |
| `steps_json` | JSON | NO | `[]` | Daftar step roadmap |
| `current_step` | Integer | NO | `0` | Step aktif (0-indexed) |
| `status` | String | NO | `"not_started"` | `not_started` / `in_progress` / `completed` |
| `started_at` | DateTime | YES | — | Set saat step pertama dicentang |
| `completed_at` | DateTime | YES | — | Set saat semua step selesai |
| `created_at` | DateTime | NO | `utcnow` | Waktu dibuat |
| `updated_at` | DateTime | NO | `utcnow` (onupdate) | Waktu terakhir diubah |

### Struktur `steps_json` (per step)

```json
{
  "title": "Dilution",
  "description": "Dilute 1:10 with water.",
  "details": "Mix the eco-enzyme with water properly.",
  "completed": false
}
```

**Business Rules:**
- Satu batch hanya boleh punya 1 roadmap → duplicate → HTTP 400 "Roadmap already exists for this batch".
- `update_step_status` mengelola transisi status otomatis (lihat `services/roadmap.py`).

---

## 9. Konvensi Umum & Catatan

1. **Timestamps:** semua `DateTime` disimpan UTC (`utcnow()` = `datetime.now(timezone.utc)`).
2. **Harga:** dalam Rupiah, float 2 desimal.
3. **JSON columns:** tidak ada validation DB-level — struktur divalidasi di service layer.
4. **Index:** `id` (PK), kolom FK, dan kolom yang sering difilter (`email`, `name` unique, `region`, `user_id` pada roadmap, `batch_id` pada log/rekomendasi/roadmap).
5. **Migrasi:** gunakan Alembic (`alembic revision --autogenerate`), jangan ubah skema langsung di DB. Lihat `DATABASE.md` Section migrations.
6. **Seed data:** 8 product templates di-seed otomatis saat startup jika tabel kosong.

## 10. Referensi

- [DATABASE.md](./DATABASE.md) — ERD & gambaran skema
- `backend/app/models/base.py` — definisi model SQLAlchemy
- `backend/app/schemas/base.py` — validasi request/response
- [API.md](./API.md) — dokumentasi endpoint
