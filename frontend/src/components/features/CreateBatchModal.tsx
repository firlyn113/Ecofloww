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
  NumberInput,
  NumberInputField,
  Alert,
  AlertIcon,
  AlertDescription,
  Text,
  Spinner,
  HStack,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import apiClient from '@/lib/api';

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface RatioCheckResult {
  ideal_water_liters: number;
  ideal_sugar_kg: number;
  deviation_warning: {
    water_deviation: number;
    sugar_deviation: number;
    has_warning: boolean;
    warnings: string[];
  };
}

export default function CreateBatchModal({ isOpen, onClose, onSuccess }: CreateBatchModalProps) {
  const [name, setName] = useState('');
  const [wasteWeight, setWasteWeight] = useState('');
  const [waterLiters, setWaterLiters] = useState('');
  const [sugarKg, setSugarKg] = useState('');
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [ratioCheck, setRatioCheck] = useState<RatioCheckResult | null>(null);
  const [checkingRatio, setCheckingRatio] = useState(false);
  const toast = useToast();
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (checkTimer.current) {
      clearTimeout(checkTimer.current);
    }

    const waste = parseFloat(wasteWeight);
    const water = parseFloat(waterLiters);
    const sugar = parseFloat(sugarKg);

    const valid = waste > 0 && water > 0 && sugar > 0;

    checkTimer.current = setTimeout(async () => {
      if (!valid) {
        setRatioCheck(null);
        return;
      }
      setCheckingRatio(true);
      try {
        const response = await apiClient.post('/api/v1/check-ingredient-ratio', {
          waste_kg: waste,
          water_liters: water,
          sugar_kg: sugar,
        });
        setRatioCheck(response.data.data);
      } catch {
        setRatioCheck(null);
      } finally {
        setCheckingRatio(false);
      }
    }, 500);

    return () => {
      if (checkTimer.current) {
        clearTimeout(checkTimer.current);
      }
    };
  }, [wasteWeight, waterLiters, sugarKg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !wasteWeight || !waterLiters || !sugarKg || !startDate) {
      toast({
        title: 'Validasi Gagal',
        description: 'Harap isi semua field yang diperlukan',
        status: 'error',
        isClosable: true,
      });
      return;
    }

    const waste = parseFloat(wasteWeight);
    if (waste <= 0 || waste > 500) {
      toast({
        title: 'Validasi Gagal',
        description: 'Berat limbah harus antara 0.1 kg dan 500 kg',
        status: 'error',
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/api/v1/batches', {
        name,
        waste_weight_kg: parseFloat(wasteWeight),
        start_date: new Date(startDate).toISOString(),
      });

      toast({
        title: 'Batch Berhasil Dibuat',
        description: `Air: ${response.data.data.calculated_water_liters}L, Gula: ${response.data.data.calculated_sugar_kg}kg (Rasio 1:3:10)`,
        status: 'success',
        isClosable: true,
        duration: 5000,
      });

      setName('');
      setWasteWeight('');
      setWaterLiters('');
      setSugarKg('');
      setStartDate('');
      setRatioCheck(null);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: 'Gagal',
        description: err.response?.data?.detail || 'Gagal membuat batch',
        status: 'error',
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setWasteWeight('');
    setWaterLiters('');
    setSugarKg('');
    setStartDate('');
    setRatioCheck(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent
        as="section"
        aria-labelledby="create-batch-title"
        w={{ base: 'calc(100% - 2rem)', md: '100%' }}
      >
        <ModalHeader id="create-batch-title">Buat Batch Baru</ModalHeader>
        <ModalCloseButton aria-label="Tutup dialog buat batch" />
        <form onSubmit={handleSubmit} aria-label="Form buat batch fermentasi">
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel htmlFor="batch-name">Nama Batch</FormLabel>
                <Input
                  id="batch-name"
                  name="batchName"
                  placeholder="Misal, Batch Sampah Dapur 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel htmlFor="waste-weight">Berat Limbah (kg)</FormLabel>
                <NumberInput value={wasteWeight} onChange={setWasteWeight} min={0}>
                  <NumberInputField id="waste-weight" name="wasteWeight" placeholder="Misal, 10" />
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel htmlFor="water-liters">Air (Liter)</FormLabel>
                <NumberInput value={waterLiters} onChange={setWaterLiters} min={0}>
                <NumberInputField id="water-liters" name="waterLiters" placeholder="Misal, 33.33 (10/3 × berat limbah)" />
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel htmlFor="sugar-kg">Gula (kg)</FormLabel>
                <NumberInput value={sugarKg} onChange={setSugarKg} min={0}>
                  <NumberInputField id="sugar-kg" name="sugarKg" placeholder="Misal, 3.33 (1/3 × berat limbah)" />
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel htmlFor="start-date">Tanggal Mulai</FormLabel>
                <Input
                  id="start-date"
                  name="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </FormControl>

              {checkingRatio && (
                <HStack spacing={2}>
                  <Spinner size="sm" color="#34A853" />
                  <Text fontSize="sm" color="gray.500">Memeriksa rasio bahan...</Text>
                </HStack>
              )}

              {ratioCheck && ratioCheck.deviation_warning.has_warning && (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    <Text fontWeight="bold" mb={1}>Rasio bahan menyimpang dari ideal!</Text>
                    <Text fontSize="sm">Ideal: {ratioCheck.ideal_water_liters} L air, {ratioCheck.ideal_sugar_kg} kg gula</Text>
                    <ul style={{ marginTop: 4, paddingLeft: 16 }}>
                      {ratioCheck.deviation_warning.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {ratioCheck && !ratioCheck.deviation_warning.has_warning && (
                <Alert status="success" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    Rasio bahan sudah sesuai (air {ratioCheck.ideal_water_liters} L, gula {ratioCheck.ideal_sugar_kg} kg).
                  </AlertDescription>
                </Alert>
              )}
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="ghost" mr={3} onClick={handleClose}>
              Batal
            </Button>
            <Button
              type="submit"
              bg="#34A853"
              color="white"
              isLoading={loading}
              _hover={{ bg: '#2a8a42' }}
            >
              Buat Batch
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
