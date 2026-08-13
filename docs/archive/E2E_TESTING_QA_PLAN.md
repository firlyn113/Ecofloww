# E2E Testing & QA Report - ITechnoCup 2026

**Date:** August 2, 2026  
**Status:** Automated E2E Coverage Expanded  
**Deadline:** August 4, 2026

---

## 🧪 E2E TESTING STRATEGY

### Current State
- ✅ Backend: 26+ unit tests passing
- ✅ Frontend: ESLint clean, production build successful
- ✅ E2E tests: **17 automated Playwright tests** across 4 spec files:
  - `landing.spec.ts` (2): hero content, CTA → /login
  - `login.spec.ts` (2): form render/toggle, browser validation
  - `auth-guard.spec.ts` (3): route guards — /dashboard & /admin redirect unauthenticated → /login
  - `dashboard.spec.ts` (8, terautentikasi): sign-in + stat cards, create batch dengan rasio air/gula otomatis, **rekomendasi produk + pilih produk untuk roadmap** (men-sinkronkan `POST /batches/{id}/select-product`), analisis bisnis + kelayakan, modal catatan fermentasi & roadmap, **catatan fermentasi + foto observasi (upload ke MinIO terverifikasi) + prediksi AI**, **simpan offline → sinkronisasi queue saat online**, **roadmap di-cache (localStorage) → tetap tampil saat offline**
  - `admin.spec.ts` (2, admin role): load community stats + model metrics, create & delete product template
- ✅ Tes terautentikasi otomatis di-skip jika env `E2E_EMAIL`/`E2E_PASSWORD` (dan `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD`) tidak diset — aman untuk CI
- ✅ Test user Firebase: `e2e.test@ecoflow-ai.dev` (role admin via `ADMIN_UIDS`)
- ✅ Image checkpoint: upload foto observasi diverifikasi sampai objek tersimpan di MinIO (`minio_data` volume) + `image_url` tercatat di DB
- ✅ Offline queue: catatan fermentasi disimpan di localStorage saat offline, tersinkronkan otomatis saat koneksi kembali
- ✅ Offline roadmap cache: roadmap terakhir di-cache per batch (localStorage), ditampilkan saat offline dengan toast "Mode offline"; step toggle update cache (perbaikan juga race GET/POST roadmap di StrictMode — re-GET saat 400/409)
- ⚠️ Scenarios yang masih manual (post-launch): QR/video tutorial links
- ❌ Integration tests: Need verification

---

## 📋 MANUAL E2E TEST SCENARIOS

### Scenario 1: User Sign Up & Login Flow

**Steps:**
1. Navigate to http://localhost:3000/login
2. Click "Sign Up" button
3. Enter email: `test@ecoflow.ai`
4. Enter password: `TestPassword123!`
5. Confirm password: `TestPassword123!`
6. Click "Sign Up"
7. Verify email (Firebase console)
8. Login with credentials
9. Verify redirect to `/dashboard`

**Expected Results:**
- ✅ Sign up form validates input
- ✅ Password confirmation matches
- ✅ User created in Firebase
- ✅ Redirect to dashboard after login
- ✅ User name displays in navbar
- ✅ Dark mode visible on login page

**Testing Checklist:**
- [ ] Mobile view (375px)
- [ ] Desktop view (1920px)
- [ ] Password validation (min 8 chars, uppercase, number)
- [ ] Email validation (valid format)
- [ ] Error messages display properly

---

### Scenario 2: Create Fermentation Batch

**Steps:**
1. From dashboard, click "Buat Batch Fermentasi Baru"
2. Enter batch name: "Batch Testing 1"
3. Enter waste weight: 5 kg
4. System auto-calculates water (15L) and sugar (5kg)
5. Click "Buat Batch"
6. Verify batch appears in "Batch Aktif" section

**Expected Results:**
- ✅ Modal opens with form
- ✅ Auto-calculation works (waste × 3 = water, waste × 1 = sugar)
- ✅ Batch created and stored in database
- ✅ Batch appears in list
- ✅ Waste diverted metric updates

**Testing Checklist:**
- [ ] Form validation (positive numbers only)
- [ ] Calculation accuracy
- [ ] Database persistence (refresh page = data persists)
- [ ] Error handling (invalid input)
- [ ] Mobile form layout
- [ ] Loading state during submission

