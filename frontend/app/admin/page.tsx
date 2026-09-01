'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Heading,
  Stack,
  Box,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Text,
  Spinner,
  Center,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useAuth } from '@/lib/auth-context';
import apiClient from '@/lib/api';

interface CommunityStats {
  total_users: number;
  total_batches: number;
  total_waste_processed_kg: number;
  success_rate_percentage: number;
  normal_logs: number;
  caution_logs: number;
  failed_logs: number;
  total_logs: number;
  users_with_logs: number;
  engagement: {
    log_adoption_percentage: number;
    recommendation_adoption_percentage: number;
    roadmap_adoption_percentage: number;
    average_logs_per_user: number;
  };
}

interface ModelMetrics {
  precision: number;
  recall: number;
  f1_score: number;
  total_predictions: number;
  uptime_percentage: number;
  average_inference_time_ms: number;
}

interface CommunityTrend {
  date: string;
  logs: number;
  normal: number;
  success_rate_percentage: number;
}

interface Community {
  id: number;
  name: string;
  region: string | null;
}

interface ProductTemplate {
  id: number;
  name: string;
  description: string;
  processing_instructions: string;
  ingredients: string[];
  equipment: string[];
  time_estimate_hours: number;
  safety_warnings: string;
  base_compatibility_score: number;
  tutorial_url?: string | null;
  regional_average_price?: number | null;
}

