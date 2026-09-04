'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import apiClient from '@/lib/api';
import { FiArrowLeft, FiCheckCircle, FiMail, FiShield, FiUser, FiPhone, FiSave, FiLock, FiCamera } from 'react-icons/fi';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    apiClient
      .get('/api/v1/users/me')
      .then((response) => {
        const data = response.data.data;
        setProfile(data);
        setNameInput(data.name || user.displayName || '');
        setPhoneInput(data.phone || '');
      })
      .catch((error) => console.error('Gagal memuat profil:', error))
      .finally(() => setLoadingProfile(false));
  }, [user, authLoading]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await apiClient.patch('/api/v1/users/me', {
        name: nameInput,
        phone: phoneInput,
      });
      setProfile(response.data.data);
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string; message?: string } } }).response?.data?.detail ||
            (err as { response?: { data?: { detail?: string; message?: string } } }).response?.data?.message ||
            'Gagal memperbarui profil.'
          : 'Gagal memperbarui profil.';
      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = (role: string) => {
    const labels: Record<string, string> = {
      user: 'Pengguna',
      admin: 'Admin',
      community_admin: 'Admin Komunitas',
      platform_admin: 'Admin Platform',
    };
    return labels[role] ?? role;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
        >
          <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke Dasbor
        </Link>

        <h1 className="mt-4 text-xl font-extrabold text-slate-800 md:text-2xl">Pengaturan Akun</h1>
        <p className="mt-1 text-sm text-slate-500">
          Kelola informasi profil, kontak, dan preferensi akun Anda.
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm md:p-8">
        {loadingProfile ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-emerald-500" />
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {message && (
              <div
                className={`rounded-xl p-4 text-sm font-semibold ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <div className="relative group shrink-0">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-3xl font-extrabold text-white shadow-md shadow-emerald-500/25">
                  {(nameInput || profile?.name || user?.displayName || 'U').charAt(0).toUpperCase()}
                </div>
                <button
                  type="button"
                  title="Ubah Foto Profil"
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                >
                  <FiCamera className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <h2 className="truncate text-lg font-extrabold text-slate-800">
                  {profile?.name || user?.displayName || 'Pengguna'}
                </h2>
                <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    <FiShield className="h-3 w-3" aria-hidden="true" />
                    {roleLabel(profile?.role ?? 'user')}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    <FiCheckCircle className="h-3 w-3 text-emerald-500" /> Akun Terverifikasi
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 border-t border-slate-100 pt-6 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FiUser className="h-4 w-4 text-emerald-600" /> Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FiPhone className="h-4 w-4 text-emerald-600" /> Nomor Telepon / WA
                </label>
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Contoh: 081234567890"
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FiMail className="h-4 w-4 text-emerald-600" /> Email (Tersinkronisasi)
                </label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || user?.email || ''}
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FiLock className="h-4 w-4 text-emerald-600" /> ID Pengguna
                </label>
                <input
                  type="text"
                  disabled
                  value={profile?.id || ''}
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-mono text-xs text-slate-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] disabled:opacity-50"
              >
                <FiSave className="h-4 w-4" />
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
