# Frontend Components — Katalog & Dokumentasi

> Dokumentasi komponen React di `frontend/components/` untuk aplikasi Next.js 15 (App Router).
> UI library: Chakra UI v2 + Tailwind CSS v4. Lihat `DESIGN_SYSTEM.md` untuk panduan styling.

---

## 1. Component Hierarchy (Ringkas)

```
app/
├── page.tsx            (Landing page — static)
├── login/              (Login/sign-up — Firebase Auth)
├── dashboard/          (Halaman utama user)
│   ├── Sidebar.tsx            — navigasi samping
│   ├── BatchCard.tsx          — kartu batch (grid)
│   ├── CreateBatchModal.tsx   — form buat batch baru
│   ├── FermentationLogModal.tsx — form catat log harian + AI
│   ├── ProductRecommendationModal.tsx — hasil rekomendasi produk
│   ├── BusinessAnalysisModal.tsx — analisis kelayakan bisnis
│   ├── RoadmapModal.tsx       — roadmap pengolahan produk
│   └── MilestonesPanel.tsx    — panel milestone batch
└── admin/              (Dashboard admin — role-based)
ErrorBoundary.tsx / ClientErrorBoundary.tsx — error boundary global
```

---

## 2. Catalog Komponen

### 2.1 `BatchCard.tsx` — Kartu Batch

Kartu menampilkan info batch dengan progress bar fermentasi (elapsed days / 90 hari).

| Props | Tipe | Required | Deskripsi |
|-------|------|----------|-----------|
| `batch` | `Batch` | ✅ | Objek batch (lihat tipe di bawah) |
| `onLogClick` | `() => void` | — | Buka modal catat log |
| `onRecommendationClick` | `() => void` | — | Buka modal rekomendasi produk |
| `onAnalysisClick` | `() => void` | — | Buka modal analisis bisnis |
| `onRoadmapClick` | `() => void` | — | Buka modal roadmap |
| `isCompleted` | `boolean` | — | Mode tampilan batch selesai |

**Tipe `Batch`:**
```typescript
interface Batch {
  id: number;
  name: string;
  status: string;            // pending_start | in_progress | harvested ...
  waste_weight_kg: number;
  water_liters: number;
  sugar_kg: number;
  start_date: string;        // ISO
  harvest_date: string;      // ISO
  created_at: string;
}
```

**Status color mapping:** `in_progress`→blue, `completed`/`harvested`→green, `failed`→red, lainnya→gray.

---

### 2.2 `CreateBatchModal.tsx` — Buat Batch

Modal form untuk membuat batch baru. Memanggil `POST /api/v1/batches`.

| Props | Tipe | Required |
|-------|------|----------|
| `isOpen` | `boolean` | ✅ |
| `onClose` | `() => void` | ✅ |
| `onSuccess` | `() => void` | ✅ |

**Fitur:** input nama batch, waste weight, start date; validasi ratio bahan via `POST /api/v1/check-ingredient-ratio`; menampilkan warning deviasi air/gula dari rasio ideal 1:3:10.

---

### 2.3 `FermentationLogModal.tsx` — Catat Log Harian

Form observasi harian + upload foto. Memanggil `POST /api/v1/batches/{id}/logs`.

| Props | Tipe | Required |
|-------|------|----------|
| `isOpen` | `boolean` | ✅ |
| `onClose` | `() => void` | ✅ |
| `batch` | `Batch` | ✅ |
| `onSuccess` | `() => void` | ✅ |

**Fitur:**
- Input: tanggal log, aroma (select), warna (select), gas presence (toggle), suhu, catatan.
- Upload foto via `POST /api/v1/upload` (JPEG/PNG/WebP, max 5MB) → URL MinIO.
- Menampilkan hasil AI: status prediksi (`Normal`/`Caution`/`Failed`), confidence, health score, saran korektif, harvest alert.

---

### 2.4 `ProductRecommendationModal.tsx` — Rekomendasi Produk

Modal setelah panen untuk generate rekomendasi produk. Memanggil `POST /api/v1/batches/{id}/recommendation`.

| Props | Tipe | Required |
|-------|------|----------|
| `isOpen` | `boolean` | ✅ |
| `onClose` | `() => void` | ✅ |
| `batchId` | `number` | ✅ |
| `onSuccess` | `() => void` | ✅ |

**Fitur:** input harvest volume, final color, aroma intensity, intent (household/commercial); menampilkan top 8 rekomendasi dengan compatibility score; user bisa memilih produk → `POST /api/v1/batches/{id}/select-product` (untuk lanjut ke roadmap).

---

### 2.5 `BusinessAnalysisModal.tsx` — Analisis Bisnis

Form input biaya produksi → hasil kelayakan bisnis. Memanggil `POST /api/v1/batches/{id}/business-analysis`.

