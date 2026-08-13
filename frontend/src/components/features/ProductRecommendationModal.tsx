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
  Badge,
} from '@chakra-ui/react';
import { useState } from 'react';
import apiClient from '@/lib/api';

interface ProductRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: number;
  onSuccess: () => void;
}

export default function ProductRecommendationModal({
  isOpen,
  onClose,
  batchId,
  onSuccess,
}: ProductRecommendationModalProps) {
  const [harvestVolume, setHarvestVolume] = useState('');
  const [finalColor, setFinalColor] = useState('dark_brown');
  const [aromaIntensity, setAromaIntensity] = useState('medium');
  const [userIntent, setUserIntent] = useState('household');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Array<Record<string, unknown>> | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectingProduct, setSelectingProduct] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!harvestVolume) {
      toast({
        title: 'Validation Error',
        description: 'Please enter harvest volume',
        status: 'error',
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post(
        `/api/v1/batches/${batchId}/recommendation`,
        {
          harvest_date: new Date().toISOString(),
          harvest_volume_liters: parseFloat(harvestVolume),
          final_color: finalColor,
          aroma_intensity: aromaIntensity,
          user_intent: userIntent,
        }
      );

      setRecommendations(response.data.data.recommendations);
      toast({
        title: 'Success',
        description: 'Product recommendations generated',
        status: 'success',
        isClosable: true,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.detail || 'Failed to get recommendations',
        status: 'error',
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = async (productTemplateId: number) => {
    try {
      setSelectingProduct(true);
      const response = await apiClient.post(`/api/v1/batches/${batchId}/select-product`, {
        product_template_id: productTemplateId,
      });
      setSelectedProductId(response.data.data.selected_product_id);
      toast({
        title: 'Produk dipilih',
        description: 'Produk ini akan digunakan untuk roadmap pemrosesan.',
        status: 'success',
        isClosable: true,
        duration: 3000,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.detail || 'Gagal memilih produk',
        status: 'error',
        isClosable: true,
      });
    } finally {
      setSelectingProduct(false);
    }
  };

  const handleClose = () => {
    setHarvestVolume('');
    setFinalColor('dark_brown');
    setAromaIntensity('medium');
    setUserIntent('household');
    setRecommendations(null);
    setSelectedProductId(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent bg="gray.800" borderColor="gray.700" w={{ base: 'calc(100% - 2rem)', md: '100%' }}>
        <ModalHeader id="product-recommendations-title" color="gray.100">Rekomendasi Produk</ModalHeader>
        <ModalCloseButton aria-label="Tutup dialog rekomendasi produk" color="gray.300" />
        <form onSubmit={handleSubmit} aria-label="Form rekomendasi produk">
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel htmlFor="harvest-volume" color="gray.300">Volume Panen (Liter)</FormLabel>
                <Input
                  id="harvest-volume"
                  name="harvestVolume"
                  type="number"
                  min={0.1}
                  step="0.1"
                  placeholder="Misal, 5.5"
                  value={harvestVolume}
                  onChange={(e) => setHarvestVolume(e.target.value)}
                  bg="gray.700"
                  borderColor="gray.600"
                  color="gray.100"
                  _placeholder={{ color: 'gray.500' }}
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="final-color" color="gray.300">Warna Akhir</FormLabel>
                <Select id="final-color" name="finalColor" value={finalColor} onChange={(e) => setFinalColor(e.target.value)} bg="gray.700" borderColor="gray.600" color="gray.100">
                  <option value="light_brown" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Cokelat Muda</option>
                  <option value="dark_brown" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Cokelat Gelap</option>
                  <option value="amber" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Amber</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="aroma-intensity" color="gray.300">Intensitas Aroma</FormLabel>
                <Select id="aroma-intensity" name="aromaIntensity" value={aromaIntensity} onChange={(e) => setAromaIntensity(e.target.value)} bg="gray.700" borderColor="gray.600" color="gray.100">
                  <option value="mild" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Ringan</option>
                  <option value="medium" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Sedang</option>
                  <option value="strong" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Kuat</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="user-intent" color="gray.300">Tujuan Penggunaan</FormLabel>
                <Select id="user-intent" name="userIntent" value={userIntent} onChange={(e) => setUserIntent(e.target.value)} bg="gray.700" borderColor="gray.600" color="gray.100">
                  <option value="household" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Penggunaan Rumah Tangga</option>
                  <option value="commercial" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Komersial</option>
                </Select>
              </FormControl>

              {recommendations && (
                <Box borderTop="1px" borderColor="gray.600" pt={4}>
                  <Text fontWeight="bold" mb={3} color="gray.100">
                    Produk yang Direkomendasikan:
                  </Text>
                  <VStack spacing={3} align="start">
                    {recommendations.map((rec: Record<string, unknown>, idx: number) => (
                      <Box key={idx} w="100%" p={3} borderRadius="md" bg="gray.700" borderWidth={selectedProductId === Number(rec.product_id) ? '2px' : '1px'} borderColor={selectedProductId === Number(rec.product_id) ? 'green.400' : 'gray.600'}>
                        <HStack justifyContent="space-between" mb={2}>
                          <Text fontWeight="medium" color="gray.100">{String(rec.name)}</Text>
                          <Badge colorScheme="green">#{idx + 1}</Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.400">
                          Skor kecocokan: {Number(rec.compatibility_score).toFixed(2)}
                        </Text>
                        {Boolean(rec.processing_instruction_summary) && (
                          <Text fontSize="sm" mt={2} color="gray.300">
                            {String(rec.processing_instruction_summary)}
                          </Text>
                        )}
                        <Button
                          mt={3}
                          size="xs"
                          colorScheme={selectedProductId === Number(rec.product_id) ? 'green' : 'gray'}
                          isDisabled={selectingProduct}
                          onClick={() => handleSelectProduct(Number(rec.product_id))}
                        >
                          {selectedProductId === Number(rec.product_id) ? '✓ Terpilih' : 'Pilih untuk Roadmap'}
                        </Button>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="ghost" mr={3} onClick={handleClose} color="gray.300">
              {recommendations ? 'Tutup' : 'Batal'}
            </Button>
            {!recommendations && (
              <Button
                type="submit"
                bg="#34A853"
                color="white"
                isLoading={loading}
                _hover={{ bg: '#2a8a42' }}
              >
                Dapatkan Rekomendasi
              </Button>
            )}
            {recommendations && (
              <Button
                type="button"
                bg="#34A853"
                color="white"
                onClick={() => {
                  onSuccess();
                  handleClose();
                }}
                _hover={{ bg: '#2a8a42' }}
              >
                Lanjut ke Analisis
              </Button>
            )}
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
