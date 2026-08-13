# ADMIN_MANUAL.md: EcoFlow AI — Panduan Admin

> Panduan penggunaan dashboard admin untuk administrator dan pengelola komunitas.
> Akses: menu **Admin** di sidebar (hanya tampil untuk user dengan role `admin`, `community_admin`, atau `platform_admin`).

---

## 1. Role Admin & Hak Akses

| Role | Deskripsi | Cakupan Data | Bisa Kelola |
|------|-----------|--------------|-------------|
| `admin` | Admin umum | Semua komunitas | Komunitas, template produk, user roles |
| `community_admin` | Admin satu komunitas | **Hanya** komunitas miliknya | Melihat statistik & laporan komunitasnya |
| `platform_admin` | Admin platform | Semua komunitas | Semua (setara admin) |

> **Cara menjadi admin:** UID Firebase Anda harus ada di env `ADMIN_UIDS` backend (lihat `FIREBASE_INTEGRATION.md` Section 4), atau role di-set via API `PATCH /api/v1/admin/users/{user_id}/role` oleh admin lain.

---

## 2. Bagian Dashboard Admin

Halaman admin terdiri dari beberapa bagian:

### 2.1 Filter & Laporan (atas)

| Kontrol | Fungsi |
|---------|--------|
| **Dropdown Komunitas** | Filter statistik per komunitas (atau "Semua") |
| **Filter Tanggal** | Batasi rentang data statistik |
| **Terapkan Filter** | Muat ulang statistik dengan filter |
| **Unduh CSV** | Download laporan kepatuhan komunitas (`community-compliance-report.csv`) |

> Laporan CSV berisi: total users, total batches, total waste, success rate, distribusi log (normal/caution/failed), dan metrik engagement (adoption percentages).

### 2.2 Kartu Statistik

| Kartu | Metrik |
|-------|--------|
| Total Users | Jumlah anggota (ter-filter) |
| Total Batches | Jumlah batch fermentasi |
| Total Waste | Total sampah teralihkan (kg) |
| Success Rate | % log dengan status AI `Normal` |
| Log Normal / Caution / Failed | Distribusi status fermentasi |
| Engagement | Log adoption %, recommendation adoption %, roadmap adoption %, rata-rata log per user |

### 2.3 Grafik Tren (30 hari)

Bar chart jumlah log per hari dengan proporsi status `Normal` (hijau) — berguna untuk melihat aktivitas komunitas naik/turun.

---

## 3. Manajemen Template Produk

Bagian ini mengelola katalog produk turunan eco-enzyme yang direkomendasikan ke user.

### 3.1 Membuat Template Baru

1. Isi form di panel kiri:
   - **Nama Template** (wajib, maks 120 char)
   - **Deskripsi** (wajib, maks 2000 char)
   - **Instruksi Pemrosesan** (wajib, maks 5000 char)
   - **Peringatan Keamanan** (wajib, maks 2000 char)
   - **URL Tutorial** (opsional — muncul sebagai QR code di PDF roadmap)
2. Klik **Tambah Template**.

### 3.2 Edit Template

- Klik **Edit** pada kartu template → form edit terbuka.
- Field yang bisa diubah: nama, deskripsi, instruksi, peringatan, URL tutorial, **Harga Pasar Regional (Rp/L)**.
- Klik **Simpan**.

### 3.3 Hapus Template

- Klik **Hapus** pada kartu template.
- ⚠️ Template yang sedang dipakai batch/rekomendasi tidak boleh dihapus (FK constraint) — hapus hanya template yang tidak terpakai.

### 3.4 Import Harga Massal (JSON)

1. Siapkan JSON array:
```json
[
  { "name": "Household Cleaner", "regional_average_price": 15000 },
  { "name": "Liquid Fertilizer", "regional_average_price": 12000 }
]
```
2. Tempel di textarea import → **Import**.
3. Sistem menampilkan berapa template yang ter-update dan yang tidak ditemukan.

---

## 4. Manajemen Komunitas

| Aksi | Cara |
|------|------|
| Melihat daftar komunitas | Bagian daftar komunitas (dropdown & list) |
| Membuat komunitas baru | Via API `POST /api/v1/admin/communities` (role admin/platform_admin) |
| Cakupan `community_admin` | Otomatis dibatasi ke `community_id` miliknya — tidak bisa melihat komunitas lain |

---

## 5. Manajemen User & Role

Perubahan role dilakukan via API (belum ada UI khusus):

```bash
# Contoh: ubah role user
curl -X PATCH https://api.example.com/api/v1/admin/users/{firebase_uid}/role \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"role": "community_admin"}'
```

**Role valid:** `user`, `admin`, `community_admin`, `platform_admin`.

> ⚠️ Hati-hati memberikan `admin`/`platform_admin` — hanya untuk yang dipercaya penuh.

---

## 6. Metrik Model AI (Model Metrics)

Bagian ini menampilkan performa AI classifier:

| Metrik | Arti |
|--------|------|
| Total Predictions | Jumlah klasifikasi yang pernah dilakukan |
| Normal / Caution / Failed Logs | Distribusi hasil klasifikasi |
| Success Rate % | % status Normal |
| Average Health Score | Rata-rata health score seluruh batch |
| Uptime % | Ketersediaan layanan (default 99.9%) |

> Gunakan metrik ini untuk memantau kualitas prediksi. Jika success rate anjlok, evaluasi input log user (apakah banyak nilai yang di luar enumerasi valid — lihat `ALGORITHM_DOCUMENTATION.md`).

---

## 7. Tugas Rutin Admin

| Frekuensi | Tugas |
|-----------|-------|
| Harian | Cek dashboard: aktivitas aneh, lonjakan failed logs |
| Mingguan | Review tren 30 hari; cek log error backend |
| Bulanan | Update harga pasar template (import pricing); review user roles; backup DB |
| Saat konten | Update/tambah template produk dengan instruksi & tutorial terbaru |
| Insiden | Ikuti `OPERATIONS.md` incident response |

---

## 8. Troubleshooting Admin

| Masalah | Solusi |
|---------|--------|
| Menu Admin tidak muncul | Role user Anda bukan admin — minta admin lain set role / tambah UID ke `ADMIN_UIDS` |
| Error 403 "Insufficient permissions" | Role Anda tidak diizinkan untuk aksi itu (mis. `community_admin` coba akses komunitas lain) |
| Import pricing gagal | Format JSON harus array `[{"name": ..., "regional_average_price": ...}]`; harga ≥ 0 |
| CSV kosong | Filter tanggal salah atau belum ada data di rentang itu |
| Template tidak bisa dihapus | Template masih direferensikan batch/rekomendasi |

---

## 9. Referensi

- [USER_MANUAL.md](./USER_MANUAL.md) — panduan pengguna biasa
- [API.md](./API.md) — endpoint admin (`/api/v1/admin/*`)
- [FIREBASE_INTEGRATION.md](./FIREBASE_INTEGRATION.md) — RBAC & role
- [OPERATIONS.md](./OPERATIONS.md) — operasional & troubleshooting
