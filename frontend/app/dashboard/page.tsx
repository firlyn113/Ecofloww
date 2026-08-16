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
import MilestonesPanel from '@/src/components/features/MilestonesPanel';
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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-emerald-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <>
      <GreetingBanner 
        userName={user?.displayName || 'User'} 
        onCreateBatch={() => setShowCreateModal(true)}
      />

          <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
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
          </div>

          <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            <StatCard 
              label="Total Limbah Diproses"
              value={`${totalWasteDivertedKg.toFixed(2)} kg`}
              icon="♻️"
              tint="bg-lime-100"
              accent="#65a30d"
            />
            <StatCard 
              label="CO₂ Dihindari (estimasi)"
              value={`${totalCO2AvoidedKg.toFixed(2)} kg`}
              icon="🌍"
              tint="bg-green-100"
              accent="#16a34a"
              highlight
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3 justify-between">
                <span className="text-xl" aria-hidden="true">⚠️</span>
                <div className="flex-1">
                  <p className="font-semibold text-red-900">Error</p>
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

          <div className="mt-6 md:mt-8">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg md:text-xl font-extrabold text-slate-800">
                 Batch Aktif
               </h2>
               <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                 {activeBatches.length} berjalan
               </span>
             </div>
             {loadingBatches ? (
               <div className="flex justify-center py-12">
                 <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
               </div>
             ) : activeBatches.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-emerald-100 shadow-sm">
                <span className="text-4xl" aria-hidden="true">🌱</span>
                <p className="mt-3 text-slate-500 text-sm md:text-base">
                  Belum ada batch aktif. Mulai satu untuk membuat eco-enzyme pertamamu!
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 min-h-11 px-5 py-2 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Mulai Batch Baru
                </button>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {activeBatches.map((batch) => (
                  <div key={batch.id} className="bg-white rounded-2xl border border-emerald-100 shadow-sm">
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
                    <MilestonesPanel batchId={batch.id} />
                    <DailyProgressHistory batchId={batch.id} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 md:mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-extrabold text-slate-800">
                Batch Selesai
              </h2>
              <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
                {completedBatches.length} selesai
              </span>
            </div>
            {completedBatches.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-3xl opacity-60" aria-hidden="true">🏁</span>
                <p className="mt-3 text-slate-500 text-sm md:text-base">
                  Belum ada batch yang selesai.
                </p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {completedBatches.map((batch) => (
                  <BatchCard
                    key={batch.id}
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
                ))}
              </div>
            )}
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
    <section aria-labelledby="greeting-title" className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 p-6 md:p-8 text-white shadow-lg shadow-emerald-500/20">
      <div aria-hidden="true" className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full"></div>
      <div aria-hidden="true" className="absolute right-24 -bottom-10 w-32 h-32 bg-white/10 rounded-full"></div>
      <h1 id="greeting-title" className="text-2xl md:text-3xl font-extrabold mb-2">Halo {userName} <span aria-hidden="true">👋</span></h1>
      <p className="text-emerald-50 text-base md:text-lg mb-6 max-w-xl">
        Selamat datang! Kelola eco-enzymemu dengan mudah dan lihat dampak positifmu bagi lingkungan.
      </p>
      <button
        type="button"
        onClick={onCreateBatch}
        className="min-h-11 px-6 py-2 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors shadow-md"
      >
        + Mulai Batch Baru
      </button>
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
      className={`group rounded-2xl p-6 border shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 cursor-default ${
        highlight
          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-emerald-500/20'
          : 'bg-white border-emerald-100 text-slate-800'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-semibold ${highlight ? 'text-emerald-50' : 'text-slate-500'}`}>
            {label}
          </p>
          <p className={`text-3xl font-extrabold mt-2 ${highlight ? 'text-white' : 'text-slate-800'}`}>{value}</p>
        </div>
        <span
          aria-hidden="true"
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${
            highlight ? 'bg-white/20' : tint
          }`}
          style={highlight ? undefined : { color: accent }}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}
