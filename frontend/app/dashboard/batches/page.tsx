'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useBatches, type Batch } from '@/lib/batches-context';
import apiClient from '@/lib/api';
import CreateBatchModal from '@/src/components/features/CreateBatchModal';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { FiBox, FiCalendar, FiDroplet, FiPlus, FiThermometer, FiTrendingUp } from 'react-icons/fi';
import { LuCpu } from 'react-icons/lu';

interface BatchAnalysis {
  batch: Batch;
  latest_status: string | null;
  latest_health_score: number | null;
  incubation_days: number;
  expected_harvest_date: string | null;
  total_logs: number;
}

const BATCH_DURATION_DAYS = 90;

type TabKey = 'all' | 'active' | 'completed' | 'analisis';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'active', label: 'Sedang Diproses' },
  { key: 'completed', label: 'Selesai' },
  { key: 'analisis', label: 'Analisis AI' },
];

function formatDate(value: string | null): string {
  if (!value) return '—';
  try {
    return format(parseISO(value), 'dd MMM yyyy', { locale: localeId });
  } catch {
    return '—';
  }
}

function BatchStatusBadge({ status }: { status: string }) {
  const completed = status === 'harvested';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
        completed ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'
      }`}
    >
      {completed ? 'SELESAI' : 'SEDANG DIPROSES'}
    </span>
  );
}

function BatchProgress({ startDate }: { startDate: string }) {
  const days = Math.max(
    differenceInCalendarDays(new Date(), parseISO(startDate)),
    0
  );
  const progress = Math.min((days / BATCH_DURATION_DAYS) * 100, 100);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-500">Progres Fermentasi</span>
        <span className="font-bold text-slate-700">
          Hari {days} dari {BATCH_DURATION_DAYS}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function BatchCard({ batch, isCompleted }: { batch: Batch; isCompleted?: boolean }) {
  return (
    <div className="flex flex-col rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-800">{batch.name}</h3>
          <p className="mt-0.5 text-xs text-slate-400">Batch #{batch.id}</p>
        </div>
        <BatchStatusBadge status={batch.status} />
      </div>

      <div className="flex-1">
        <BatchProgress startDate={batch.start_date} />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <FiBox className="h-3 w-3" aria-hidden="true" /> Bahan
          </p>
          <p className="mt-1 text-sm font-extrabold text-slate-800">{batch.waste_weight_kg} kg</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <FiDroplet className="h-3 w-3" aria-hidden="true" /> Air
          </p>
          <p className="mt-1 text-sm font-extrabold text-slate-800">{batch.water_liters} L</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <FiThermometer className="h-3 w-3" aria-hidden="true" /> Gula
          </p>
          <p className="mt-1 text-sm font-extrabold text-slate-800">{batch.sugar_kg} kg</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <FiCalendar className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
          Panen: <span className="font-semibold text-slate-700">{formatDate(batch.harvest_date)}</span>
        </p>
        <Link
          href="/dashboard"
          className="text-xs font-bold text-emerald-600 transition-colors hover:text-emerald-700"
        >
          {isCompleted ? 'Lihat Analisis →' : 'Kelola di Dasbor →'}
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-white/60 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
        <FiBox className="h-8 w-8 text-emerald-400" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-lg font-extrabold text-slate-800">Belum Ada Batch di Sini</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
        Mulai perjalanan eco-enzymemu! Buat batch pertama untuk memantau fermentasi dan
        dapatkan rekomendasi dari AI.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
      >
        <FiPlus className="h-4 w-4" aria-hidden="true" />
        Buat Batch Pertama
      </button>
    </div>
  );
}

function AnalysisTab({ batches, onRefresh }: { batches: Batch[]; onRefresh: () => void }) {
  const [analysis, setAnalysis] = useState<BatchAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      batches.slice(0, 20).map((batch) =>
        apiClient
          .get(`/api/v1/batches/${batch.id}/dashboard`)
          .then((response) => ({ batch, data: response.data.data }))
          .catch(() => null)
      )
    )
      .then((results) => {
        if (cancelled) return;
        setAnalysis(
          results.filter((r): r is { batch: Batch; data: { [k: string]: unknown } } => r !== null)
            .map(({ batch, data }) => ({
              batch,
              latest_status: (data.latest_status as string | null) ?? null,
              latest_health_score: (data.latest_health_score as number | null) ?? null,
              incubation_days: (data.incubation_days as number) ?? 0,
              expected_harvest_date: (data.expected_harvest_date as string | null) ?? null,
              total_logs: (data.total_logs as number) ?? 0,
            }))
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [batches]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (analysis.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-white/60 px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
          <LuCpu className="h-8 w-8 text-emerald-400" aria-hidden="true" />
        </div>
        <h3 className="mt-5 text-lg font-extrabold text-slate-800">Belum Ada Data AI</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
          Buat batch dan catat log fermentasi pertamamu, lalu AI akan menganalisis kesehatan
          setiap batch secara otomatis.
        </p>
        <button
          type="button"
          onClick={onRefresh}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700"
        >
          <FiPlus className="h-4 w-4" aria-hidden="true" />
          Buat Batch Pertama
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {analysis.map(({ batch, latest_status, latest_health_score, incubation_days, expected_harvest_date, total_logs }) => {
        const statusColor =
          latest_status === 'Failed' ? 'bg-red-50 text-red-600' :
          latest_status === 'Caution' ? 'bg-amber-50 text-amber-600' :
          'bg-emerald-50 text-emerald-600';
        return (
          <div key={batch.id} className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-extrabold text-slate-800">{batch.name}</h3>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusColor}`}>
                  AI: {latest_status ?? 'Belum ada log'}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Hari ke-{incubation_days} · {total_logs} log · Panen: {formatDate(expected_harvest_date)}
              </p>
            </div>
            <div className="flex items-center gap-4 sm:w-48">
              <div className="w-24">
                <p className="mb-1 text-[11px] font-medium text-slate-500">Health Score</p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                    style={{ width: `${latest_health_score ?? 0}%` }}
                  />
                </div>
              </div>
              <span className="text-lg font-extrabold text-slate-800">
                {latest_health_score != null ? latest_health_score.toFixed(0) : '—'}
              </span>
              <Link
                href="/dashboard"
                className="shrink-0 text-xs font-bold text-emerald-600 transition-colors hover:text-emerald-700"
              >
                Buka →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BatchesContent() {
  const { batches, loading, refresh: refreshBatches } = useBatches();
  const searchParams = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const tabParam = searchParams.get('tab');
  const activeTab: TabKey = TABS.some((t) => t.key === tabParam)
    ? (tabParam as TabKey)
    : 'all';

  const filtered = batches.filter((batch) => {
    if (activeTab === 'active') return batch.status !== 'harvested';
    if (activeTab === 'completed') return batch.status === 'harvested';
    return true;
  });

  const showEmptyState =
    !loading && batches.length === 0 && activeTab !== 'analisis';

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 md:text-2xl">
            Daftar Batch Fermentasi
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Pantau semua batch eco-enzyme dan progres fermentasimu di satu tempat.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
        >
          <FiPlus className="h-4 w-4" aria-hidden="true" />
          Buat Batch Baru
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Filter batch"
        className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-emerald-100 bg-white/70 p-1.5 backdrop-blur sm:w-fit"
      >
        {TABS.map((tab) => {
          const selected = activeTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.key === 'all' ? '/dashboard/batches' : `/dashboard/batches?tab=${tab.key}`}
              role="tab"
              aria-selected={selected}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                selected
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-emerald-500" />
        </div>
      ) : activeTab === 'analisis' ? (
        <div className="mt-6">
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
            <FiTrendingUp className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            Ringkasan status AI & kesehatan untuk setiap batch.
          </div>
          <AnalysisTab batches={batches} onRefresh={() => setShowCreateModal(true)} />
        </div>
      ) : showEmptyState ? (
        <div className="mt-6">
          <EmptyState onCreate={() => setShowCreateModal(true)} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState onCreate={() => setShowCreateModal(true)} />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((batch) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              isCompleted={activeTab === 'completed'}
            />
          ))}
        </div>
      )}

      <CreateBatchModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          refreshBatches();
        }}
      />
    </div>
  );
}

export default function BatchesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-emerald-500" />
        </div>
      }
    >
      <BatchesContent />
    </Suspense>
  );
}
