'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';

interface Milestone {
  day: number;
  description: string;
}

interface DashboardData {
  batch_id: number;
  batch_name: string;
  status: string;
  waste_diverted_kg: number;
  incubation_days: number;
  expected_harvest_date: string | null;
  latest_status: string | null;
  latest_health_score: number | null;
  total_logs: number;
  upcoming_milestones: Milestone[];
}

export default function MilestonesPanel({ batchId }: { batchId: number }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get(`/api/v1/batches/${batchId}/dashboard`)
      .then((response) => {
        if (!cancelled) {
          setData(response.data.data);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [batchId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-2 py-3 text-sm text-slate-400">
        <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-emerald-500 rounded-full" />
        Memuat milestone...
      </div>
    );
  }

  if (!data || !data.upcoming_milestones || data.upcoming_milestones.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 px-2">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
        Milestone Berikutnya
      </p>
      <ol className="space-y-2">
        {data.upcoming_milestones.map((milestone, index) => {
          const isReached = data.incubation_days >= milestone.day;
          return (
            <li key={index} className="flex items-start gap-2">
              <span
                aria-hidden="true"
                className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  isReached
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {isReached && (
                  <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="currentColor">
                    <path d="M10.7 2.3a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4 0l-3-3a1 1 0 1 1 1.4-1.4L5 6.6l4.3-4.3a1 1 0 0 1 1.4 0z" />
                  </svg>
                )}
              </span>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    isReached ? 'text-emerald-700 line-through' : 'text-slate-700'
                  }`}
                >
                  Hari ke-{milestone.day}
                  {isReached && (
                    <span className="ml-2 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      tercapai
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500">{milestone.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