---

### Scenario 3: Log Fermentation Data

**Steps:**
1. From batch, click "Tambah Catatan Fermentasi"
2. Select aroma: "Manis"
3. Select color: "Cokelat Gelap"
4. Toggle "Terdapat Gelembung Gas": Yes
5. Enter temperature: 25°C
6. Add notes: "Test observation"
7. Click "Simpan Catatan"
8. Verify AI prediction appears

**Expected Results:**
- ✅ Modal opens with form
- ✅ All dropdowns work correctly
- ✅ AI status classification appears (Normal/Caution/Failed)
- ✅ Health score calculated (0-100)
- ✅ Harvest alert triggers if applicable
- ✅ Log saved to database

**Testing Checklist:**
- [ ] Form validation (all fields required)
- [ ] Dropdown options display correctly
- [ ] AI status classification accuracy
- [ ] Health score calculation
- [ ] Image upload (optional)
- [ ] Mobile form usability
- [ ] Error handling

---

### Scenario 4: Get Product Recommendations

**Steps:**
1. From batch, click "Dapatkan Rekomendasi Produk"
2. Enter harvest volume: 8.5L
3. Select final color: "Cokelat Gelap"
4. Select aroma intensity: 8
5. Select intent: "Commercial"
6. Click "Get Recommendations"
7. Verify 8 products ranked by compatibility

**Expected Results:**
- ✅ Modal opens with form
- ✅ All input fields validate
- ✅ 8 products returned in ranked order
- ✅ Compatibility scores calculated (0-100)
- ✅ Product details display correctly
- ✅ Each product shows processing instructions

**Testing Checklist:**
- [ ] Form validation
- [ ] Ranking accuracy
- [ ] Compatibility scoring
- [ ] Product information accuracy
- [ ] Mobile form layout
- [ ] API response time <500ms

---

### Scenario 5: Run Business Analysis

**Steps:**
1. From batch, click "Analisis Bisnis"
2. Fill in all required fields:
   - Product name: "Eco-Enzyme Cleaner"
   - Production volume: 100L
   - Target market: "Local"
   - Packaging type: "Bottle"
   - Distribution: "Direct Sales"
   - Costs (raw material, packaging, labor, overhead, fixed)
3. Click "Jalankan Analisis"
4. Verify financial metrics appear
5. Click "Download PDF"
6. Verify PDF downloads correctly

**Expected Results:**
- ✅ Form validates all required fields
- ✅ COGS calculation correct
- ✅ SRP calculation correct
- ✅ Profit projection calculated
- ✅ Viability rating determined
- ✅ PDF generated and downloads

**Testing Checklist:**
- [ ] Form validation (positive numbers, required fields)
- [ ] COGS accuracy
- [ ] SRP formula (1.5x COGS markup, max of markup vs 90% market price)
- [ ] Profit calculation accuracy
- [ ] 12-month projection logic
- [ ] PDF file generation
- [ ] PDF download works
- [ ] Mobile form usability

---

### Scenario 6: View Dashboard & Metrics

**Steps:**
1. From dashboard, observe stats cards
2. Verify metrics displayed:
   - Total Batch count
   - Active Batches count
   - Completed Batches count
   - Total waste diverted (kg)
   - CO₂ avoided (kg)
3. Verify greeting banner shows user name
4. Verify dark mode styling applied
5. Test sidebar toggle on mobile

**Expected Results:**
- ✅ All stats cards visible and accurate
- ✅ CO₂ calculation correct (waste × 1.9)
- ✅ Greeting banner displays user name
- ✅ Dark mode colors applied correctly
- ✅ Sidebar hides on mobile (<768px)
- ✅ Sidebar toggles on click

**Testing Checklist:**
- [ ] Stats accuracy
- [ ] CO₂ calculation formula
- [ ] Responsive grid layout
- [ ] Dark mode color contrast
- [ ] Mobile sidebar behavior
- [ ] Page load performance

---

### Scenario 7: Admin Dashboard

**Steps:**
1. Navigate to http://localhost:3000/admin
2. Verify community stats display:
   - Total users
   - Total batches
   - Total waste processed
   - Success rate percentage
   - Normal logs count
   - Failed logs count
