'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import apiClient from '@/lib/api';
import { BatchesProvider } from '@/lib/batches-context';
import Sidebar from '@/src/components/layout/Sidebar';
import { LuMenu } from 'react-icons/lu';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [userAvatar, setUserAvatar] = useState<string>('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    apiClient
      .get('/api/v1/users/me')
      .then((response) => {
        const userData = response.data.data;
        setIsAdmin(userData.role === 'admin');
        if (userData.avatar_url) setUserAvatar(userData.avatar_url);
      })
      .catch(() => setIsAdmin(false));
  }, [user, authLoading, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!user) return null;

  const userName = user.displayName || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';

  return (
    <div className="flex h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-3 focus:text-emerald-900"
      >
        Lewati ke konten utama
      </a>

      <Suspense fallback={null}>
        <Sidebar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          onSignOut={handleSignOut}
          isAdmin={isAdmin}
          onClose={() => setSidebarOpen(false)}
          userName={userName}
          userEmail={userEmail}
        />
      </Suspense>

      {/* Main content area with proper margin to account for sidebar */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-20">
        <header className="flex items-center justify-between border-b border-emerald-100 bg-white/80 px-4 py-3 backdrop-blur transition-all duration-300 md:px-6 md:py-4">
          <button
            type="button"
            aria-label="Buka atau tutup navigasi"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-emerald-700 transition-colors hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 lg:hidden"
          >
            <LuMenu className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="hidden items-center gap-4 md:flex" aria-hidden="true" />

          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-700">{userName}</p>
              <p className="hidden text-xs text-slate-400 sm:block">{userEmail}</p>
            </div>
            {userAvatar ? (
              <img src={userAvatar} alt="Foto Profil" className="h-10 w-10 rounded-full object-cover shadow-md shadow-emerald-500/20" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20">
                <span className="text-sm font-bold text-white">{userName.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto px-4 py-4 focus:outline-none md:px-6 md:py-6"
        >
          <BatchesProvider>{children}</BatchesProvider>
        </main>
      </div>
    </div>
  );
}
