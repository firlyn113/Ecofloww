# USER_MANUAL.md: EcoFlow AI — Panduan Pengguna

> Panduan penggunaan aplikasi EcoFlow AI untuk pengguna umum (non-teknis).
> Aplikasi membantu Anda memantau fermentasi eco-enzyme, mendapatkan rekomendasi produk, dan menganalisis kelayakan bisnis.

---

## 1. Tentang EcoFlow AI

EcoFlow AI adalah aplikasi web pendamping pembuatan **eco-enzyme** (enzim dari fermentasi sampah organik). Dengan EcoFlow AI Anda dapat:

- ✅ Memantau kesehatan fermentasi setiap hari dengan bantuan AI
- ✅ Mendapatkan rekomendasi produk turunan eco-enzyme (pembersih, pupuk, dll.)
- ✅ Menghitung kelayakan bisnis produk Anda (modal, harga jual, profit)
- ✅ Mencatat dampak lingkungan yang Anda hasilkan (CO₂, sampah teralihkan)
- ✅ Mengikuti panduan langkah demi langkah mengolah eco-enzyme menjadi produk

---

## 2. Memulai

### 2.1 Membuat Akun

1. Buka aplikasi: `https://app.example.com` (atau URL yang dibagikan pengelola).
2. Klik **Login** atau **Sign Up** di pojok kanan atas.
3. Daftar dengan:
   - **Email & Password** — isi nama, email, dan password.
   - **Google** — klik tombol Google, pilih akun Anda.
4. Setelah login, Anda masuk ke **Dashboard**.

> 💡 Pastikan email yang digunakan aktif — akun terhubung ke Firebase Authentication.

### 2.2 Halaman Utama (Dashboard)

| Elemen | Fungsi |
|--------|--------|
| **Sidebar** (kiri) | Navigasi antar halaman; tombol keluar (Logout) |
| **Statistik** (atas) | Ringkasan batch aktif, sampah teralihkan, dll. |
| **Daftar Batch** | Kartu-kartu batch fermentasi Anda |
| **Tombol + / Create Batch** | Membuat batch baru |

---

## 3. Membuat Batch Fermentasi Baru

1. Klik **Create New Batch** (atau tombol "+").
2. Isi formulir:
   - **Batch Name**: beri nama mudah diingat, misal *"Sampah Dapur Juli"*.
   - **Waste Weight (kg)**: berat sampah organik Anda (contoh: 10).
   - **Start Date**: tanggal mulai fermentasi.
3. Sistem otomatis menghitung kebutuhan bahan:
   - **Air** = 3 × berat sampah (liter)
   - **Gula** = 1 × berat sampah (kg)
   - **Perkiraan panen** = 90 hari sejak mulai
4. Klik **Create Batch**.

> ⚠️ Jika rasio bahan menyimpang dari ideal (1:3:10), sistem menampilkan peringatan — perhatikan agar fermentasi optimal.

---

## 4. Mencatat Perkembangan Fermentasi (Harian)

1. Di Dashboard, klik kartu batch Anda.
2. Klik **Add Fermentation Log**.
3. Isi observasi:
   - **Log Date**: tanggal pencatatan (hari ini).
   - **Aroma**: pilih kondisi aroma (`sweet`, `sour`, `slightly_rotten`, dll).
   - **Color**: pilih warna cairan (`brown`, `amber`, `black`, dll).
   - **Gas Presence**: centang jika ada gelembung gas.
   - **Temperature**: suhu ruangan fermentasi (idealnya 20–30°C).
   - **Notes** (opsional): catatan tambahan.
   - **Foto** (opsional): upload foto kondisi eco-enzyme.
4. Klik **Submit**.

### 4.1 Membaca Hasil AI

Setelah submit, AI menampilkan:

| Status | Arti | Tindakan |
|--------|------|----------|
| 🟢 **Normal** | Fermentasi berjalan baik | Lanjutkan pencatatan harian |
| 🟡 **Caution** | Ada tanda-tanda masalah | Ikuti saran korektif AI (atur suhu, perhatikan warna/aroma) |
| 🔴 **Failed** | Fermentasi gagal | Disarankan mulai ulang dengan batch baru |

**Health Score** (0–100) menunjukkan kesehatan keseluruhan batch — makin tinggi makin baik.

### 4.2 Alur Fermentasi yang Baik

- Catat log **minimal 1× per minggu**, idealnya 2–3× per minggu.
- Jaga suhu ruangan di **20–30°C**, jauhkan dari sinar matahari langsung.
- Hari ke-90 adalah perkiraan waktu panen. Aplikasi akan memberi **Harvest Alert** saat mendekati jendela panen (hari 83–97).

---

## 5. Mendapatkan Rekomendasi Produk (Saat Panen)

1. Saat fermentasi selesai, klik **Get Product Recommendations** pada batch.
2. Isi data panen:
   - **Harvest Volume (L)**: jumlah cairan hasil panen.
   - **Final Color**: warna akhir cairan.
   - **Aroma Intensity**: intensitas aroma.
   - **Intent**: pilih *Household* (rumah tangga) atau *Commercial* (komersial).
3. Sistem menampilkan **8 produk terbaik** dengan skor kesesuaian (0–100).
4. Pilih produk yang ingin Anda buat (misal *Liquid Fertilizer*).
5. Lanjut ke roadmap produksi (lihat bagian 6).

