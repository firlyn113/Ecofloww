'use client';

import { formatDistanceToNow, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

interface Batch {
  id: number;
  name: string;
  status: string;
  waste_weight_kg: number;
  water_liters: number;
  sugar_kg: number;
  start_date: string;
  harvest_date: string;
  created_at: string;
  selected_product_id?: number | null;
}

interface BatchCardProps {
  batch: Batch;
  onLogClick?: () => void;
  onDailyLogClick?: () => void;
  onRecommendationClick?: () => void;
  onAnalysisClick?: () => void;
  onRoadmapClick?: () => void;
  isCompleted?: boolean;
}

export default function BatchCard({ 
  batch, 
  onLogClick, 
  onDailyLogClick, 
  onRecommendationClick, 
  onAnalysisClick, 
  onRoadmapClick, 
  isCompleted 
}: BatchCardProps) {
  const startDate = parseISO(batch.start_date);
  const harvestDate = parseISO(batch.harvest_date);
  const now = new Date();
  const totalDays = Math.floor((harvestDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const progressPercent = Math.min((elapsedDays / totalDays) * 100, 100);
  const daysRemaining = Math.max(0, totalDays - elapsedDays);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'harvested':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'paused':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'SEDANG DIPROSES';
      case 'pending_start':
        return 'MENUNGGU DIMULAI';
      case 'completed':
        return 'SELESAI';
      case 'harvested':
        return 'DIPANEN';
      case 'failed':
        return 'GAGAL';
      case 'paused':
        return 'DIJEDA';
      default:
        return status.replace(/_/g, ' ').toUpperCase();
    }
  };

  const getDaysText = () => {
    if (isCompleted) {
      return 'Selesai';
    }
    return `Hari ke-${elapsedDays} dari ${totalDays}`;
  };

  const actionBase =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] shadow-sm hover:-translate-y-0.5 hover:shadow-md';

  const actionLog =
    '!border-emerald-600 !bg-emerald-600 !text-white hover:!bg-emerald-700 hover:!border-emerald-700 focus-visible:outline-emerald-500';

  const actionDaily =
    '!border-teal-600 !bg-teal-600 !text-white hover:!bg-teal-700 hover:!border-teal-700 focus-visible:outline-teal-500';

  const actionRecommendation =
    '!border-sky-600 !bg-sky-600 !text-white hover:!bg-sky-700 hover:!border-sky-700 focus-visible:outline-sky-500';

  const actionRoadmap =
    '!border-amber-500 !bg-amber-500 !text-slate-950 hover:!bg-amber-600 hover:!border-amber-600 focus-visible:outline-amber-500';

  const actionPrimary =
    '!border-emerald-600 !bg-gradient-to-r !from-emerald-600 !via-teal-600 !to-emerald-700 !text-white font-bold shadow-lg shadow-emerald-600/30 hover:-translate-y-0.5 hover:!from-emerald-700 hover:!via-teal-700 hover:!to-emerald-800 hover:shadow-xl hover:shadow-emerald-600/40 focus-visible:outline-emerald-400 text-base tracking-wide';

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="border-b border-slate-100 bg-gradient-to-r from-white via-emerald-50/30 to-emerald-50/50 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100">
                <span className="text-lg" aria-hidden="true">🌱</span>
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-extrabold text-slate-800">{batch.name}</h3>
                <p className="text-sm text-slate-500">
                  Dimulai {formatDistanceToNow(startDate, { addSuffix: true, locale: id })}
                </p>
              </div>
            </div>
          </div>
          <div className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusColor(batch.status)}`}>
            {getStatusLabel(batch.status)}
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Progres Fermentasi</span>
            <span className="text-sm font-semibold text-emerald-600">{getDaysText()}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {!isCompleted && daysRemaining > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              Perkiraan panen: {formatDistanceToNow(harvestDate, { addSuffix: true, locale: id })}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Bahan Baku</p>
            <p className="mt-1 font-bold text-slate-800">{batch.waste_weight_kg} kg</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Kebutuhan Air</p>
            <p className="mt-1 font-bold text-slate-800">{batch.water_liters} L</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Kebutuhan Gula</p>
            <p className="mt-1 font-bold text-slate-800">{batch.sugar_kg} kg</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Status</p>
            <p className="mt-1 font-bold text-slate-800">{getStatusLabel(batch.status)}</p>
          </div>
        </div>

        {isCompleted ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={onRoadmapClick}
              className={`${actionBase} ${actionRoadmap}`}
            >
              Lihat Roadmap
            </button>
            <button
              onClick={onAnalysisClick}
              className={`${actionBase} ${actionPrimary}`}
            >
              📊 Analisis Bisnis
            </button>
          </div>
        ) : batch.status !== 'failed' ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={onLogClick}
                className={`${actionBase} ${actionLog}`}
              >
                Catatan Fermentasi
              </button>
              <button
                onClick={onDailyLogClick}
                className={`${actionBase} ${actionDaily}`}
              >
                Progres Harian
              </button>
              <button
                onClick={onRecommendationClick}
                className={`${actionBase} ${actionRecommendation}`}
              >
                Rekomendasi Produk
              </button>
              <button
                onClick={onRoadmapClick}
                className={`${actionBase} ${actionRoadmap}`}
              >
                Lihat Roadmap
              </button>
            </div>
            <button
              onClick={onAnalysisClick}
              className={`${actionBase} w-full ${actionPrimary}`}
            >
              📊 Analisis Bisnis
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-sm font-medium text-red-700">Batch ini gagal. Mulai batch baru untuk mencoba lagi.</p>
          </div>
        )}
      </div>
    </div>
  );
}