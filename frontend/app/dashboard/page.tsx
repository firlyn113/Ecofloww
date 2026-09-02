'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useBatches, type Batch } from '@/lib/batches-context';
import CreateBatchModal from '@/src/components/features/CreateBatchModal';
import BatchCard from '@/src/components/features/BatchCard';
import FermentationLogModal from '@/src/components/features/FermentationLogModal';
import DailyLogModal from '@/src/components/features/DailyLogModal';
import DailyProgressHistory from '@/src/components/features/DailyProgressHistory';
import ProductRecommendationModal from '@/src/components/features/ProductRecommendationModal';
import BusinessAnalysisModal from '@/src/components/features/BusinessAnalysisModal';
import RoadmapModal from '@/src/components/features/RoadmapModal';

import { subscribeToOnlineSync, syncPendingFermentationLogs } from '@/lib/offline-queue';

export default function DashboardPage() {
  const { batches, loading: loadingBatches, error, refresh: refreshBatches } = useBatches();
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showDailyLogModal, setShowDailyLogModal] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [selectedProductTemplateId, setSelectedProductTemplateId] = useState<number | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (authLoading || !user) return;
    const sync = () => {
      syncPendingFermentationLogs().then((synced) => {
        if (synced > 0) {
          refreshBatches();
        }
      });
    };
    sync();
    return subscribeToOnlineSync(sync);
  }, [user, authLoading, refreshBatches]);

  const handleCreateBatch = async () => {
    await refreshBatches();
    setShowCreateModal(false);
  };

  const handleLogCreated = async () => {
    await refreshBatches();
    setShowLogModal(false);
    setSelectedBatch(null);
  };

  const handleDailyLogCreated = async () => {
    await refreshBatches();
    setShowDailyLogModal(false);
    setSelectedBatch(null);
  };

  const activeBatches = batches.filter(b => b.status !== 'harvested');
  const completedBatches = batches.filter(b => b.status === 'harvested');
  const totalWasteDivertedKg = batches.reduce((sum, batch) => sum + batch.waste_weight_kg, 0);
  const co2ConversionFactor = 1.9;
  const totalCO2AvoidedKg = totalWasteDivertedKg * co2ConversionFactor;

  if (authLoading || loadingBatches) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Loading Skeleton for Greeting Banner */}
          <div className="mb-8">
            <div className="h-48 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse"></div>
          </div>

          {/* Loading Skeleton for Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse"></div>
            ))}
          </div>

          {/* Loading Skeleton for Batch Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-96 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <GreetingBanner 
        userName={user?.displayName || 'Pengguna'} 
        onCreateBatch={() => setShowCreateModal(true)}
      />

      <div className="mt-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard 
            label="Total Batch"
            value={batches.length}
            icon="📦"
            tint="bg-emerald-100"
            accent="#059669"
          />
          <StatCard 
            label="Batch Aktif"
            value={activeBatches.length}
            icon="⚙️"
            tint="bg-amber-100"
            accent="#d97706"
          />
          <StatCard 
            label="Batch Selesai"
            value={completedBatches.length}
            icon="✅"
            tint="bg-teal-100"
            accent="#0d9488"
          />
          <StatCard 
            label="Limbah Diproses"
            value={`${totalWasteDivertedKg.toFixed(1)} kg`}
            icon="♻️"
            tint="bg-lime-100"
            accent="#65a30d"
          />
          <StatCard 
            label="CO₂ Dihindari"
            value={`${totalCO2AvoidedKg.toFixed(0)} kg`}
            icon="🌍"
            tint="bg-green-100"
            accent="#16a34a"
            highlight
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">⚠️</span>
              <div className="flex-1">
                <p className="font-semibold text-red-900">Terjadi Kesalahan</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                type="button"
                onClick={refreshBatches}
                className="shrink-0 px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3 justify-between">
                <span className="text-xl" aria-hidden="true">⚠️</span>
                <div className="flex-1">
                  <p className="font-semibold text-red-900">Terjadi Kesalahan</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={refreshBatches}
                  className="shrink-0 px-4 py-2 text-sm font-semibold text-red-700 border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          )}

        {/* Batch Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Batches */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Batch Aktif</h2>
                <p className="text-sm text-slate-500 mt-1">Sedang dalam proses fermentasi</p>
              </div>
              <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                {activeBatches.length} berjalan
              </span>
            </div>
            
            {loadingBatches ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : activeBatches.length === 0 ? (
              <div className="text-center py-10 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-4xl" aria-hidden="true">🌱</span>
                <p className="mt-3 text-slate-600 text-sm">
                  Belum ada batch aktif. Mulai batch baru untuk membuat eco-enzyme!
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Mulai Batch Baru
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeBatches.map((batch) => (
                  <div key={batch.id} className="group hover:shadow-md transition-shadow">
                    <BatchCard
                      batch={batch}
                      onLogClick={() => {
                        setSelectedBatch(batch);
                        setShowLogModal(true);
                      }}
                      onDailyLogClick={() => {
                        setSelectedBatch(batch);
                        setShowDailyLogModal(true);
                      }}
                      onRecommendationClick={() => {
                        setSelectedBatch(batch);
                        setShowRecommendationModal(true);
                      }}
                      onRoadmapClick={() => {
                        setSelectedBatch(batch);
                        setSelectedProductTemplateId(batch.selected_product_id ?? 1);
                        setShowRoadmapModal(true);
                      }}
                      onAnalysisClick={() => {
                        setSelectedBatch(batch);
                        setShowAnalysisModal(true);
                      }}
                    />
                    <div className="mt-4 pl-4">
                      <DailyProgressHistory batchId={batch.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Batches */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Batch Selesai</h2>
                <p className="text-sm text-slate-500 mt-1">Siap untuk diproses menjadi produk</p>
              </div>
              <span className="text-sm font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                {completedBatches.length} selesai
              </span>
            </div>
            
            {completedBatches.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-3xl opacity-60" aria-hidden="true">🏁</span>
                <p className="mt-3 text-slate-600 text-sm">
                  Belum ada batch yang selesai.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedBatches.map((batch) => (
                  <div key={batch.id} className="group hover:shadow-md transition-shadow">
                    <BatchCard
                      batch={batch}
                      isCompleted={true}
                      onRoadmapClick={() => {
                        setSelectedBatch(batch);
                        setSelectedProductTemplateId(batch.selected_product_id ?? 1);
                        setShowRoadmapModal(true);
                      }}
                      onAnalysisClick={() => {
                        setSelectedBatch(batch);
                        setShowAnalysisModal(true);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateBatchModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateBatch}
      />

      {selectedBatch && (
        <FermentationLogModal
          isOpen={showLogModal}
          onClose={() => setShowLogModal(false)}
          batch={selectedBatch}
          onSuccess={handleLogCreated}
        />
      )}

      {selectedBatch && (
        <DailyLogModal
          isOpen={showDailyLogModal}
          onClose={() => setShowDailyLogModal(false)}
          batch={selectedBatch}
          onSuccess={handleDailyLogCreated}
        />
      )}

      {selectedBatch && (
        <ProductRecommendationModal
          isOpen={showRecommendationModal}
          onClose={() => setShowRecommendationModal(false)}
          batchId={selectedBatch.id}
          onSuccess={() => {
            refreshBatches();
            setShowRecommendationModal(false);
          }}
        />
      )}

      {selectedBatch && (
        <BusinessAnalysisModal
          isOpen={showAnalysisModal}
          onClose={() => setShowAnalysisModal(false)}
          batchId={selectedBatch.id}
          onSuccess={() => {
            refreshBatches();
            setShowAnalysisModal(false);
          }}
        />
      )}

      {selectedBatch && selectedProductTemplateId && (
        <RoadmapModal
          isOpen={showRoadmapModal}
          onClose={() => setShowRoadmapModal(false)}
          batchId={selectedBatch.id}
          productTemplateId={selectedProductTemplateId}
          onSuccess={() => {
            refreshBatches();
            setShowRoadmapModal(false);
          }}
        />
      )}
    </>
  );
}

function GreetingBanner({
  userName,
  onCreateBatch,
}: {
  userName: string;
  onCreateBatch: () => void;
}) {
  return (
    <section aria-labelledby="greeting-title" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-6 md:p-8 text-white shadow-lg shadow-emerald-500/25">
      {/* Background pattern */}
      <div aria-hidden="true" className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-32 translate-x-16"></div>
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/10 to-transparent rounded-full translate-y-24 -translate-x-12"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 id="greeting-title" className="text-2xl md:text-3xl font-bold">Halo, {userName}</h1>
              <span className="text-xl" aria-hidden="true">👋</span>
            </div>
            <p className="text-emerald-100 text-base md:text-lg mb-6 max-w-xl leading-relaxed">
              Selamat datang di EcoFlow AI! Kelola fermentasi eco-enzymemu dengan mudah dan lihat dampak positif yang kamu ciptakan bagi lingkungan.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <span className="text-xl">🌱</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            type="button"
            onClick={onCreateBatch}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-600/20"
          >
            <span className="text-lg">+</span>
            <span>Mulai Batch Baru</span>
          </button>
          <p className="text-sm text-emerald-200">
            Mulai fermentasi eco-enzyme pertamamu
          </p>
        </div>
      </div>
      
      {/* Decorative bottom gradient */}
      <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-emerald-600/40 to-transparent rounded-b-2xl"></div>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon,
  tint,
  accent,
  highlight = false,
}: {
  label: string;
  value: string | number;
  icon: string;
  tint: string;
  accent: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`group relative rounded-xl p-5 border transition-all duration-300 hover:shadow-lg ${
        highlight
          ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/25'
          : 'bg-white border-slate-200 hover:border-emerald-200 text-slate-800 shadow-sm'
      }`}
    >
      {/* Subtle shine effect for highlight */}
      {highlight && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
      )}
      
      <div className="relative flex items-center justify-between">
        <div className="space-y-1">
          <p className={`text-xs font-medium ${highlight ? 'text-emerald-100' : 'text-slate-500'}`}>
            {label}
          </p>
          <p className={`text-2xl font-bold ${highlight ? 'text-white' : 'text-slate-800'}`}>{value}</p>
        </div>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-transform duration-300 group-hover:scale-110 ${
            highlight ? 'bg-white/20 backdrop-blur-sm' : tint
          }`}
          style={highlight ? undefined : { color: accent, boxShadow: `0 2px 8px ${accent}20` }}
        >
          {icon}
        </div>
      </div>
      
      {/* Progress indicator for active/inactive state */}
      {!highlight && (
        <div className="relative mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-emerald-400 rounded-full transition-all duration-500"
            style={{ 
              width: label.includes('Batch Aktif') && typeof value === 'number' ? 
                `min(100%, ${Math.max(10, (value as number) * 20)}%)` : '60%' 
            }}
          ></div>
        </div>
      )}
    </div>
  );
}
