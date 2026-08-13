# 🌱 EcoFlow AI - Smart Eco-Enzyme Fermentation Assistant

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.140-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.14+-3776AB?logo=python&logoColor=white)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12.0-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-ITechnoCup_2026-blue)](./LICENSE)

> **Platform fermentasi eco-enzyme berbasis AI untuk monitoring real-time, rekomendasi produk, dan analisis bisnis komprehensif.**

EcoFlow AI adalah solusi digital end-to-end yang mengoptimalkan proses pembuatan eco-enzyme dari sampah organik—membantu produsen rumahan hingga komersial mencapai keberhasilan panen maksimal dengan dukungan AI.

---

## ✨ Fitur Utama

### 🤖 **AI-Powered Fermentation Monitoring**
- Prediksi status fermentasi real-time (Normal, Caution, Failed)
- Analisis cerdas dari parameter: aroma, warna, suhu, dan aktivitas gas
- Health score tracking dan milestone achievements

### 🎯 **Product Recommendation Engine**
- 8 produk turunan eco-enzyme (Household Cleaner, Fertilizer, Pest Repellent, dll)
- Matching algorithm berdasarkan karakteristik hasil fermentasi
- Instruksi pemrosesan lengkap untuk setiap produk

### 💼 **Business Analysis Dashboard**
- Perhitungan COGS (Cost of Goods Sold) otomatis
- Analisis profit margin dan break-even point
- Proyeksi revenue 6 bulan dengan visualisasi lengkap
- Rekomendasi harga jual berdasarkan market positioning

### 📊 **Batch Management System**
- Tracking lengkap lifecycle fermentasi (90 hari)
- Kalkulasi otomatis kebutuhan air (3x) dan gula (1x) dari berat sampah
- Daily fermentation logs dengan gambar upload
- Production roadmap generation

### 🌍 **Environmental Impact Tracking**
- Perhitungan CO₂ diverted dari landfill
- Community impact aggregation
- Sustainability metrics dashboard

---

## 🏗️ Arsitektur & Clean Code Structure

### **Tech Stack**

#### **Frontend** (`/frontend`)
- **Framework**: Next.js 15.5 (App Router) + React 19
- **Styling**: Tailwind CSS 4.0 (Warm Organic Palette)
- **Authentication**: Firebase Auth + Context API
- **HTTP Client**: Axios dengan interceptors
- **Type Safety**: TypeScript 5.0+
- **Testing**: Playwright (E2E), ESLint

#### **Backend** (`/backend`)
- **Framework**: FastAPI 0.140 (Python 3.14+)
- **Database**: PostgreSQL 16 (production) / SQLite (dev)
- **ORM**: SQLAlchemy 2.0 + Alembic migrations
- **Authentication**: Firebase Admin SDK
- **Storage**: MinIO (S3-compatible) / AWS S3
- **Rate Limiting**: Redis-backed (fallback in-memory)
- **Security**: TrustedHost middleware, CORS, Security headers

---

## 📂 Struktur Proyek

