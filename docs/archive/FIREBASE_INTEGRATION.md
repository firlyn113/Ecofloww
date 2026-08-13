# FIREBASE_INTEGRATION.md: EcoFlow AI — Deep Dive Autentikasi

> Dokumentasi mendalam integrasi Firebase: alur auth, token flow, role-based access control, dan best practices.
> Setup Firebase project: lihat [FIREBASE_SETUP_COMPLETE.md](./FIREBASE_SETUP_COMPLETE.md).

---

## 1. Arsitektur Auth

```
┌──────────────┐     signIn (SDK)      ┌────────────────┐
│   Frontend   │ ────────────────────▶ │  Firebase Auth │
│  (Next.js)   │ ◀──────────────────── │   (Cloud)      │
│ firebase SDK │     ID Token (JWT)    └────────────────┘
└──────┬───────┘                              ▲
       │                                      │ Admin SDK
       │ Authorization: Bearer <ID Token>     │ verify
       ▼                                      │
┌──────────────────┐                     ┌─────────────┐
│  Backend API     │ ──────────────────▶  │ firebase-  │
│  (FastAPI)       │  verify_id_token()   │ credentials│
│  core/firebase.py│                      │ (service   │
└──────────────────┘                      │  account)  │
```

**Dua entitas terpisah:**
| Entitas | Pakai | Fungsi |
|---------|-------|--------|
| Frontend | **Firebase Web SDK** (`firebase/auth`) | Login/signup, kelola session, dapatkan ID token |
| Backend | **Firebase Admin SDK** (`firebase-admin`) | Verifikasi token, auto-register user, role management |

---

## 2. Setup Environment

### Frontend (`.env.local`) — Web SDK config

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ecoflow.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ecoflow
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ecoflow.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXX
```

> `NEXT_PUBLIC_*` aman untuk dipublish — Firebase config **bukan** secret.

### Backend (`.env`) — Admin SDK

```env
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
```

File `firebase-credentials.json` = service account JSON dari Firebase Console → Project settings → **Service accounts** → *Generate new private key*.

**⚠️ JANGAN commit** `firebase-credentials.json` ke git. Sudah di `.gitignore` — verifikasi: `git check-ignore backend/firebase-credentials.json`.

### Inisialisasi Backend (`app/core/firebase.py`)

```python
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred)
```

- Singleton: hanya init sekali per proses (guard `firebase_admin._apps`).
- Jika credential tidak ada/invalid → hanya **print warning**, tidak crash (agar test/dev tetap jalan).
- `verify_token()` raise `HTTPException(401)` jika token invalid/expired.

---

## 3. Alur Login & Token Flow

### 3.1 Login di Frontend (Web SDK)

```typescript
// Email/password
import { signInWithEmailAndPassword } from 'firebase/auth';
const userCredential = await signInWithEmailAndPassword(auth, email, password);

