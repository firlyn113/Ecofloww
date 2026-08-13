'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { useAuth } from '@/lib/auth-context';
import apiClient from '@/lib/api';

export interface Batch {
  id: number;
  name: string;
  status: string;
  waste_weight_kg: number;
  water_liters: number;
  sugar_kg: number;
  selected_product_id: number | null;
  start_date: string;
  harvest_date: string;
  created_at: string;
}

interface BatchesContextValue {
  batches: Batch[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const BatchesContext = createContext<BatchesContextValue>({
  batches: [],
  loading: true,
  error: null,
  refresh: async () => {},
});

/**
 * Provider global data batch untuk seluruh halaman /dashboard/*.
 *
 * Sumber data tunggal: semua halaman (dashboard utama, batches, dll) membaca
 * dari context yang sama, sehingga batch yang dibuat di satu halaman langsung
 * muncul di halaman lain tanpa refresh manual.
 *
 * - Fetch awal otomatis saat user login (sekali saja per mount provider).
 * - `refresh()` memuat ulang dari API dan menyebar ke semua konsumen.
 * - Auto re-fetch saat jendela browser menerima fokus (perubahan dari tab lain).
 */
export function BatchesProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/v1/batches');
      setBatches(response.data.data.batches || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load batches:', err);
      setError('Gagal memuat data batch. Pastikan backend berjalan di http://localhost:8000');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (hasFetched.current) return;
    hasFetched.current = true;
    refresh();
  }, [user, authLoading, refresh]);

  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === 'visible' && user) {
        refresh();
      }
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [user, refresh]);

  return (
    <BatchesContext.Provider value={{ batches, loading, error, refresh }}>
      {children}
    </BatchesContext.Provider>
  );
}

export function useBatches(): BatchesContextValue {
  return useContext(BatchesContext);
}
