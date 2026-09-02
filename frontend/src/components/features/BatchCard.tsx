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

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                <span className="text-lg">🌱</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{batch.name}</h3>
                <p className="text-sm text-slate-500">
                  Dimulai {formatDistanceToNow(startDate, { addSuffix: true, locale: id })}
                </p>
              </div>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(batch.status)}`}>
            {getStatusLabel(batch.status)}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-5 border-b border-slate-100">
        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">Progres Fermentasi</span>
            <span className="text-sm font-medium text-emerald-600">{getDaysText()}</span>
          </div>
          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          {!isCompleted && daysRemaining > 0 && (
            <p className="text-xs text-slate-500 mt-2">
              Perkiraan panen: {formatDistanceToNow(harvestDate, { addSuffix: true, locale: id })}
            </p>
          )}
        </div>

        {/* Batch Details */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">Bahan Baku</p>
            <p className="font-semibold text-slate-800">{batch.waste_weight_kg} kg</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">Kebutuhan Air</p>
            <p className="font-semibold text-slate-800">{batch.water_liters} L</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">Kebutuhan Gula</p>
            <p className="font-semibold text-slate-800">{batch.sugar_kg} kg</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">Status</p>
            <p className="font-semibold text-slate-800">{getStatusLabel(batch.status)}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-5">
        {isCompleted ? (
          <div className="flex gap-3">
            <button
              onClick={onRoadmapClick}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Lihat Roadmap
            </button>
            <button
              onClick={onAnalysisClick}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-lg hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Analisis Bisnis
            </button>
          </div>
        ) : batch.status !== 'failed' ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={onLogClick}
                className="flex-1 px-3 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Catatan Fermentasi
              </button>
              <button
                onClick={onDailyLogClick}
                className="flex-1 px-3 py-2.5 bg-teal-500 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors"
              >
                Progres Harian
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onRecommendationClick}
                className="flex-1 px-3 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors"
              >
                Rekomendasi Produk
              </button>
              <button
                onClick={onRoadmapClick}
                className="flex-1 px-3 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors"
              >
                Roadmap
              </button>
            </div>
            <button
              onClick={onAnalysisClick}
              className="w-full px-3 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold rounded-lg hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Analisis Bisnis
            </button>
          </div>
        ) : (
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700 font-medium">Batch ini gagal. Mulai batch baru untuk mencoba lagi.</p>
          </div>
        )}
      </div>
    </div>
  );
}