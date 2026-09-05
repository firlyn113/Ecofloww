'use client';

import { useEffect, useState } from 'react';
import apiClient, { getErrorMessage } from '@/lib/api';
import { FiUsers, FiShare2, FiTrendingUp, FiHeart, FiMessageCircle, FiFilter, FiChevronRight, FiAward } from 'react-icons/fi';

interface LeaderboardItem {
  user_id: string;
  name: string;
  region?: string | null;
  total_points: number;
  rank: number;
}

interface LeaderboardResponse {
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  data: LeaderboardItem[];
}

interface CommunityBatch {
  id: number;
  userName: string;
  userAvatar?: string;
  batchName: string;
  wasteWeight: number;
  status: string;
  daysElapsed: number;
  tips: string;
  likes: number;
  comments: number;
  sharedAt: string;
}

const mockCommunityBatches: CommunityBatch[] = [
  {
    id: 1,
    userName: 'Ibu Siti Rahayu',
    batchName: 'Sampah Dapur - Juli 2026',
    wasteWeight: 12.5,
    status: 'active',
    daysElapsed: 45,
    tips: 'Saya tambahkan kulit jeruk untuk aroma yang lebih segar. Pastikan tutup rapat!',
    likes: 24,
    comments: 8,
    sharedAt: '2 hari lalu',
  },
  {
    id: 2,
    userName: 'Pak Budi Santoso',
    batchName: 'Batch Organik RT 05',
    wasteWeight: 25.0,
    status: 'harvested',
    daysElapsed: 90,
    tips: 'Hasil panen sangat baik! Kunci sukses: jangan buka tutup terlalu sering, cek gas seminggu sekali.',
    likes: 56,
    comments: 15,
    sharedAt: '1 minggu lalu',
  },
  {
    id: 3,
    userName: 'Komunitas Hijau Jakarta',
    batchName: 'Eco-Enzyme Komunitas #12',
    wasteWeight: 50.0,
    status: 'active',
    daysElapsed: 60,
    tips: 'Batch komunitas skala besar! Kami gunakan drum 200L. Progress sangat baik dengan pH 3.5.',
    likes: 102,
    comments: 34,
    sharedAt: '3 hari lalu',
  },
];