| Props | Tipe | Required |
|-------|------|----------|
| `isOpen` | `boolean` | ✅ |
| `onClose` | `() => void` | ✅ |
| `batchId` | `number` | ✅ |
| `onSuccess` | `() => void` | ✅ |

**Fitur:**
- Input: product name, production volume, target market, packaging type, distribution channel, raw material/packaging/labor/overhead cost, monthly fixed costs, regional price (opsional).
- Hasil: COGS, SRP, gross margin, break-even, proyeksi 12 bulan, sensitivity analysis, viability rating.
- Tombol download PDF → `GET /api/v1/batches/{id}/business-analysis/report`.

---

### 2.6 `RoadmapModal.tsx` — Roadmap Produk

Menampilkan & melacak roadmap pengolahan produk terpilih.

| Props | Tipe | Required |
|-------|------|----------|
| `isOpen` | `boolean` | ✅ |
| `onClose` | `() => void` | ✅ |
| `batchId` | `number` | ✅ |
| `productTemplateId` | `number` | ✅ |
| `onSuccess` | `() => void` | ✅ |

**Fitur:** load roadmap (`GET /api/v1/batches/{id}/roadmap`), checklist step dengan centang (`PUT .../steps/{index}`), progress bar, tombol download PDF checklist → `GET /api/v1/batches/{id}/roadmap/report`.

**Tipe `RoadmapStep`:**
```typescript
interface RoadmapStep {
  title: string;
  description: string;
  details: string;
  completed: boolean;
}
```

---

### 2.7 `MilestonesPanel.tsx` — Panel Milestone

Menampilkan milestone fermentasi batch (day 30/60/90) + health score terbaru.

| Props | Tipe | Required |
|-------|------|----------|
| `batchId` | `number` | ✅ |

**Sumber data:** `GET /api/v1/batches/{batchId}/dashboard` (return: incubation_days, latest_status, latest_health_score, upcoming_milestones).

---

### 2.8 `Sidebar.tsx` — Navigasi Samping

Sidebar navigasi dengan mode collapse (icon-only). Responsive untuk mobile (off-canvas).

| Props | Tipe | Required |
|-------|------|----------|
| `sidebarOpen` | `boolean` | ✅ |
| `onSignOut` | `() => void` | ✅ |
| `isAdmin` | `boolean` | ✅ |
| `onClose` | `() => void` | ✅ |

**Fitur:** menu item dengan label/tooltip saat collapsed, badge aktif, link ke dashboard & admin (hanya jika `isAdmin`).

---

### 2.9 `ErrorBoundary.tsx` & `ClientErrorBoundary.tsx` — Error Handling

| Komponen | Deskripsi |
|----------|-----------|
| `ErrorBoundary` | Class component error boundary (props: `children: ReactNode`) — menampilkan fallback UI + tombol retry |
| `ClientErrorBoundary` | Wrapper `'use client'` yang membungkus `ErrorBoundary` untuk penggunaan dari server components |

---

## 3. Utilities (frontend/lib)

| File | Tanggung Jawab |
|------|----------------|
| `api.ts` | Axios instance `apiClient` dengan baseURL dari `NEXT_PUBLIC_API_URL`, interceptor auth token |
| `firebase.ts` | Inisialisasi Firebase app dari `NEXT_PUBLIC_FIREBASE_*` env |
| `auth-context.tsx` | React context auth: user state, login/signup, signOut, token management |
| `offline-queue.ts` | Queue offline untuk operasi yang gagal (retry saat koneksi pulih) |
| `roadmap-cache.ts` | Cache roadmap lokal untuk mengurangi request berulang |

---

## 4. Konvensi Penulisan Komponen Baru

1. **Semua komponen interaktif** wajib diawali `'use client';` (App Router).
2. Import Chakra UI components dari `@chakra-ui/react` — jangan mix styling framework kecuali diperlukan.
3. Props interface: deklarasikan `XxxProps` di atas komponen, nama deskriptif, tipe `() => void` untuk callback.
4. Modal components: props `isOpen`, `onClose`, `onSuccess` wajib untuk konsistensi.
5. Panggil API hanya via `apiClient` di `lib/api.ts` (auth token otomatis).
6. Error handling: tampilkan pesan error via Chakra `useToast`; jangan biarkan unhandled promise.
7. Tanggal: format dengan `date-fns` + locale `id` (`import { id } from 'date-fns/locale'`).
8. Tambahkan entry ke README ini + update E2E test di `tests/e2e/` jika alur user berubah.

---

## 5. Referensi

- [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md) — styling, branding, aksesibilitas
- [USER_FLOW.md](../../USER_FLOW.md) — alur pengguna
- [API.md](../../API.md) — endpoint yang dipanggil komponen
- [frontend/README.md](../README.md) — quick start frontend