```
EcoFlow-AI/
├── frontend/                          # Next.js React Application
│   ├── app/                           # Next.js 15 App Router
│   │   ├── page.tsx                   # 🎨 Landing Page (Warm Organic Theme)
│   │   ├── layout.tsx                 # Root layout + providers
│   │   ├── login/page.tsx             # Authentication page
│   │   ├── dashboard/                 # Main dashboard
│   │   │   ├── page.tsx               # Dashboard home
│   │   │   ├── layout.tsx             # Dashboard layout with sidebar
│   │   │   ├── batches/page.tsx       # Batch management
│   │   │   └── settings/page.tsx      # User settings
│   │   ├── admin/page.tsx             # Admin analytics dashboard
│   │   └── globals.css                # Global styles (Warm palette)
│   │
│   ├── src/                           # 🎯 Clean Architecture (NEW)
│   │   ├── components/
│   │   │   ├── ui/                    # Atomic UI components
│   │   │   ├── layout/                # Layout components (Navbar, Sidebar, Footer)
│   │   │   │   └── Sidebar.tsx
│   │   │   └── features/              # Feature-specific components
│   │   │       ├── BatchCard.tsx
│   │   │       ├── CreateBatchModal.tsx
│   │   │       ├── FermentationLogModal.tsx
│   │   │       ├── ProductRecommendationModal.tsx
│   │   │       ├── BusinessAnalysisModal.tsx
│   │   │       ├── RoadmapModal.tsx
│   │   │       └── MilestonesPanel.tsx
│   │   │
│   │   ├── hooks/                     # Custom React Hooks
│   │   │   ├── auth-context.tsx       # Authentication hook
│   │   │   └── batches-context.tsx    # Batches state management
│   │   │
│   │   ├── services/                  # API integrations
│   │   │   └── api.ts                 # Axios client with interceptors
│   │   │
│   │   ├── lib/                       # Utilities & helpers
│   │   │   └── firebase.ts            # Firebase config
│   │   │
│   │   └── types/                     # TypeScript interfaces & types
│   │
│   ├── lib/                           # Legacy utilities (to be migrated)
│   │   ├── api.ts
│   │   ├── firebase.ts
│   │   ├── auth-context.tsx
│   │   ├── batches-context.tsx
│   │   └── offline-queue.ts
│   │
│   ├── public/                        # Static assets
│   ├── tests/                         # Playwright E2E tests
│   ├── .env.local                     # Environment variables (Firebase, API URL)
│   ├── next.config.ts                 # Next.js configuration
│   ├── tailwind.config.js             # Tailwind CSS config
│   ├── tsconfig.json                  # TypeScript configuration
│   └── package.json                   # Dependencies
│
├── backend/                           # FastAPI Python Server
│   ├── app/
│   │   ├── main.py                    # 🚀 Application entry point + CORS fix
│   │   │
│   │   ├── api/                       # 🎯 API Endpoints (NEW - Clean Architecture)
│   │   │   ├── recommendations.py     # Product recommendations
│   │   │   ├── admin.py               # Admin operations
│   │   │   ├── roadmap.py             # Production roadmap
│   │   │   ├── impact.py              # Environmental impact
│   │   │   └── users.py               # User profile management
│   │   │
│   │   ├── routes/                    # Legacy routes (to be migrated)
│   │   │   └── (same as api/)
│   │   │
│   │   ├── core/                      # Core configurations
│   │   │   ├── database.py            # SQLAlchemy setup
│   │   │   ├── auth.py                # Firebase token verification
│   │   │   └── firebase.py            # Firebase Admin SDK
│   │   │
│   │   ├── models/                    # Database ORM Models
│   │   │   └── base.py                # User, FermentationBatch, FermentationLog,
│   │   │                              # ProductTemplate, ProductRecommendation, etc.
│   │   │
│   │   ├── schemas/                   # Pydantic Request/Response Schemas
│   │   │   └── base.py                # DTOs for validation
│   │   │
│   │   └── services/                  # Business Logic Layer
│   │       ├── eco_enzyme.py          # Ingredient calculations (3:1:10 ratio)
│   │       ├── fermentation_assistant.py  # AI status prediction
│   │       ├── product_recommendation.py  # Product matching algorithm
│   │       ├── business_analysis.py   # COGS, margin, break-even
│   │       ├── roadmap.py             # Roadmap generation
│   │       ├── environmental_impact.py # CO₂ calculations
│   │       ├── report.py              # PDF export
│   │       └── storage.py             # File upload (MinIO/S3)
│   │
│   ├── alembic/                       # Database migrations
│   │   └── versions/
│   ├── tests/                         # Pytest unit & integration tests
│   ├── .env                           # Environment variables (Database, Firebase, secrets)
│   ├── requirements.txt               # Python dependencies
│   ├── alembic.ini                    # Alembic configuration
│   └── Dockerfile                     # Container image
│
├── docs/                              # Additional documentation
├── .github/                           # GitHub workflows
├── docker-compose.yml                 # PostgreSQL + MinIO setup
├── LICENSE                            # License file
└── README.md                          # 📖 This file
```