export default function AdminPage() {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [trends, setTrends] = useState<CommunityTrend[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateInstructions, setTemplateInstructions] = useState('');
  const [templateSafety, setTemplateSafety] = useState('');
  const [templateTutorialUrl, setTemplateTutorialUrl] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<ProductTemplate>>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [pricingJson, setPricingJson] = useState('');
  const [importingPricing, setImportingPricing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const loadAdminData = async () => {
      try {
        setLoading(true);
        const [statsRes, metricsRes, trendsRes, templatesRes, communitiesRes] = await Promise.all([
          apiClient.get('/api/v1/admin/community-stats'),
          apiClient.get('/api/v1/admin/model-metrics'),
          apiClient.get('/api/v1/admin/community-trends?days=30'),
          apiClient.get('/api/v1/admin/product-templates'),
          apiClient.get('/api/v1/admin/communities'),
        ]);
        setStats(statsRes.data.data);
        setMetrics(metricsRes.data.data);
        setTrends(trendsRes.data.data.trends || []);
        setTemplates(templatesRes.data.data.templates || []);
        setCommunities(communitiesRes.data.data.communities || []);
      } catch (error: unknown) {
        const err = error as { response?: { data?: { detail?: string } } };
        toast({
          title: 'Error',
          description: err.response?.data?.detail || 'Failed to load admin data',
          status: 'error',
          isClosable: true,
        });
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [user, authLoading, router, toast]);

  const handleCreateTemplate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!templateName.trim() || !templateDescription.trim() || !templateInstructions.trim() || !templateSafety.trim()) return;
    try {
      setSavingTemplate(true);
      const response = await apiClient.post('/api/v1/admin/product-templates', {
        name: templateName.trim(),
        description: templateDescription.trim(),
        processing_instructions: templateInstructions.trim(),
        ingredients: [],
        equipment: [],
        time_estimate_hours: 1,
        safety_warnings: templateSafety.trim(),
        base_compatibility_score: 0.5,
        tutorial_url: templateTutorialUrl.trim() || undefined,
      });
      const created = templates.find((template) => template.id === response.data.data.id);
      if (!created) {
        setTemplates((current) => [...current, {
          id: response.data.data.id,
          name: templateName.trim(),
          description: templateDescription.trim(),
          processing_instructions: templateInstructions.trim(),
          ingredients: [],
          equipment: [],
          time_estimate_hours: 1,
          safety_warnings: templateSafety.trim(),
          base_compatibility_score: 0.5,
          tutorial_url: templateTutorialUrl.trim() || null,
          regional_average_price: null,
        }]);
      }
      setTemplateName('');
      setTemplateDescription('');
      setTemplateInstructions('');
      setTemplateSafety('');
      setTemplateTutorialUrl('');
      toast({ title: 'Berhasil', description: 'Template produk dibuat', status: 'success', isClosable: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({ title: 'Gagal', description: err.response?.data?.detail || 'Template tidak dapat dibuat', status: 'error', isClosable: true });
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    try {
      await apiClient.delete(`/api/v1/admin/product-templates/${templateId}`);
      setTemplates((current) => current.filter((template) => template.id !== templateId));
      toast({ title: 'Berhasil', description: 'Template produk dihapus', status: 'success', isClosable: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({ title: 'Gagal', description: err.response?.data?.detail || 'Template tidak dapat dihapus', status: 'error', isClosable: true });
    }
  };

  const startEditTemplate = (template: ProductTemplate) => {
    setEditingTemplateId(template.id);
    setEditForm({
      name: template.name,
      description: template.description,
      processing_instructions: template.processing_instructions,
      safety_warnings: template.safety_warnings,
      tutorial_url: template.tutorial_url ?? '',
      regional_average_price: template.regional_average_price ?? undefined,
    });
  };

  const cancelEdit = () => {
    setEditingTemplateId(null);
    setEditForm({});
  };

  const handleSaveEdit = async (templateId: number) => {
    try {
      setSavingEdit(true);
      const payload: Partial<ProductTemplate> = { ...editForm };
      if (payload.tutorial_url === '') delete payload.tutorial_url;
      await apiClient.patch(`/api/v1/admin/product-templates/${templateId}`, payload);
      setTemplates((current) =>
        current.map((t) => (t.id === templateId ? { ...t, ...payload } : t))
      );
      setEditingTemplateId(null);
      setEditForm({});
      toast({ title: 'Berhasil', description: 'Template diperbarui', status: 'success', isClosable: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({ title: 'Gagal', description: err.response?.data?.detail || 'Gagal memperbarui template', status: 'error', isClosable: true });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleImportPricing = async () => {
    try {
      const parsed = JSON.parse(pricingJson);
      if (!Array.isArray(parsed)) {
        toast({ title: 'Format salah', description: 'JSON harus berupa array: [{"name":"...","regional_average_price":0}]', status: 'error', isClosable: true });
        return;
      }
      setImportingPricing(true);
      const response = await apiClient.post('/api/v1/admin/product-templates/import-pricing', { items: parsed });
      const { updated, not_found } = response.data.data;
      toast({
        title: 'Import selesai',
        description: `${updated.length} diperbarui${not_found.length > 0 ? `, ${not_found.length} tidak ditemukan: ${not_found.join(', ')}` : ''}`,
        status: updated.length > 0 ? 'success' : 'warning',
        isClosable: true,
        duration: 8000,
      });
      if (updated.length > 0) {
        const res = await apiClient.get('/api/v1/admin/product-templates');
        setTemplates(res.data.data.templates || []);
      }
      setPricingJson('');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } }; message?: string };
      if (err.message?.includes('JSON')) {
        toast({ title: 'JSON tidak valid', description: 'Periksa format JSON Anda', status: 'error', isClosable: true });
      } else {
        toast({ title: 'Gagal', description: err.response?.data?.detail || 'Gagal import pricing', status: 'error', isClosable: true });
      }
    } finally {
      setImportingPricing(false);
    }
  };

  const loadCommunityScope = async () => {
    const params = new URLSearchParams();
    if (selectedCommunity) params.set('community_id', selectedCommunity);
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const statsResponse = await apiClient.get(`/api/v1/admin/community-stats?${params.toString()}`);
    const trendParams = new URLSearchParams();
    if (selectedCommunity) trendParams.set('community_id', selectedCommunity);
    trendParams.set('days', '30');
    const trendsResponse = await apiClient.get(`/api/v1/admin/community-trends?${trendParams.toString()}`);
    setStats(statsResponse.data.data);
    setTrends(trendsResponse.data.data.trends || []);
  };

  const handleDownloadCompliance = async () => {
    const params = new URLSearchParams();
    if (selectedCommunity) params.set('community_id', selectedCommunity);
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const response = await apiClient.get(`/api/v1/admin/community-compliance-report?${params.toString()}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'community-compliance-report.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (authLoading || loading) {
    return (
      <Center minH="100vh">
        <Spinner color="#34A853" size="xl" />
      </Center>
    );
  }

  return (
    <Container maxW="7xl" py={8}>
      <Stack spacing={8}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="lg" color="#34A853">
            Dasbor Admin
          </Heading>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Kembali ke Dasbor
          </Button>
        </Box>

        <Box borderWidth="1px" borderRadius="lg" p={4} bg="white">
          <Stack direction={{ base: 'column', md: 'row' }} spacing={3} align={{ base: 'stretch', md: 'end' }}>
            <FormControl>
              <FormLabel htmlFor="community-filter">Komunitas</FormLabel>
              <select id="community-filter" value={selectedCommunity} onChange={(event) => setSelectedCommunity(event.target.value)} style={{ width: '100%', height: '40px', border: '1px solid #CBD5E0', borderRadius: '6px', padding: '0 12px' }}>
                <option value="">Semua komunitas</option>
                {communities.map((community) => <option key={community.id} value={community.id}>{community.name}{community.region ? ` - ${community.region}` : ''}</option>)}
              </select>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="admin-start-date">Tanggal mulai</FormLabel>
              <Input id="admin-start-date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="admin-end-date">Tanggal akhir</FormLabel>
              <Input id="admin-end-date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </FormControl>
            <Button type="button" colorScheme="green" onClick={loadCommunityScope}>Terapkan Filter</Button>
            <Button type="button" variant="outline" onClick={handleDownloadCompliance}>Unduh CSV</Button>
          </Stack>
        </Box>

        {stats && (
          <Box>
            <Heading size="md" mb={4}>
              Statistik Komunitas
            </Heading>
            <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
              <GridItem>
                <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
                  <Stat>
                    <StatLabel>Total Pengguna</StatLabel>
                    <StatNumber color="#34A853">{stats.total_users}</StatNumber>
                    <StatHelpText>Anggota komunitas aktif</StatHelpText>
                  </Stat>
                </Box>
              </GridItem>

              <GridItem>
                <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
                  <Stat>
                    <StatLabel>Total Batch</StatLabel>
                    <StatNumber color="#34A853">{stats.total_batches}</StatNumber>
                    <StatHelpText>Batch fermentasi dibuat</StatHelpText>
                  </Stat>
                </Box>
              </GridItem>

              <GridItem>
                <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
                  <Stat>
                    <StatLabel>Limbah Diproses</StatLabel>
                    <StatNumber color="#34A853">{stats.total_waste_processed_kg.toFixed(2)}</StatNumber>
                    <StatHelpText>kg limbah organik</StatHelpText>
                  </Stat>
                </Box>
              </GridItem>

              <GridItem>
                <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
                  <Stat>
                    <StatLabel>Tingkat Keberhasilan</StatLabel>
                    <StatNumber color={stats.success_rate_percentage >= 80 ? '#34A853' : '#ED8936'}>
                      {stats.success_rate_percentage.toFixed(1)}%
                    </StatNumber>
                    <StatHelpText>Keberhasilan fermentasi</StatHelpText>
                  </Stat>
                </Box>
              </GridItem>

              <GridItem>
                <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
                  <Stat>
                    <StatLabel>Catatan Normal</StatLabel>
                    <StatNumber color="green.600">{stats.normal_logs}</StatNumber>
                    <StatHelpText>Fermentasi sehat</StatHelpText>
                  </Stat>
                </Box>
              </GridItem>

              <GridItem>
                <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
                  <Stat>
                    <StatLabel>Catatan Gagal</StatLabel>
                    <StatNumber color="red.600">{stats.failed_logs}</StatNumber>
                    <StatHelpText>Masalah terdeteksi</StatHelpText>
                  </Stat>
                </Box>
              </GridItem>
            </Grid>
          </Box>
        )}

        {stats && (
          <Box>
            <Heading size="md" mb={4}>
              Engagement Komunitas
            </Heading>
            <Grid templateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap={4}>
              <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
                <Stat>
                  <StatLabel>Adopsi Catatan</StatLabel>
                  <StatNumber color="#34A853">{stats.engagement.log_adoption_percentage.toFixed(1)}%</StatNumber>
                  <StatHelpText>{stats.users_with_logs} pengguna aktif mencatat</StatHelpText>
                </Stat>
              </Box>
              <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
                <Stat>
                  <StatLabel>Adopsi Rekomendasi</StatLabel>
                  <StatNumber color="#34A853">{stats.engagement.recommendation_adoption_percentage.toFixed(1)}%</StatNumber>
                  <StatHelpText>Pengguna memakai rekomendasi</StatHelpText>
                </Stat>
              </Box>
              <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
                <Stat>
                  <StatLabel>Adopsi Roadmap</StatLabel>
                  <StatNumber color="#34A853">{stats.engagement.roadmap_adoption_percentage.toFixed(1)}%</StatNumber>
                  <StatHelpText>Pengguna memulai roadmap</StatHelpText>
                </Stat>
              </Box>
              <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
                <Stat>
                  <StatLabel>Rata-rata Catatan</StatLabel>
                  <StatNumber color="#34A853">{stats.engagement.average_logs_per_user.toFixed(1)}</StatNumber>
                  <StatHelpText>Catatan per pengguna aktif</StatHelpText>
                </Stat>
              </Box>
            </Grid>
          </Box>
        )}

        {trends.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>
              Tren Aktivitas 30 Hari
            </Heading>
            <Box borderWidth="1px" borderRadius="lg" p={6} bg="white" overflowX="auto">
              <Box minW="640px">
                <Box display="flex" alignItems="end" gap={1} h="180px" aria-label="Grafik tren catatan fermentasi">
                  {trends.map((trend) => {
                    const maxLogs = Math.max(...trends.map((item) => item.logs), 1);
                    const height = Math.max((trend.logs / maxLogs) * 100, trend.logs > 0 ? 4 : 1);
                    return (
                      <Box key={trend.date} flex="1" minW="3px" title={`${trend.date}: ${trend.logs} catatan`}>
                        <Box h={`${height}%`} bg="green.400" borderRadius="sm" minH="2px" />
                      </Box>
                    );
                  })}
                </Box>
                <Box display="flex" justifyContent="space-between" mt={2} fontSize="xs" color="gray.500">
                  <Text>{trends[0].date}</Text>
                  <Text>{trends[trends.length - 1].date}</Text>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        <Box>
          <Heading size="md" mb={4}>
            Manajemen Template Produk
          </Heading>
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
            <Box as="form" onSubmit={handleCreateTemplate} borderWidth="1px" borderRadius="lg" p={6} bg="white">
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel htmlFor="template-name">Nama Template</FormLabel>
                  <Input id="template-name" value={templateName} onChange={(event) => setTemplateName(event.target.value)} maxLength={120} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel htmlFor="template-description">Deskripsi</FormLabel>
                  <Textarea id="template-description" value={templateDescription} onChange={(event) => setTemplateDescription(event.target.value)} maxLength={2000} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel htmlFor="template-instructions">Instruksi Pemrosesan</FormLabel>
                  <Textarea id="template-instructions" value={templateInstructions} onChange={(event) => setTemplateInstructions(event.target.value)} maxLength={5000} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel htmlFor="template-safety">Peringatan Keamanan</FormLabel>
                  <Textarea id="template-safety" value={templateSafety} onChange={(event) => setTemplateSafety(event.target.value)} maxLength={2000} />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="template-tutorial-url">URL Tutorial (opsional)</FormLabel>
                  <Input id="template-tutorial-url" type="url" placeholder="https://..." value={templateTutorialUrl} onChange={(event) => setTemplateTutorialUrl(event.target.value)} maxLength={500} />
                </FormControl>
                <Button type="submit" colorScheme="green" isLoading={savingTemplate}>Tambah Template</Button>
              </Stack>
            </Box>
            <Stack spacing={3}>
              {templates.map((template) => (
                <Box key={template.id} borderWidth="1px" borderRadius="lg" p={4} bg="white">
                  {editingTemplateId === template.id ? (
                    <Stack spacing={3}>
                      <FormControl>
                        <FormLabel fontSize="sm">Nama</FormLabel>
                        <Input size="sm" value={editForm.name ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Deskripsi</FormLabel>
                        <Textarea size="sm" rows={2} value={editForm.description ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Instruksi Pemrosesan</FormLabel>
                        <Textarea size="sm" rows={3} value={editForm.processing_instructions ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, processing_instructions: e.target.value }))} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Peringatan Keamanan</FormLabel>
                        <Textarea size="sm" rows={2} value={editForm.safety_warnings ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, safety_warnings: e.target.value }))} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">URL Tutorial</FormLabel>
                        <Input size="sm" type="url" placeholder="https://..." value={editForm.tutorial_url ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, tutorial_url: e.target.value }))} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Harga Pasar Regional (Rp/L)</FormLabel>
                        <Input size="sm" type="number" min={0} step={0.01} placeholder="0" value={editForm.regional_average_price ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, regional_average_price: e.target.value ? parseFloat(e.target.value) : undefined }))} />
                      </FormControl>
                      <Box display="flex" gap={2}>
                        <Button type="button" size="sm" colorScheme="green" isLoading={savingEdit} onClick={() => handleSaveEdit(template.id)}>Simpan</Button>
                        <Button type="button" size="sm" variant="ghost" onClick={cancelEdit}>Batal</Button>
                      </Box>
                    </Stack>
                  ) : (
                    <Box display="flex" justifyContent="space-between" gap={4} alignItems="start">
                      <Box flex={1}>
                        <Heading size="sm">{template.name}</Heading>
                        <Text fontSize="sm" color="gray.600" mt={1}>{template.description}</Text>
                        {template.tutorial_url && (
                          <Text fontSize="xs" color="blue.500" mt={1} noOfLines={1}>🔗 {template.tutorial_url}</Text>
                        )}
                        {template.regional_average_price != null && (
                          <Text fontSize="xs" color="green.600" mt={1}>Harga pasar: Rp {template.regional_average_price.toLocaleString('id-ID')}/L</Text>
                        )}
                      </Box>
                      <Box display="flex" flexDir="column" gap={2} alignItems="flex-end">
                        <Button type="button" size="sm" colorScheme="blue" variant="outline" onClick={() => startEditTemplate(template)}>Edit</Button>
                        <Button type="button" size="sm" colorScheme="red" variant="outline" onClick={() => handleDeleteTemplate(template.id)}>Hapus</Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              ))}
              {!templates.length && <Text color="gray.500">Belum ada template produk.</Text>}
            </Stack>
          </Grid>
        </Box>

        <Box>
          <Heading size="md" mb={4}>Import Harga Pasar Regional</Heading>
          <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
            <Text fontSize="sm" color="gray.600" mb={3}>
              Tempel JSON array untuk memperbarui <strong>regional_average_price</strong> per template.
              Format: <code>[{'{'}&#34;name&#34;: &#34;Pembersih&#34;, &#34;regional_average_price&#34;: 25000{'}'}]</code>
            </Text>
            <Textarea
              value={pricingJson}
              onChange={(e) => setPricingJson(e.target.value)}
              placeholder={'[\n  {"name": "Nama Template", "regional_average_price": 25000}\n]'}
              rows={6}
              fontFamily="mono"
              fontSize="sm"
              mb={3}
            />
            <Button colorScheme="green" isLoading={importingPricing} onClick={handleImportPricing} isDisabled={!pricingJson.trim()}>
              Import Pricing
            </Button>
          </Box>
        </Box>

        {metrics && (
          <Box>
            <Heading size="md" mb={4}>
              Metrik Model AI
            </Heading>
            <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
              <GridItem>
                <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
                  <Stat>
                    <StatLabel>Presisi</StatLabel>
                    <StatNumber color="#34A853">{(metrics.precision * 100).toFixed(1)}%</StatNumber>
                    <StatHelpText>Akurasi model</StatHelpText>
                  </Stat>
                </Box>
              </GridItem>

              <GridItem>
                <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
                  <Stat>
                    <StatLabel>Recall</StatLabel>
                    <StatNumber color="#34A853">{(metrics.recall * 100).toFixed(1)}%</StatNumber>
                    <StatHelpText>Sensitivitas deteksi</StatHelpText>
                  </Stat>
                </Box>
              </GridItem>

              <GridItem>
                <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
                  <Stat>
                    <StatLabel>Skor F1</StatLabel>
                    <StatNumber color="#34A853">{(metrics.f1_score * 100).toFixed(1)}%</StatNumber>
                    <StatHelpText>Performa keseluruhan</StatHelpText>
                  </Stat>
                </Box>
              </GridItem>

              <GridItem>
                <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
                  <Stat>
                    <StatLabel>Total Prediksi</StatLabel>
                    <StatNumber color="#34A853">{metrics.total_predictions.toLocaleString()}</StatNumber>
                    <StatHelpText>Inferensi AI dilakukan</StatHelpText>
                  </Stat>
                </Box>
              </GridItem>

              <GridItem>
                <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
                  <Stat>
                    <StatLabel>Waktu Aktif</StatLabel>
                    <StatNumber color="#34A853">{metrics.uptime_percentage.toFixed(1)}%</StatNumber>
                    <StatHelpText>Ketersediaan sistem</StatHelpText>
                  </Stat>
                </Box>
              </GridItem>

              <GridItem>
                <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
                  <Stat>
                    <StatLabel>Rata-rata Inferensi</StatLabel>
                    <StatNumber color="#34A853">{metrics.average_inference_time_ms}</StatNumber>
                    <StatHelpText>milidetik</StatHelpText>
                  </Stat>
                </Box>
              </GridItem>
            </Grid>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