export default function CommunityPage() {
  const [batches] = useState<CommunityBatch[]>(mockCommunityBatches);
  const [likedBatches, setLikedBatches] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<string>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState('');

  useEffect(() => {
    let mounted = true;
    apiClient.get('/api/v1/leaderboard?page=1&page_size=10')
      .then((response) => {
        if (!mounted) return;
        const payload = response.data.data as LeaderboardResponse;
        setLeaderboard(payload.data || []);
      })
      .catch((error) => {
        if (!mounted) return;
        setLeaderboardError(getErrorMessage(error, 'Gagal memuat leaderboard'));
      })
      .finally(() => {
        if (mounted) setLeaderboardLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleLike = (batchId: number) => {
    setLikedBatches((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(batchId)) {
        newSet.delete(batchId);
      } else {
        newSet.add(batchId);
      }
      return newSet;
    });
  };

  const filteredBatches = batches.filter(batch => {
    if (filter === 'all') return true;
    if (filter === 'active') return batch.status === 'active';
    if (filter === 'harvested') return batch.status === 'harvested';
    return true;
  });

  const topContributor = leaderboard[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl p-6 md:p-8 text-white shadow-lg shadow-emerald-500/25">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FiUsers size={24} />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Komunitas EcoFlow</h1>
                  <p className="text-emerald-100 mt-1">Berbagi pengalaman dan inspirasi fermentasi</p>
                </div>
              </div>
              <p className="text-emerald-100 text-lg max-w-2xl leading-relaxed">
                Bergabunglah dengan komunitas pecinta eco-enzyme. Bagikan pengalaman, pelajari tips praktis, dan dapatkan inspirasi untuk fermentasimu.
              </p>
            </div>
            <button className="flex items-center gap-2 px-5 py-3 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-600/20">
              <FiShare2 />
              <span>Bagikan Batch</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Anggota Aktif</p>
                <p className="text-2xl font-bold text-slate-800 mt-2">1,247</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <FiUsers className="text-emerald-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Batch Dibagikan</p>
                <p className="text-2xl font-bold text-slate-800 mt-2">342</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <FiShare2 className="text-amber-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Tingkat Keberhasilan</p>
                <p className="text-2xl font-bold text-slate-800 mt-2">89%</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center">
                <FiTrendingUp className="text-teal-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Top Kontributor</p>
                <p className="text-2xl font-bold text-slate-800 mt-2">
                  {topContributor ? topContributor.name : (leaderboardLoading ? '...' : '—')}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <FiAward className="text-amber-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Timeline Komunitas</h2>
            <p className="text-slate-600 mt-1">Update terbaru dari anggota komunitas</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === 'all' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === 'active' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => setFilter('harvested')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === 'harvested' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              Panen
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Leaderboard Komunitas</h2>
              <p className="text-sm text-slate-600 mt-1">Peringkat berdasarkan kontribusi batch dan aktivitas komunitas</p>
            </div>
            <div className="text-sm text-slate-500">
              {leaderboardLoading ? 'Memuat...' : leaderboardError ? leaderboardError : `${leaderboard.length} pengguna`}
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {leaderboard.map((item) => (
              <div key={item.user_id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                    #{item.rank}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.region || 'Wilayah tidak ditentukan'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">{item.total_points} poin</p>
                  <p className="text-xs text-slate-500">Peringkat {item.rank}</p>
                </div>
              </div>
            ))}
            {!leaderboardLoading && leaderboard.length === 0 && !leaderboardError && (
              <div className="p-6 text-center text-slate-500">Belum ada data leaderboard.</div>
            )}
          </div>
        </div>

        {/* Community Feed */}
        <div className="space-y-6">
          {filteredBatches.map((batch) => (
            <div key={batch.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                      {batch.userName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{batch.userName}</h3>
                      <p className="text-sm text-slate-500">{batch.sharedAt}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    batch.status === 'harvested' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {batch.status === 'harvested' ? 'Panen Berhasil' : 'Dalam Proses'}
                  </div>
                </div>

                {/* Batch Info */}
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-emerald-700 mb-2">{batch.batchName}</h4>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span><strong>{batch.wasteWeight} kg</strong> bahan organik</span>
                    <span>•</span>
                    <span><strong>Hari {batch.daysElapsed}</strong> dari 90</span>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-4">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-600 text-lg">💡</span>
                    <p className="text-sm text-amber-800 leading-relaxed">{batch.tips}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleLike(batch.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      likedBatches.has(batch.id)
                        ? 'bg-red-50 text-red-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <FiHeart className={likedBatches.has(batch.id) ? 'fill-red-500 text-red-500' : ''} />
                    <span>{batch.likes + (likedBatches.has(batch.id) ? 1 : 0)}</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                    <FiMessageCircle />
                    <span>{batch.comments} Komentar</span>
                  </button>
                  <button className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors">
                    <FiShare2 />
                    <span>Bagikan</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBatches.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FiFilter size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Tidak ada batch ditemukan</h3>
            <p className="text-slate-600">Coba ubah filter untuk melihat lebih banyak konten</p>
          </div>
        )}

        {/* Community Info */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Bergabung dengan Komunitas</h3>
              <p className="text-slate-600 mb-4 max-w-2xl">
                Komunitas EcoFlow adalah tempat untuk saling berbagi, belajar, dan menginspirasi. 
                Dapatkan tips praktis, tanyakan masalah fermentasi, dan lihat bagaimana orang lain 
                memanfaatkan eco-enzyme untuk kehidupan sehari-hari.
              </p>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                <span>Bergabung Sekarang</span>
                <FiChevronRight />
              </button>
            </div>
            <div className="hidden md:flex items-center gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                +{mockCommunityBatches.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}