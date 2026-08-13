'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LuLayoutDashboard,
  LuBoxes,
  LuCpu,
  LuClock,
  LuSettings,
  LuShield,
  LuLogOut,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuUser,
} from 'react-icons/lu';

interface SidebarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onSignOut: () => void;
  isAdmin: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
}

interface NavMenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  tabKey?: string;
}

const menuItems: NavMenuItem[] = [
  { label: 'Dasbor', icon: <LuLayoutDashboard className="h-5 w-5" />, path: '/dashboard' },
  { label: 'Batch Saya', icon: <LuBoxes className="h-5 w-5" />, path: '/dashboard/batches' },
  {
    label: 'Analisis AI',
    icon: <LuCpu className="h-5 w-5" />,
    path: '/dashboard/batches?tab=analisis',
    tabKey: 'analisis',
  },
  {
    label: 'Riwayat',
    icon: <LuClock className="h-5 w-5" />,
    path: '/dashboard/batches?tab=completed',
    tabKey: 'completed',
  },
  { label: 'Pengaturan', icon: <LuSettings className="h-5 w-5" />, path: '/dashboard/settings' },
];

function MenuTooltip({ label, show }: { label: string; show: boolean }) {
  if (!show) return null;
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl shadow-black/40 transition-opacity duration-200 group-hover:opacity-100"
    >
      {label}
    </span>
  );
}

export default function Sidebar({
  sidebarOpen,
  onToggleSidebar,
  onSignOut,
  isAdmin,
  onClose,
  userName = 'User',
  userEmail = '',
}: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const expanded = sidebarOpen;

  const isActive = (item: NavMenuItem): boolean => {
    if (item.path === '/dashboard/batches' && !item.tabKey) {
      return pathname === '/dashboard/batches' && (!tab || tab === 'all' || tab === 'active');
    }
    if (item.tabKey) {
      return pathname === '/dashboard/batches' && tab === item.tabKey;
    }
    return pathname === item.path;
  };

  const linkClasses = (active: boolean) =>
    `group relative flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 active:scale-[0.97] ${
      active
        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25'
        : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
    }`;

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      <aside
        aria-label="Navigasi utama"
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-emerald-100 bg-white/95 backdrop-blur transition-all duration-300 ease-in-out lg:translate-x-0 ${
          expanded ? 'w-64' : 'w-20'
        } ${expanded ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header: logo + toggle */}
        <div className={`flex h-16 shrink-0 items-center border-b border-emerald-50 ${expanded ? 'gap-3 px-4' : 'justify-center px-2'}`}>
          {expanded && (
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/30">
                <span className="text-lg font-extrabold text-white" aria-hidden="true">E</span>
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-emerald-800 font-extrabold leading-tight">EcoFlow</p>
                <p className="truncate text-[11px] font-medium text-slate-400">Eco-Enzyme AI</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={expanded ? 'Ciutkan navigasi' : 'Perluas navigasi'}
            aria-expanded={expanded}
            title={expanded ? 'Ciutkan' : 'Perluas'}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          >
            {expanded ? <LuPanelLeftClose className="h-5 w-5" /> : <LuPanelLeftOpen className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav aria-label="Menu utama" className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
          <p className={`px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${expanded ? '' : 'sr-only'}`}>
            Menu
          </p>
          {menuItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={`${linkClasses(active)} ${expanded ? '' : 'justify-center'}`}
              >
                <span className="shrink-0 transition-transform duration-200 group-hover:scale-110" aria-hidden="true">
                  {item.icon}
                </span>
                {expanded && <span className="truncate">{item.label}</span>}
                <MenuTooltip label={item.label} show={!expanded} />
                {!expanded && active && (
                  <span className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-emerald-400" aria-hidden="true" />
                )}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={onClose}
              className={`${linkClasses(pathname === '/admin')} ${expanded ? '' : 'justify-center'}`}
            >
              <span className="shrink-0 transition-transform duration-200 group-hover:scale-110" aria-hidden="true">
                <LuShield className="h-5 w-5" />
              </span>
              {expanded && <span className="truncate">Admin</span>}
              <MenuTooltip label="Admin" show={!expanded} />
              {!expanded && pathname === '/admin' && (
                <span className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-emerald-400" aria-hidden="true" />
              )}
            </Link>
          )}
        </nav>

        {/* Profile + Logout */}
        <div className="shrink-0 border-t border-emerald-50 p-3">
          <div className={`mb-2 flex items-center gap-3 rounded-xl px-2 py-2 ${expanded ? '' : 'justify-center'}`}>
            <div className="relative shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-md shadow-emerald-500/20">
                {userName.charAt(0).toUpperCase() || <LuUser className="h-4 w-4" aria-hidden="true" />}
              </div>
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
              />
            </div>
            <div className={`min-w-0 flex-1 overflow-hidden transition-all duration-300 ${expanded ? 'opacity-100' : 'hidden'}`}>
              <p className="truncate text-sm font-bold text-slate-800">{userName}</p>
              <p className="truncate text-xs text-slate-400">{userEmail || 'Pengguna terdaftar'}</p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Keluar dari akun"
            title={expanded ? undefined : 'Keluar dari akun'}
            onClick={onSignOut}
            className={`group relative flex min-h-11 w-full items-center gap-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:from-emerald-700 hover:to-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 active:scale-[0.98] ${
              expanded ? 'px-3 py-2.5' : 'justify-center px-0 py-2.5'
            }`}
          >
            <LuLogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            {expanded && <span>Keluar</span>}
            <MenuTooltip label="Keluar" show={!expanded} />
          </button>
        </div>
      </aside>
    </>
  );
}
