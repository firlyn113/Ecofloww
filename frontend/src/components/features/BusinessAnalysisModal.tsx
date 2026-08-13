'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useToast,
  Select,
  VStack,
  HStack,
  Box,
  Text,
  Divider,
} from '@chakra-ui/react';
import { useState } from 'react';
import apiClient from '@/lib/api';

interface BusinessAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: number;
  onSuccess: () => void;
}

export default function BusinessAnalysisModal({
  isOpen,
  onClose,
  batchId,
  onSuccess,
}: BusinessAnalysisModalProps) {
  const [productName, setProductName] = useState('');
  const [productionVolume, setProductionVolume] = useState('');
  const [targetMarket, setTargetMarket] = useState('local');
  const [packagingType, setPackagingType] = useState('bottle');
  const [distributionChannel, setDistributionChannel] = useState('direct');
  const [rawMaterialCost, setRawMaterialCost] = useState('');
  const [packagingCost, setPackagingCost] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [overheadCost, setOverheadCost] = useState('');
  const [monthlyFixedCosts, setMonthlyFixedCosts] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Record<string, unknown> | null>(null);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !productName ||
      !productionVolume ||
      !rawMaterialCost ||
      !packagingCost ||
      !laborCost ||
      !overheadCost ||
      !monthlyFixedCosts
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        status: 'error',
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post(
        `/api/v1/batches/${batchId}/business-analysis`,
        {
          product_name: productName,
          production_volume_liters: parseFloat(productionVolume),
          target_market: targetMarket,
          packaging_type: packagingType,
          distribution_channel: distributionChannel,
          raw_material_cost: parseFloat(rawMaterialCost),
          packaging_cost: parseFloat(packagingCost),
          labor_cost: parseFloat(laborCost),
          overhead_cost: parseFloat(overheadCost),
          monthly_fixed_costs: parseFloat(monthlyFixedCosts),
        }
      );

      setAnalysis(response.data.data);
      toast({
        title: 'Success',
        description: 'Business analysis completed',
        status: 'success',
        isClosable: true,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.detail || 'Failed to run analysis',
        status: 'error',
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await apiClient.get(`/api/v1/batches/${batchId}/business-analysis/report`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `business-analysis-batch-${batchId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.detail || 'Failed to download report',
        status: 'error',
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    setProductName('');
    setProductionVolume('');
    setTargetMarket('local');
    setPackagingType('bottle');
    setDistributionChannel('direct');
    setRawMaterialCost('');
    setPackagingCost('');
    setLaborCost('');
    setOverheadCost('');
    setMonthlyFixedCosts('');
    setAnalysis(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent maxH="90vh" overflowY="auto" bg="gray.800" borderColor="gray.700" w={{ base: 'calc(100% - 2rem)', md: '100%' }}>
        <ModalHeader id="business-analysis-title" color="gray.100">Analisis Bisnis</ModalHeader>
        <ModalCloseButton aria-label="Tutup dialog analisis bisnis" color="gray.300" />
        <form onSubmit={handleSubmit} aria-label="Form analisis bisnis">
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel htmlFor="business-product-name" color="gray.300">Nama Produk</FormLabel>
                <Input
                  id="business-product-name"
                  name="productName"
                  placeholder="Misal, Pembersih Eco-Enzyme"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  bg="gray.700"
                  borderColor="gray.600"
                  color="gray.100"
                  _placeholder={{ color:'gray.500' }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel htmlFor="production-volume" color="gray.300">Volume Produksi (Liter)</FormLabel>
                <Input
                  id="production-volume"
                  name="productionVolume"
                  type="number"
                  min={0.1}
                  placeholder="Misal, 100"
                  value={productionVolume}
                  onChange={(e) => setProductionVolume(e.target.value)}
                  step="0.1"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="gray.100"
                  _placeholder={{ color:'gray.500' }}
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel htmlFor="target-market" color="gray.300">Target Pasar</FormLabel>
                  <Select
                    id="target-market"
                    name="targetMarket"
                    value={targetMarket} 
                    onChange={(e) => setTargetMarket(e.target.value)}
                    bg="gray.700"
                    borderColor="gray.600"
                    color="gray.100"
                  >
                    <option value="local" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Lokal</option>
                    <option value="regional" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Regional</option>
                    <option value="national" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Nasional</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="packaging-type" color="gray.300">Jenis Kemasan</FormLabel>
                  <Select
                    id="packaging-type"
                    name="packagingType"
                    value={packagingType} 
                    onChange={(e) => setPackagingType(e.target.value)}
                    bg="gray.700"
                    borderColor="gray.600"
                    color="gray.100"
                  >
                    <option value="bottle" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Botol</option>
                    <option value="container" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Jerigen</option>
                    <option value="bulk" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Curah</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel htmlFor="distribution-channel" color="gray.300">Jalur Distribusi</FormLabel>
                <Select
                  id="distribution-channel"
                  name="distributionChannel"
                  value={distributionChannel} 
                  onChange={(e) => setDistributionChannel(e.target.value)}
                  bg="gray.700"
                  borderColor="gray.600"
                  color="gray.100"
                >
                  <option value="direct" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Penjualan Langsung</option>
                  <option value="retail" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Retail</option>
                  <option value="online" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Online</option>
                  <option value="wholesale" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Grosir</option>
                </Select>
              </FormControl>

              <Divider borderColor="gray.600" />

              <VStack align="start" spacing={3}>
                <Text fontWeight="bold" color="gray.100">Struktur Biaya</Text>
                <HStack w="100%" spacing={2}>
                  <FormControl isRequired>
                    <FormLabel htmlFor="raw-material-cost" fontSize="sm" color="gray.300">Bahan Baku (Rp)</FormLabel>
                    <Input
                      id="raw-material-cost"
                      name="rawMaterialCost"
                      type="number"
                      placeholder="0"
                      value={rawMaterialCost}
                      onChange={(e) => setRawMaterialCost(e.target.value)}
                      step="0.01"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="gray.100"
                      _placeholder={{ color:'gray.500' }}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel htmlFor="packaging-cost" fontSize="sm" color="gray.300">Kemasan (Rp)</FormLabel>
                    <Input
                      id="packaging-cost"
                      name="packagingCost"
                      type="number"
                      placeholder="0"
                      value={packagingCost}
                      onChange={(e) => setPackagingCost(e.target.value)}
                      step="0.01"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="gray.100"
                      _placeholder={{ color:'gray.500' }}
                    />
                  </FormControl>
                </HStack>

                <HStack w="100%" spacing={2}>
                  <FormControl isRequired>
                    <FormLabel htmlFor="labor-cost" fontSize="sm" color="gray.300">Tenaga Kerja (Rp)</FormLabel>
                    <Input
                      id="labor-cost"
                      name="laborCost"
                      type="number"
                      placeholder="0"
                      value={laborCost}
                      onChange={(e) => setLaborCost(e.target.value)}
                      step="0.01"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="gray.100"
                      _placeholder={{ color:'gray.500' }}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel htmlFor="overhead-cost" fontSize="sm" color="gray.300">Biaya Operasional (Rp)</FormLabel>
                    <Input
                      id="overhead-cost"
                      name="overheadCost"
                      type="number"
                      placeholder="0"
                      value={overheadCost}
                      onChange={(e) => setOverheadCost(e.target.value)}
                      step="0.01"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="gray.100"
                      _placeholder={{ color:'gray.500' }}
                    />
                  </FormControl>
                </HStack>

                <FormControl isRequired w="50%">
                  <FormLabel htmlFor="monthly-fixed-costs" fontSize="sm" color="gray.300">Biaya Tetap Bulanan (Rp)</FormLabel>
                  <Input
                    id="monthly-fixed-costs"
                    name="monthlyFixedCosts"
                    type="number"
                    placeholder="0"
                    value={monthlyFixedCosts}
                    onChange={(e) => setMonthlyFixedCosts(e.target.value)}
                    step="0.01"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="gray.100"
                    _placeholder={{ color:'gray.500' }}
                  />
                </FormControl>
              </VStack>

              {analysis && (
                <Box borderTop="1px" borderColor="gray.600" pt={4} bg="gray.700" p={4} rounded="lg">
                  <Text fontWeight="bold" mb={3} color="gray.100">
                    Hasil Analisis:
                  </Text>
                  <VStack spacing={2} align="start" fontSize="sm">
                    <HStack justifyContent="space-between" w="100%">
                      <Text color="gray.400">Biaya per Liter (Rp):</Text>
                      <Text fontWeight="medium" color="gray.100">Rp {typeof analysis.cogs_per_liter === 'number' ? analysis.cogs_per_liter.toLocaleString('id-ID') : 'N/A'}</Text>
                    </HStack>
                    <HStack justifyContent="space-between" w="100%">
                      <Text color="gray.400">Harga Jual Saran (Rp):</Text>
                      <Text fontWeight="medium" color="gray.100">Rp {typeof analysis.suggested_retail_price === 'number' ? analysis.suggested_retail_price.toLocaleString('id-ID') : 'N/A'}</Text>
                    </HStack>
                    <HStack justifyContent="space-between" w="100%">
                      <Text color="gray.400">Margin Kotor:</Text>
                      <Text fontWeight="medium" color="green.400">
                        {typeof analysis.gross_margin_percentage === 'number' ? analysis.gross_margin_percentage.toFixed(1) : 'N/A'}%
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between" w="100%">
                      <Text color="gray.400">BEP (Liter):</Text>
                      <Text fontWeight="medium" color="gray.100">{Math.ceil(typeof analysis.break_even_units_liters === 'number' ? analysis.break_even_units_liters : 0)}</Text>
                    </HStack>
                    <HStack justifyContent="space-between" w="100%">
                      <Text color="gray.400">Profit Tahunan (Rp):</Text>
                      <Text fontWeight="medium" color="blue.400">
                        Rp {typeof analysis.yearly_net_profit === 'number' ? analysis.yearly_net_profit.toLocaleString('id-ID') : 'N/A'}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between" w="100%">
                      <Text color="gray.400">Kelayakan:</Text>
                      <Text fontWeight="bold" color={analysis.viability_rating === 'Viable' ? 'green.400' : analysis.viability_rating === 'Marginal' ? 'orange.400' : 'red.400'}>
                        {String(analysis.viability_rating || 'N/A')}
                      </Text>
                    </HStack>
                  </VStack>

                  <Divider my={3} borderColor="gray.600" />

                  <Text fontWeight="bold" mb={3} color="gray.100">
                    Proyeksi 12 Bulan:
                  </Text>
                  <VStack spacing={2} align="start" fontSize="sm">
                    <HStack justifyContent="space-between" w="100%">
                      <Text color="gray.400">Pendapatan Bulanan (Rp):</Text>
                      <Text fontWeight="medium" color="gray.100">Rp {typeof analysis.monthly_revenue === 'number' ? analysis.monthly_revenue.toLocaleString('id-ID') : 'N/A'}</Text>
                    </HStack>
                    <HStack justifyContent="space-between" w="100%">
                      <Text color="gray.400">Profit Bersih Bulanan (Rp):</Text>
                      <Text fontWeight="medium" color="blue.400">Rp {typeof analysis.monthly_net_profit === 'number' ? analysis.monthly_net_profit.toLocaleString('id-ID') : 'N/A'}</Text>
                    </HStack>
                    <HStack justifyContent="space-between" w="100%">
                      <Text color="gray.400">Profit Bersih Tahunan (Rp):</Text>
                      <Text fontWeight="medium" color="blue.400">Rp {typeof analysis.yearly_net_profit === 'number' ? analysis.yearly_net_profit.toLocaleString('id-ID') : 'N/A'}</Text>
                    </HStack>
                    <HStack justifyContent="space-between" w="100%">
                      <Text color="gray.400">Titik Impas (Bulan):</Text>
                      <Text fontWeight="medium" color="gray.100">{analysis.breakeven_months != null ? String(analysis.breakeven_months) : 'N/A'}</Text>
                    </HStack>
                  </VStack>

                  {typeof analysis.sensitivity_analysis === 'object' && analysis.sensitivity_analysis && (
                    <>
                      <Divider my={3} borderColor="gray.600" />
                      <Text fontWeight="bold" mb={3} color="gray.100">
                        Analisis Sensitivitas (±{String((analysis.sensitivity_analysis as Record<string, unknown>).variance_percentage ?? 10)}%):
                      </Text>
                      <VStack spacing={2} align="start" fontSize="sm">
                        <HStack justifyContent="space-between" w="100%">
                          <Text color="gray.400">Skenario Pesimis (Rp):</Text>
                          <Text fontWeight="medium" color="red.400">Rp {typeof (analysis.sensitivity_analysis as Record<string, unknown>).pessimistic === 'number' ? ((analysis.sensitivity_analysis as Record<string, number>).pessimistic).toLocaleString('id-ID') : 'N/A'}</Text>
                        </HStack>
                        <HStack justifyContent="space-between" w="100%">
                          <Text color="gray.400">Skenario Optimis (Rp):</Text>
                          <Text fontWeight="medium" color="green.400">Rp {typeof (analysis.sensitivity_analysis as Record<string, unknown>).optimistic === 'number' ? ((analysis.sensitivity_analysis as Record<string, number>).optimistic).toLocaleString('id-ID') : 'N/A'}</Text>
                        </HStack>
                      </VStack>
                    </>
                  )}
                </Box>
              )}
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="ghost" mr={3} onClick={handleClose} color="gray.300">
              {analysis ? 'Tutup' : 'Batal'}
            </Button>
            {!analysis && (
              <Button
                type="submit"
                bg="#34A853"
                color="white"
                isLoading={loading}
                _hover={{ bg: '#2a8a42' }}
              >
                Jalankan Analisis
              </Button>
            )}
            {analysis && (
              <>
                <Button variant="outline" mr={3} onClick={handleDownloadReport} color="gray.300" borderColor="gray.600">
                  Download PDF
                </Button>
                <Button
                  bg="#34A853"
                  color="white"
                  onClick={() => {
                    onSuccess();
                    handleClose();
                  }}
                  _hover={{ bg: '#2a8a42' }}
                >
                  Selesai
                </Button>
              </>
            )}
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
