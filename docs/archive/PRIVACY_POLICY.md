# PRIVACY_POLICY.md: EcoFlow AI — Kebijakan Privasi

> Berlaku efektif: **7 Agustus 2026**
> Berlaku untuk seluruh pengguna aplikasi EcoFlow AI (selanjutnya disebut "Layanan" atau "kami").

---

## 1. Ringkasan

EcoFlow AI menghormati privasi Anda. Kebijakan ini menjelaskan data apa yang kami kumpulkan, bagaimana kami menggunakannya, dan hak Anda atas data tersebut.

**Prinsip utama kami:**
- 🔒 Kami hanya mengumpulkan data yang diperlukan untuk menjalankan Layanan.
- 🔒 Kami tidak menjual data pribadi Anda kepada pihak ketiga.
- 🔒 Anda dapat meminta penghapusan data kapan saja.

---

## 2. Data yang Kami Kumpulkan

### 2.1 Data yang Anda Berikan Secara Langsung

| Data | Tujuan Penggunaan |
|------|-------------------|
| Nama | Identifikasi & personalisasi tampilan |
| Alamat email | Login (via Firebase Authentication) & pemulihan akun |
| Nomor telepon (opsional) | Komunikasi tambahan / verifikasi |
| Data batch fermentasi (nama batch, berat sampah, tanggal, log observasi, foto) | Fitur inti Layanan: monitoring fermentasi, rekomendasi produk, analisis bisnis |
| Data analisis bisnis (biaya produksi, harga jual) | Menghitung kelayakan bisnis sesuai permintaan Anda |

### 2.2 Data yang Dikumpulkan Otomatis

| Data | Tujuan |
|------|--------|
| Alamat IP | Keamanan (rate limiting & deteksi penyalahgunaan) |
| Log akses server (timestamp, endpoint) | Operasional, debugging, keamanan |
| Data diagnostik (error logs) | Perbaikan bug |

### 2.3 Data Pihak Ketiga (Firebase)

Autentikasi ditangani oleh **Google Firebase Authentication** (jika login dengan Google, data profil yang dibagikan sesuai persetujuan Anda di layar Google). Kebijakan privasi Google berlaku untuk proses autentikasi: https://policies.google.com/privacy

---

## 3. Cara Kami Menggunakan Data

1. **Menjalankan & menyempurnakan Layanan** — monitoring fermentasi, rekomendasi, analisis bisnis.
2. **Keamanan & pencegahan penyalahgunaan** — verifikasi identitas, rate limiting, deteksi aktivitas mencurigakan.
3. **Dukungan teknis** — membantu Anda saat ada masalah.
4. **Statistik agregat (anonymized)** — untuk pengelola komunitas (contoh: jumlah batch per komunitas). Statistik ini tidak mengidentifikasi individu.

Kami **tidak** menggunakan data Anda untuk:
- Iklan pihak ketiga
- Menjual/menyewakan data pribadi
- Profil marketing tanpa persetujuan

---

## 4. Penyimpanan Data

| Aspek | Detail |
|-------|--------|
| Lokasi | Server VPS (Indonesia) untuk database utama; Firebase/Google Cloud untuk autentikasi |
| Durasi | Data disimpan selama akun aktif. Data batch/log dapat dihapus kapan saja oleh pemilik akun |
| Backup | Backup rutin untuk pemulihan bencana; dihapus otomatis setelah periode retensi |
| Foto/log | Foto upload tersimpan di object storage (MinIO); batas ukuran 5MB per file |

---

## 5. Berbagi Data dengan Pihak Ketiga

Kami hanya berbagi data jika:

| Kondisi | Pihak |
|---------|-------|
| Wajib oleh hukum | Otoritas berwenang (dengan dasar hukum yang sah) |
| Autentikasi | Google Firebase (data auth) |
| Infrastruktur | Penyedia hosting VPS & object storage (akses teknis terbatas) |
| Pengelola komunitas | Statistik agregat anonim per komunitas (tanpa data pribadi individu) |

---

## 6. Hak Anda

Sesuai **UU PDP No. 27/2022 (Indonesia)** dan prinsip umum GDPR, Anda berhak:

| Hak | Cara Menggunakan |
|-----|------------------|
| Akses data Anda | Lihat data di aplikasi (dashboard) atau minta salinan via pengelola |
| Koreksi data | Edit profil di aplikasi (nama, telepon) |
| Hapus data | Minta penghapusan akun & data terkait via pengelola — data dihapus dalam 30 hari |
| Batasi pemrosesan | Kurangi penggunaan fitur yang mengumpulkan data |
| Keluhan | Hubungi pengelola / DPO yang ditunjuk |

Untuk menggunakan hak di atas, hubungi pengelola (lihat `README.md` kontak).

---

## 7. Keamanan Data

Kami menerapkan:
- ✅ Enkripsi transport (HTTPS/SSL)
- ✅ Autentikasi token Firebase (tanpa password tersimpan di server kami)
- ✅ Rate limiting per IP
- ✅ Kontrol akses berbasis peran (RBAC)
- ✅ Backup rutin & prosedur pemulihan bencana

Detail teknis: lihat `SECURITY_HARDENING_REPORT.md`.

---

## 8. Data Anak-Anak

Layanan ini tidak ditujukan untuk anak di bawah 13 tahun (atau usia dewasa sesuai hukum setempat). Jika kami mengetahui data anak tanpa persetujuan wali, kami akan menghapusnya.

---

## 9. Cookies & Teknologi Serupa

- Aplikasi menggunakan **localStorage** browser untuk menyimpan sesi autentikasi (ID token Firebase).
- Kami tidak menggunakan cookie pelacakan iklan.
- Anda dapat menghapus data sesi dengan logout atau membersihkan data situs browser.

---

## 10. Perubahan Kebijakan

Kebijakan ini dapat diperbarui seiring perkembangan Layanan. Perubahan signifikan akan diumumkan melalui aplikasi. Tanggal berlaku terbaru tercantum di bagian atas dokumen ini.

---

## 11. Kontak

Untuk pertanyaan privasi atau permintaan penghapusan data:
- **Email:** (isi kontak pengelola)
- **Repositori:** https://github.com/GomalRajaGula/EcoFlow-AI

---
