'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiPhone, FiArrowRight, FiCheck } from 'react-icons/fi';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import apiClient from '@/lib/api';

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

const getFirebaseErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/user-not-found': 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.',
    'auth/wrong-password': 'Kata sandi salah. Silakan coba lagi.',
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/email-already-in-use': 'Email sudah terdaftar. Gunakan email lain atau masuk.',
    'auth/weak-password': 'Kata sandi terlalu lemah. Gunakan minimal 6 karakter.',
    'auth/operation-not-allowed': 'Metode autentikasi tidak diizinkan.',
    'auth/invalid-credential': 'Email atau kata sandi salah.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
    'auth/network-request-failed': 'Koneksi jaringan gagal. Periksa internet Anda.',
    'auth/popup-closed-by-user': 'Popup sign-in ditutup sebelum selesai.',
    'auth/cancelled-popup-request': 'Permintaan popup dibatalkan.',
    'auth/account-exists-with-different-credential': 'Akun sudah ada dengan metode sign-in berbeda.',
  };
  return errorMessages[errorCode] || 'Autentikasi gagal. Silakan coba lagi.';
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard');
  };

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const persistProfile = async (displayName: string, phoneNumber: string) => {
    try {
      await apiClient.patch('/api/v1/users/me', {
        name: displayName,
        phone: phoneNumber,
      });
    } catch (error) {
      console.error('Gagal menyimpan profil:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(userCredential.user, { displayName: name.trim() });
        }
        await persistProfile(name.trim(), phone.trim());
        showToast('Akun berhasil dibuat', 'Selamat datang di EcoFlow AI!', 'success');
        handleSuccess();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        handleSuccess();
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      const errorMessage = err.code ? getFirebaseErrorMessage(err.code) : (err.message || 'Autentikasi gagal');
      showToast('Gagal masuk', errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      persistProfile(result.user.displayName || '', '');
      handleSuccess();
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      const errorMessage = err.code ? getFirebaseErrorMessage(err.code) : (err.message || 'Google sign-in gagal');
      showToast('Gagal masuk dengan Google', errorMessage, 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex items-center justify-center p-4">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 max-w-md rounded-lg border p-4 shadow-lg animate-slide-in-right ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
              toast.type === 'error' ? 'bg-red-100 text-red-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {toast.type === 'success' ? <FiCheck /> : '!'}
            </div>
            <div>
              <p className="font-semibold">{toast.title}</p>
              <p className="text-sm mt-1">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="ml-auto text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 mb-4">
            <span className="text-2xl font-bold text-white">E</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">EcoFlow AI</h1>
          <p className="text-slate-600 mt-2">Asisten Fermentasi Eco-Enzyme Pintar</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-emerald-500/10 border border-slate-200 overflow-hidden">
          {/* Card Header */}
          <div className="p-8 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800">
              {isSignUp ? 'Daftar Akun Baru' : 'Masuk ke Akun'}
            </h2>
            <p className="text-slate-600 mt-2">
              {isSignUp ? 'Bergabung dengan komunitas eco-enzyme' : 'Lanjutkan perjalanan fermentasimu'}
            </p>
          </div>

          <div className="p-8">
            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-slate-800 font-medium rounded-lg border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
              ) : (
                <>
                  <GoogleLogo />
                  <span>{isSignUp ? 'Daftar dengan Google' : 'Masuk dengan Google'}</span>
                </>
              )}
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">atau</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <FiUser className="text-slate-400" />
                      Nama lengkap
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama Lengkap"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors"
                      required={isSignUp}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <FiPhone className="text-slate-400" />
                      Nomor telepon (opsional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+62 812-3456-7890"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FiMail className="text-slate-400" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FiLock className="text-slate-400" />
                  Kata sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {!isSignUp && (
                  <p className="text-xs text-slate-500 mt-1">
                    Minimal 6 karakter
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{isSignUp ? 'Daftar' : 'Masuk'}</span>
                    <FiArrowRight />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Sign Up/Login */}
            <div className="mt-6 text-center">
              <p className="text-slate-600">
                {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline"
                >
                  {isSignUp ? 'Masuk' : 'Daftar'}
                </button>
              </p>
            </div>
          </div>

          {/* Card Footer */}
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Dengan melanjutkan, Anda menyetujui{' '}
              <a href="#" className="text-emerald-600 hover:underline">Syarat Layanan</a> dan{' '}
              <a href="#" className="text-emerald-600 hover:underline">Kebijakan Privasi</a>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Platform monitoring fermentasi eco-enzyme berbasis AI
          </p>
        </div>
      </div>
    </div>
  );
}