3. Verify AI model metrics:
   - Total predictions (log count), Normal/Caution/Failed distribution, success rate, avg health score
   - Total predictions
   - Uptime percentage
   - Average inference time

**Expected Results:**
- ✅ All stats fetch from backend
- ✅ Numbers update in real-time
- ✅ Stats cards display correctly
- ✅ Responsive layout works

**Testing Checklist:**
- [ ] Data accuracy
- [ ] API response time
- [ ] Mobile responsiveness
- [ ] Role-based access (admin only)

---

## 🔍 CROSS-BROWSER TESTING

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if macOS available)
- [ ] Edge (if available)

### Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari Mobile (iOS)
- [ ] Firefox Mobile

### Tablet Browsers
- [ ] iPad Safari
- [ ] Android Chrome

---

## 📱 DEVICE TESTING CHECKLIST

### Phones (375px - 428px)
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13 (390px)
- [ ] Pixel 6 (412px)

### Tablets (768px - 1024px)
- [ ] iPad Mini (768px)
- [ ] iPad Air (820px)

### Desktop (1920px+)
- [ ] 1920x1080
- [ ] 2560x1440

---

## 🔐 SECURITY TESTING

### Input Validation
- [ ] SQL injection attempt in batch name: `'; DROP TABLE--`
- [ ] XSS attempt in notes: `<script>alert('xss')</script>`
- [ ] Invalid email format
- [ ] Negative numbers in cost fields
- [ ] Very large numbers (overflow)
- [ ] Empty required fields

### Authentication
- [ ] Login with wrong password (should fail)
- [ ] Access dashboard without login (should redirect)
- [ ] Expired token handling
- [ ] CORS headers correct

### API Security
- [ ] File upload MIME type validation
- [ ] File size limits enforced
- [ ] Rate limiting works
- [ ] Error messages don't leak info

---

## ⚡ PERFORMANCE TESTING

### Load Times
- [ ] Dashboard load: < 2s
- [ ] API response: < 500ms
- [ ] PDF generation: < 5s
- [ ] Image upload: < 3s

### Responsiveness
- [ ] No layout shifts (CLS)
- [ ] First Contentful Paint < 1s
- [ ] Largest Contentful Paint < 2.5s

---

## 🎯 ACCESSIBILITY TESTING

### Keyboard Navigation
- [ ] Tab through all form fields
- [ ] Enter submits forms
- [ ] Escape closes modals
- [ ] Buttons focusable

### Screen Reader
- [ ] Form labels accessible
- [ ] Buttons announced correctly
- [ ] Success messages read
- [ ] Error messages read

### Color Contrast
- [ ] Text vs background: 4.5:1 minimum
- [ ] Interactive elements: 3:1 minimum
- [ ] Dark mode contrast verified

---

## 📝 TEST RESULTS TEMPLATE

**Test Date:** ___________  
**Browser/Device:** ___________  
**Tester:** ___________

| Scenario | Status | Notes |
|----------|--------|-------|
| Sign Up & Login | ✅/❌ | |
| Create Batch | ✅/❌ | |
| Log Fermentation | ✅/❌ | |
| Get Recommendations | ✅/❌ | |
| Business Analysis | ✅/❌ | |
| Dashboard Metrics | ✅/❌ | |
| Admin Dashboard | ✅/❌ | |

---

## ✅ QA SIGN-OFF CHECKLIST

- [ ] All 7 scenarios tested on desktop
- [ ] All 7 scenarios tested on mobile (375px)
- [ ] All 7 scenarios tested on tablet (768px)
- [ ] Security validation tests passed
- [ ] Performance targets met
- [ ] Accessibility requirements met
- [ ] Error handling verified
- [ ] Database persistence verified
- [ ] API response times verified
- [ ] No console errors

---

## 🚀 READY FOR SUBMISSION WHEN

✅ All manual test scenarios pass  
✅ No critical bugs found  
✅ Performance meets targets  
✅ Accessibility verified  
✅ Security validation passed  

---

**Status:** 🟡 **MANUAL QA READY**

Recommended: Test all scenarios before August 4 deadline.