// Atau Google
import { signInWithPopup, googleProvider } from 'firebase/auth';
const userCredential = await signInWithPopup(auth, googleProvider);
```

### 3.2 Session State (`lib/auth-context.tsx`)

```typescript
onAuthStateChanged(auth, (currentUser) => {
  setUser(currentUser);
  setLoading(false);
});
```

- `AuthProvider` membungkus aplikasi (`app/providers.tsx`).
- `useAuth()` → `{ user, loading, signOut }`.
- `loading=true` saat Firebase masih resolve session (hindari flash login page).
- `signOut()` → `firebaseSignOut(auth)`.

### 3.3 ID Token & Attach ke Request (`lib/api.ts`)

```typescript
apiClient.interceptors.request.use(async (config) => {
  const token = await auth.currentUser?.getIdToken();  // auto-refresh otomatis
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

**Token refresh mechanism:**
- `getIdToken()` **otomatis refresh** jika token mendekati expiry (±5 menit) — tidak perlu manual.
- SDK menyimpan refresh token & mengelola silently.
- Response interceptor: jika API return **401** → `auth.signOut()` (session expired) — user diarahkan ke login.

### 3.4 Verifikasi di Backend (`app/core/auth.py`)

```python
decoded_token = verify_token(token)          # firebase_admin.auth.verify_id_token
user_id = decoded_token.get("uid")           # Firebase UID
token_email = decoded_token.get("email")
```

**Auto-register user:**

```
decoded uid ada di tabel users?
  ├─ YA → gunakan user tersebut
  ├─ TIDAK → buat User baru:
  │        role = "admin" jika uid ∈ ADMIN_UIDS (env), else "user"
  └─ uid ∈ ADMIN_UIDS tapi role != admin → upgrade role ke "admin"
```

Flow lengkap di `app/core/auth.py:get_current_user`.

---

## 4. Role-Based Access Control (RBAC)

### 4.1 Model Role

| Role | Deskripsi | Sumber |
|------|-----------|--------|
| `user` | Pengguna biasa | Default saat auto-register |
| `admin` | Admin platform | Dari env `ADMIN_UIDS` atau di-set manual via admin API |
| `community_admin` | Admin komunitas tertentu | Di-set via `PATCH /api/v1/admin/users/{user_id}/role` |
| `platform_admin` | Akses semua komunitas | Di-set via admin API |

### 4.2 Admin UIDs (env)

```env
# backend/.env
ADMIN_UIDS=firebase_uid_1,firebase_uid_2
```

Cara mendapatkan UID: Firebase Console → Authentication → Users → klik user → "User UID".

### 4.3 Enforce di Backend

```python
# app/core/auth.py
def require_role(*allowed_roles: str):
    async def role_checker(role: str = Depends(get_current_user_role)):
        if role not in allowed_roles:
            raise HTTPException(403, "Insufficient permissions")
        return role
    return role_checker

# Usage di routes:
Depends(require_role("admin", "platform_admin"))
```

**Community scoping:** `community_admin` dibatasi ke komunitasnya sendiri:

```python
def scope_community_id(current_user, role, community_id):
    if role == "community_admin":
        return current_user.community_id   # paksa scope miliknya
    return community_id
```

### 4.4 Frontend — Route Guard

- Dashboard admin hanya dirender jika `isAdmin` (cek role user di `GET /api/v1/users/me`).
- Sidebar menyembunyikan menu admin untuk non-admin.
- **Penting:** guard frontend hanya UX — keamanan sebenarnya enforced di backend (`require_role`).

### 4.5 Custom Claims (opsional, belum dipakai)

Backend saat ini memakai kolom `role` di **tabel users** (bukan Firebase custom claims). Jika ingin memakai custom claims:

```python
# Admin SDK — set custom claim
from firebase_admin import auth as fa
fa.set_custom_user_claims(uid, {"role": "admin"})

# Baca di token
decoded_token.get("role")
```

> Trade-off: custom claims tersimpan di token (stateless, cepat) tapi perubahan butuh refresh token; kolom DB lebih fleksibel & instant. Saat ini proyek memakai **DB-based role**.

---

## 5. Keamanan & Best Practices

| Area | Best Practice | Status di Proyek |
|------|---------------|------------------|
| Service account | Simpan di luar repo, path via env | ✅ `.gitignore` |
| ID Token di backend | Selalu verify via Admin SDK (jangan parse JWT manual) | ✅ `verify_id_token` |
| Jangan trust client role | Role dari frontend tidak pernah diterima — diambil dari DB | ✅ |
| HTTPS | Wajib di production (token bocor jika HTTP) | ✅ via Nginx+SSL (DEPLOYMENT.md) |
| Token expiry | SDK auto-refresh; backend verify menolak expired | ✅ |
| 401 handling | Frontend sign-out otomatis saat 401 | ✅ `api.ts` |
| Rate limiting | Melindungi endpoint auth dari brute force | ✅ middleware 429 |
| Firebase Security Rules | Jika memakai Firebase Storage/Firestore — set aturan ketat | ⚠️ Storage via MinIO, bukan Firebase |

### Checklist Saat Menambah Auth Feature

- [ ] Backend: tambahkan endpoint dengan `Depends(get_current_user)`.
- [ ] Role check jika endpoint admin: `Depends(require_role(...))`.
- [ ] Frontend: panggil API via `apiClient` (token otomatis).
- [ ] E2E test auth flow (login.spec.ts, auth-guard.spec.ts).
- [ ] Update API.md.

---

## 6. Troubleshooting Auth

| Gejala | Penyebab | Solusi |
|--------|----------|--------|
| 401 "Invalid token" | Token expired / project tidak cocok | Logout → login ulang; cek PROJECT_ID frontend vs backend service account **harus sama project** |
| 401 "Invalid authentication claims" | Decoded token tanpa `uid` | Pastikan pakai ID Token, bukan access token / refresh token |
| Login berhasil tapi API 401 | CORS/ALLOWED_HOSTS atau token tak ter-attach | Cek `api.ts` interceptor; DevTools Network → Authorization header |
| `Firebase initialization warning` di backend | File credentials tidak ada/rusak | Verifikasi `firebase-credentials.json` ada di path env |
| Role tidak berubah jadi admin | UID tidak ada di `ADMIN_UIDS` | Tambah UID, restart backend, login ulang |
| Session hilang setelah refresh | `persistence` default browser | Gunakan `browserLocalPersistence` jika diinginkan |
| `auth/unauthorized-domain` | authDomain tidak terdaftar | Firebase Console → Authentication → Settings → Authorized domains |

---

## 7. Referensi

- [FIREBASE_SETUP_COMPLETE.md](./FIREBASE_SETUP_COMPLETE.md) — setup lengkap Firebase project
- [backend/app/core/auth.py](../backend/app/core/auth.py) — get_current_user & require_role
- [backend/app/core/firebase.py](../backend/app/core/firebase.py) — Admin SDK init & verify
- [frontend/lib/auth-context.tsx](../frontend/lib/auth-context.tsx) — session state
- [frontend/lib/api.ts](../frontend/lib/api.ts) — token attachment
- [SECURITY_HARDENING_REPORT.md](./SECURITY_HARDENING_REPORT.md) — audit keamanan