**Contoh produk turunan eco-enzyme:**

| Produk | Kegunaan |
|--------|----------|
| Household Cleaner | Pembersih serbaguna (encerkan 1:10) |
| Disinfectant | Disinfektan (encerkan 1:5) |
| Liquid Fertilizer | Pupuk cair organik (encerkan 1:100) |
| Pest Repellent | Pengusir hama alami |
| Drain Cleaner | Pembersih & penghilang bau saluran |
| Odor Neutralizer | Penghilang bau ruangan/kain |
| Cosmetic Base | Bahan dasar kosmetik alami |
| Animal Feed Additive | Aditif pakan ternak (konsultasi dokter hewan) |

---

## 6. Menggunakan Roadmap Produksi

1. Setelah memilih produk, buka **Roadmap** untuk produk tersebut.
2. Ikuti langkah-langkah yang ditampilkan:
   - **Gathering Ingredients** — siapkan bahan.
   - **Preparing Equipment** — siapkan peralatan.
   - Langkah pengolahan spesifik (dilusi, pengujian, dll.) sesuai produk.
3. Centang setiap langkah yang sudah selesai — progres tersimpan otomatis.
4. Klik **Download PDF** untuk mendapatkan checklist yang bisa dicetak/dibagikan.

> 🔒 Selalu baca **Safety Warnings** pada roadmap sebelum mengolah.

---

## 7. Analisis Bisnis (Kelayakan Jual)

1. Klik **Business Analysis** pada batch Anda.
2. Isi data biaya:
   - **Product Name**: nama produk yang akan dijual.
   - **Production Volume (L)**: volume produksi.
   - **Cost Structure**: biaya bahan baku, kemasan, tenaga kerja, overhead.
   - **Monthly Fixed Costs**: biaya tetap bulanan (sewa, listrik, dll).
   - **Regional Price** (opsional): harga pasar rata-rata produk sejenis.
3. Hasil yang didapat:
   - **COGS** — biaya produksi per liter
   - **Suggested Retail Price** — harga jual yang disarankan
   - **Gross Margin %** — keuntungan kotor
   - **Break-even** — berapa liter terjual untuk balik modal
   - **Proyeksi 12 bulan** — estimasi pendapatan & profit
   - **Viability Rating** — *Viable* (layak) / *Marginal* / *Not Viable*
4. Klik **Download PDF Report** untuk menyimpan laporan lengkap.

> 💡 Jika rating **Not Viable**, coba kurangi biaya produksi atau naikkan harga jual (sesuai harga pasar).

---

## 8. Dampak Lingkungan

Setiap batch yang Anda buat menghitung dampak positif:

- **CO₂ dihindari** — sampah tidak membusuk di TPA (1,9 kg CO₂ per kg sampah)
- **Metana dihindari** — gas rumah kaca dari sampah organik
- **Air dihemat** — air yang tidak terbuang (5 L per kg sampah)
- **Setara pohon** — konversi ke jumlah pohon yang menyerap CO₂ tersebut

Pantau akumulasi dampak Anda di dashboard — setiap batch membuat Anda lebih ramah lingkungan. 🌱

---

## 9. Pertanyaan Umum (FAQ)

**Q: Berapa lama fermentasi eco-enzyme?**
A: Umumnya 90 hari. Aplikasi menghitung tanggal panen otomatis dan memberi peringatan saat mendekati jendela panen (hari 83–97).

**Q: Kenapa status AI saya "Caution"?**
A: Biasanya karena suhu di luar 20–30°C, tidak ada gas di fase lanjut, atau aroma/warna sedikit menyimpang. Ikuti saran korektif yang ditampilkan AI.

**Q: Apakah saya wajib upload foto setiap log?**
A: Tidak. Foto bersifat opsional (maks 5MB, format JPEG/PNG/WebP).

**Q: Apakah data saya aman?**
A: Ya. Login menggunakan Firebase Authentication (Google/email) dan data Anda hanya bisa diakses oleh akun Anda.

**Q: Bagaimana jika saya lupa password?**
A: Gunakan fitur "Forgot Password" di halaman login (email pemulihan akan dikirim).

**Q: Apakah aplikasi bisa dipakai tanpa internet?**
A: Tidak — aplikasi memerlukan koneksi internet untuk menyimpan data.

---

## 10. Tips & Best Practices

1. **Konsisten mencatat** — makin sering mencatat, makin akurat prediksi AI.
2. **Jaga suhu** — letakkan wadah fermentasi di tempat teduh, suhu 20–30°C.
3. **Tutup rapat minggu pertama** — buka sebentar setiap hari untuk membuang gas.
4. **Labeli wadah** — tulis tanggal mulai; cek tanggal panen di aplikasi.
5. **Gunakan rasio yang tepat** — 1 gula : 3 sampah : 10 air, jangan kurang air.
6. **Panen tepat waktu** — setelah lewat hari ke-97, kualitas bisa menurun.
7. **Simpan hasil panen di wadah kedap udara** — hindari sinar matahari langsung.

---

## 11. Kontak & Bantuan

- Untuk masalah teknis aplikasi: hubungi pengelola/pengembang (lihat `README.md`).
- Untuk masalah fermentasi: saran AI di aplikasi + komunitas eco-enzyme setempat.
- Lapor bug: buat issue di repository GitHub proyek.