### **Key Design Principles**
- ✅ **Clean Architecture**: Clear separation of concerns (UI, Business Logic, Data)
- ✅ **Type Safety**: Full TypeScript/Python type annotations
- ✅ **Warm Organic Palette**: Forest Green (#15803D) + Molasses Amber (#D97706) + Soft Cream (#FDFBF7)
- ✅ **API-First Design**: RESTful endpoints with OpenAPI documentation
- ✅ **Security**: Firebase Auth, rate limiting, input validation, SQL injection protection

---

## 🚀 Quick Start

### **Prerequisites**
- **Node.js**: 18+ (with npm/yarn)
- **Python**: 3.14+
- **Docker** (optional, for PostgreSQL + MinIO)
- **Firebase Account**: For authentication setup

---

### **1. Clone Repository**

```bash
git clone https://github.com/GomalRajaGula/EcoFlow-AI.git
cd EcoFlow-AI
```

---

### **2. Backend Setup**

#### **a. Install Dependencies**
```bash
cd backend
python -m venv venv
source venv/bin/activate          # Linux/Mac
# venv\Scripts\activate           # Windows
pip install -r requirements.txt
```

#### **b. Configure Environment**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL=postgresql://ecoflow_user:ecoflow_password@localhost:5432/ecoflow
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
SECRET_KEY=your-super-secret-key-change-this
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
ADMIN_UIDS=firebase_uid_admin_1,firebase_uid_admin_2
```

#### **c. Setup Database**

**Option 1: Docker (Recommended)**
```bash
docker compose up -d postgres minio
```

**Option 2: Local PostgreSQL**
```bash
# Install PostgreSQL 16, then:
createdb ecoflow
```

#### **d. Run Migrations**
```bash
alembic upgrade head
```

#### **e. Start Backend Server**
```bash
uvicorn app.main:app --reload --port 8000
```

✅ Backend API: `http://localhost:8000`  
✅ API Docs (Swagger): `http://localhost:8000/docs`

---

### **3. Frontend Setup**

#### **a. Install Dependencies**
```bash
cd frontend
npm install
```

#### **b. Configure Environment**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase credentials:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

#### **c. Start Frontend Server**
```bash
npm run dev
```

✅ Frontend: `http://localhost:3000`

---

### **4. Access the Application**

1. Open browser: `http://localhost:3000`
2. Click **"Mulai Sekarang"** or **"Masuk"**
3. Sign up with email/password via Firebase
4. Start creating fermentation batches!

---

## 📚 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/batches` | Create new fermentation batch |
| `GET` | `/api/v1/batches` | List all user batches |
| `GET` | `/api/v1/batches/{id}` | Get batch details |
| `PUT` | `/api/v1/batches/{id}` | Update batch status |
| `DELETE` | `/api/v1/batches/{id}` | Delete batch |
| `POST` | `/api/v1/batches/{id}/logs` | Add fermentation log entry |
| `GET` | `/api/v1/batches/{id}/logs` | Get batch logs |
| `POST` | `/api/v1/batches/{id}/recommendation` | Get product recommendations |
| `POST` | `/api/v1/batches/{id}/business-analysis` | Run business analysis |
| `POST` | `/api/v1/batches/{id}/roadmap` | Generate production roadmap |
| `GET` | `/api/v1/batches/{id}/dashboard` | Get batch dashboard summary |
| `GET` | `/api/v1/impact` | Get environmental impact metrics |
| `GET` | `/api/v1/admin/analytics` | Admin analytics (admin only) |
| `GET` | `/api/v1/users/profile` | Get user profile |

📖 **Full API Documentation**: `http://localhost:8000/docs` (Swagger UI)

---

## 🧪 Testing

### **Backend Tests**
```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

**Coverage Report**:
```bash
pytest tests/ --cov=app --cov-report=html
open htmlcov/index.html
```

### **Frontend Tests**

**Lint Check**:
```bash
cd frontend
npm run lint
```

**Build Verification**:
```bash
npm run build
```

**E2E Tests (Playwright)**:
```bash
npm run test:e2e
```

---

## 🧬 Business Logic

### **Eco-Enzyme Calculation Formula**
Rasio ideal untuk fermentasi eco-enzyme:
- **Water**: 3x berat waste
- **Brown Sugar**: 1x berat waste  
- **Duration**: 90 hari

**Contoh**: 10 kg sampah organik → 30 L air + 10 kg gula merah → 90 hari fermentasi

### **Fermentation Status Classification (AI)**
- **Normal**: Aroma sweet/sour/fruity, warna amber/brown, ada gas
- **Caution**: Minor issues (suhu tidak ideal, no gas setelah 30+ hari)
- **Failed**: Aroma rotten/pungent, warna hijau/hitam, kontaminasi

### **Business Analysis Metrics**
- **COGS**: (Raw Material + Packaging + Labor + Overhead) / Production Volume
- **Profit Margin**: (Selling Price - COGS) / Selling Price × 100%
- **Break-even Point**: Monthly Fixed Costs / Margin per Unit
- **Projections**: 6-month revenue forecast based on market adoption curve

---

## 🎨 Design System (Warm Organic Palette)

### **Color Palette**
```css
/* Primary Colors */
--forest-green: #15803D;        /* Primary brand, CTA buttons */
--emerald-700: #047857;         /* Hover states */
--emerald-50: #ECFDF5;          /* Light backgrounds */

/* Accent Colors */
--amber-600: #D97706;           /* Warm accents (molasses/fermentation) */
--amber-500: #F59E0B;           /* Highlights */
--amber-50: #FFFBEB;            /* Warm glow backgrounds */

/* Neutrals */
--cream-bg: #FDFBF7;            /* Main background (warm cream) */
--stone-900: #1C1917;           /* Headings */
--stone-600: #57534E;           /* Body text */
--stone-200: #E7E5E4;           /* Borders */
```

### **Typography**
- **Font Family**: Inter (sans-serif)
- **Headings**: Bold 700-900, stone-900
- **Body**: Regular 400-500, stone-600

---

## 🐛 Troubleshooting

### **Backend Connection Error**
```
Error: Network error - backend connection failed
```
**Solution**:
1. Ensure backend is running: `curl http://localhost:8000/docs`
2. Check CORS settings in `backend/app/main.py` (now set to allow all origins for development)
3. Verify Firebase credentials are valid

### **Database Migration Error**
```
sqlalchemy.exc.OperationalError: could not connect to server
```
**Solution**:
```bash
docker compose up -d postgres
alembic upgrade head
```

### **Firebase Auth Error**
```
Error: Failed to get auth token
```
**Solution**:
1. Check Firebase config in `frontend/.env.local`
2. Ensure Firebase project is active
3. Verify `firebase-credentials.json` exists in backend

---

## 🤝 Contributing

Kami menerima kontribusi! Lihat [CONTRIBUTING.md](./CONTRIBUTING.md) untuk panduan detail.

### **Development Workflow**
1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m "Add: amazing feature description"`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### **Code Standards**
- **Backend**: PEP 8 (Black formatter)
- **Frontend**: ESLint + Prettier
- **Commit Messages**: Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)

---

## 📋 Roadmap

### ✅ **MVP (Q3 2026) - Completed**
- [x] Batch management (CRUD operations)
- [x] AI fermentation monitoring
- [x] Product recommendation engine
- [x] Business analysis & projections
- [x] User authentication (Firebase)
- [x] Responsive dashboard UI
- [x] **NEW**: Warm Organic Design System
- [x] **NEW**: Enhanced CORS & error handling

### 🔄 **P1 Features (Q4 2026)**
- [x] Admin dashboard
- [x] PDF export (reports & roadmaps)
- [x] Environmental impact tracking
- [x] Community analytics
- [ ] Community batch sharing & tips
- [ ] Regional market data integration
- [ ] Push notifications (PWA)

### 🎯 **P2 Features (Q1 2027)**
- [ ] Mobile app (React Native)
- [ ] Advanced ML model (TensorFlow)
- [ ] Offline-first sync enhancement
- [ ] Multi-language support (EN, ID, TH)
- [ ] Batch comparison analytics
- [ ] Integration with IoT sensors

---

## 📄 License

Proyek ini dibuat untuk **ITechnoCup 2026**. Hak cipta © 2026 EcoFlow AI Team.

Untuk informasi lisensi lengkap, lihat [LICENSE](./LICENSE).

---

## 📞 Support & Contact

- **GitHub Issues**: [Report Bug](https://github.com/GomalRajaGula/EcoFlow-AI/issues)
- **GitHub Discussions**: [Ask Questions](https://github.com/GomalRajaGula/EcoFlow-AI/discussions)
- **Email**: contact@ecoflow.ai (Coming Soon)

---

## 🌟 Acknowledgments

- **ITechnoCup 2026** - Competition platform
- **Next.js Team** - Amazing React framework
- **FastAPI Team** - High-performance Python framework
- **Firebase** - Authentication & hosting
- **Tailwind CSS** - Utility-first CSS framework
- **Eco-enzyme Community** - Inspiration & knowledge sharing

---

<div align="center">

**🌱 Built with ❤️ for Sustainable Living**

**EcoFlow AI © 2026** | [Website](#) | [GitHub](https://github.com/GomalRajaGula/EcoFlow-AI) | [Docs](./docs/)

[![GitHub stars](https://img.shields.io/github/stars/GomalRajaGula/EcoFlow-AI?style=social)](https://github.com/GomalRajaGula/EcoFlow-AI)
[![GitHub forks](https://img.shields.io/github/forks/GomalRajaGula/EcoFlow-AI?style=social)](https://github.com/GomalRajaGula/EcoFlow-AI/fork)

</div>
