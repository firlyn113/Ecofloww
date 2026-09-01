'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import apiClient from '@/lib/api';
import { FiArrowLeft, FiCheckCircle, FiMail, FiShield, FiUser } from 'react-icons/fi';

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

  useEffect(() => {
    if (authLoading || !user) return;
    apiClient
      .get('/api/v1/users/me')
      .then((response) => setProfile(response.data.data))
      .catch((error) => console.error('Gagal memuat profil:', error))
      .finally(() => setLoadingProfile(false));
  }, [user, authLoading]);

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
    <div className="mx-auto max-w-3xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
      >
        <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke Dasbor
      </Link>

      <h1 className="mt-4 text-xl font-extrabold text-slate-800 md:text-2xl">Pengaturan</h1>
      <p className="mt-1 text-sm text-slate-500">
        Kelola informasi profil akunmu.
      </p>

      <div className="mt-6 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm md:p-8">
        {loadingProfile ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-emerald-500" />
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl font-extrabold text-white shadow-md shadow-emerald-500/25">
                {(profile?.name || user?.displayName || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <h2 className="truncate text-lg font-extrabold text-slate-800">
                  {profile?.name || user?.displayName || 'Pengguna'}
                </h2>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  <FiShield className="h-3 w-3" aria-hidden="true" />
                  {roleLabel(profile?.role ?? 'user')}
                </span>
              </div>
            </div>

            <dl className="mt-8 space-y-4 border-t border-slate-100 pt-6">
              <div className="flex items-start justify-between gap-4">
                <dt className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <FiUser className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                  Nama
                </dt>
                <dd className="text-sm font-bold text-slate-800">
                  {profile?.name || user?.displayName || '—'}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <FiMail className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                  Email
                </dt>
                <dd className="text-sm font-bold text-slate-800">
                  {profile?.email || user?.email || '—'}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <FiCheckCircle className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                  ID Akun
                </dt>
                <dd className="max-w-[60%] truncate text-sm font-medium text-slate-600">
                  {profile?.id || '—'}
                </dd>
              </div>
            </dl>

            <div className="mt-8 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
              <p className="font-bold">Catatan</p>
              <p className="mt-1">
                Edit profil (nama, telepon) dilakukan via <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs">PATCH /api/v1/users/me</code>.
                Fitur pengaturan lanjutan akan tersedia pada rilis berikutnya.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
