'use client';

import { useState } from 'react';
import { FiTrendingUp, FiBarChart2, FiTarget, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

interface Batch {
  id: number;
  name: string;
  status: string;
  waste_weight_kg: number;
  water_liters: number;
  sugar_kg: number;
  start_date: string;
  selected_product_id?: number | null;
}

interface ComparisonMetric {
  label: string;
  batch1: number;
  batch2: number;
  unit?: string;
  better?: 'batch1' | 'batch2' | 'equal';
}

export default function BatchComparisonPage() {
  const [batch1Id, setBatch1Id] = useState<number | null>(null);
  const [batch2Id, setBatch2Id] = useState<number | null>(null);
  
  // Mock data - in real app, this would come from context/API
  const batches: Batch[] = [
    {
      id: 1,
      name: 'Batch Sampah Dapur',
      status: 'harvested',
      waste_weight_kg: 12.5,
      water_liters: 37.5,
      sugar_kg: 4.2,
      start_date: '2026-06-01',
    },
    {
      id: 2,
      name: 'Batch Organik Kebun',
      status: 'in_progress',
      waste_weight_kg: 25.0,
      water_liters: 75.0,
      sugar_kg: 8.3,
      start_date: '2026-07-15',
    },
    {
      id: 3,
      name: 'Batch Komunitas',
      status: 'completed',
      waste_weight_kg: 50.0,
      water_liters: 150.0,
      sugar_kg: 16.7,
      start_date: '2026-05-10',
    },
  ];

  const batch1 = batches.find((b) => b.id === batch1Id);
  const batch2 = batches.find((b) => b.id === batch2Id);

  const comparisonMetrics: ComparisonMetric[] = [
    {
      label: 'Bahan Baku',
      batch1: batch1?.waste_weight_kg || 0,
      batch2: batch2?.waste_weight_kg || 0,
      unit: 'kg',
      better: (batch1?.waste_weight_kg || 0) > (batch2?.waste_weight_kg || 0) ? 'batch1' : 
              (batch1?.waste_weight_kg || 0) < (batch2?.waste_weight_kg || 0) ? 'batch2' : 'equal'
    },
    {
      label: 'Kebutuhan Air',
      batch1: batch1?.water_liters || 0,
      batch2: batch2?.water_liters || 0,
      unit: 'L',
      better: (batch1?.water_liters || 0) < (batch2?.water_liters || 0) ? 'batch1' : 
              (batch1?.water_liters || 0) > (batch2?.water_liters || 0) ? 'batch2' : 'equal'
    },
    {
      label: 'Kebutuhan Gula',
      batch1: batch1?.sugar_kg || 0,
      batch2: batch2?.sugar_kg || 0,
      unit: 'kg',
      better: (batch1?.sugar_kg || 0) < (batch2?.sugar_kg || 0) ? 'batch1' : 
              (batch1?.sugar_kg || 0) > (batch2?.sugar_kg || 0) ? 'batch2' : 'equal'
    },
  ];

  const performanceMetrics = [
    { label: 'Efisiensi', batch1: 85, batch2: 92, unit: '%' },
    { label: 'Kualitas', batch1: 78, batch2: 88, unit: '%' },
    { label: 'Kecepatan', batch1: 90, batch2: 75, unit: '%' },
    { label: 'Biaya', batch1: 70, batch2: 82, unit: '%' },
    { label: 'Keberlanjutan', batch1: 95, batch2: 90, unit: '%' },
  ];



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'harvested': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress': return 'Dalam Proses';
      case 'completed': return 'Selesai';
      case 'harvested': return 'DIPANEN';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl p-6 md:p-8 text-white shadow-lg shadow-emerald-500/25">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FiBarChart2 size={24} />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Perbandingan Batch</h1>
                  <p className="text-emerald-100 mt-1">Analisis komparatif untuk optimalisasi</p>
                </div>
              </div>
              <p className="text-emerald-100 text-lg max-w-2xl leading-relaxed">
                Bandingkan dua batch fermentasi untuk melihat perbedaan performa, efisiensi, dan karakteristik. 
                Dapatkan insight untuk meningkatkan hasil fermentasi berikutnya.
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FiTrendingUp size={24} />
            </div>
          </div>
        </div>

        {/* Batch Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Batch 1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Batch Pertama</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                Batch 1
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Pilih Batch</label>
                <select
                  value={batch1Id || ''}
                  onChange={(e) => setBatch1Id(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors"
                >
                  <option value="">Pilih Batch Pertama</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>

              {batch1 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-800">Nama</span>
                      <span className="text-slate-800">{batch1.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-800">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(batch1.status)}`}>
                        {getStatusLabel(batch1.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-800">Bahan Baku</span>
                      <span className="text-slate-800">{batch1.waste_weight_kg} kg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-800">Mulai</span>
                      <span className="text-slate-800">
                        {new Date(batch1.start_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Batch 2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Batch Kedua</h2>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
                Batch 2
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Pilih Batch</label>
                <select
                  value={batch2Id || ''}
                  onChange={(e) => setBatch2Id(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors"
                >
                  <option value="">Pilih Batch Kedua</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>

              {batch2 && (
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-800">Nama</span>
                      <span className="text-slate-800">{batch2.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-800">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(batch2.status)}`}>
                        {getStatusLabel(batch2.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-800">Bahan Baku</span>
                      <span className="text-slate-800">{batch2.waste_weight_kg} kg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-800">Mulai</span>
                      <span className="text-slate-800">
                        {new Date(batch2.start_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {batch1 && batch2 ? (
          <>
            {/* Comparison Metrics */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Perbandingan Metrik</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {comparisonMetrics.map((metric, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-slate-700">{metric.label}</span>
                      {metric.better && metric.better !== 'equal' && (
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          metric.better === 'batch1' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {metric.better === 'batch1' ? 'Batch 1' : 'Batch 2'} lebih baik
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{metric.batch1}</div>
                        <div className="text-xs text-slate-500 mt-1">Batch 1</div>
                      </div>
                      
                      <div className="text-slate-400 mx-4">vs</div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">{metric.batch2}</div>
                        <div className="text-xs text-slate-500 mt-1">Batch 2</div>
                      </div>
                    </div>
                    
                    {metric.unit && (
                      <div className="text-center text-sm text-slate-500 mt-2">Satuan: {metric.unit}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Comparison */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Perbandingan Performa</h2>
              
              <div className="space-y-4">
                {performanceMetrics.map((metric, index) => {
                  const diff = Math.abs(metric.batch1 - metric.batch2);
                  const better = metric.batch1 > metric.batch2 ? 'batch1' : metric.batch1 < metric.batch2 ? 'batch2' : 'equal';
                  
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-32">
                        <span className="font-medium text-slate-700">{metric.label}</span>
                      </div>
                      
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${metric.batch1}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-blue-600 w-10 text-right">
                          {metric.batch1}{metric.unit}
                        </span>
                      </div>
                      
                      <div className="text-slate-400 mx-2">vs</div>
                      
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-sm font-semibold text-emerald-600 w-10">
                          {metric.batch2}{metric.unit}
                        </span>
                        <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500 ml-auto"
                            style={{ width: `${metric.batch2}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {better !== 'equal' && (
                        <div className={`px-2 py-1 rounded text-xs font-semibold ${
                          better === 'batch1' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {diff}{metric.unit} {better === 'batch1' ? 'lebih tinggi' : 'lebih rendah'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <FiTarget className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-amber-900 mb-2">💡 Insight Analisis</h3>
                  <div className="space-y-3">
                    <p className="text-amber-800">
                      <strong className="text-blue-600">{batch1.name}</strong> menunjukkan efisiensi lebih tinggi pada fase awal fermentasi dengan suhu yang lebih stabil.
                    </p>
                    <p className="text-amber-800">
                      <strong className="text-emerald-600">{batch2.name}</strong> memiliki performa kualitas akhir yang lebih baik dengan pH lebih optimal.
                    </p>
                    <div className="mt-4 p-3 bg-white/50 rounded-lg border border-amber-200">
                      <p className="text-sm font-semibold text-amber-800 mb-1">Rekomendasi:</p>
                      <p className="text-sm text-amber-700">
                        Kombinasikan metode monitoring suhu dari Batch 1 dengan kontrol pH dari Batch 2 untuk hasil optimal pada batch berikutnya.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
              <FiBarChart2 size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Mulai Perbandingan</h3>
            <p className="text-slate-600 max-w-md mx-auto mb-6">
              Pilih dua batch untuk membandingkan metrik fermentasi dan mendapatkan insight berharga untuk optimalisasi.
            </p>
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <FiAlertCircle />
              <span className="text-sm">Pilih batch pertama dan kedua untuk melanjutkan</span>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
              <FiCheckCircle className="text-slate-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Tips Analisis Perbandingan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-700">
                    <strong>Fokus pada metrik kunci</strong> seperti efisiensi bahan baku dan kualitas akhir.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-700">
                    <strong>Perhatikan pola suhu</strong> untuk memahami stabilitas fermentasi.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-700">
                    <strong>Bandingkan batch dengan status serupa</strong> untuk analisis yang relevan.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-700">
                    <strong>Gunakan insight untuk optimasi</strong> batch berikutnya.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}