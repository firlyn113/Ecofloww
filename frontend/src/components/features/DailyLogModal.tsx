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
  Textarea,
  Box,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useState, useCallback } from 'react';
import apiClient from '@/lib/api';

interface Batch {
  id: number;
  name: string;
  status: string;
  waste_weight_kg: number;
  water_liters: number;
  sugar_kg: number;
  start_date: string;
  harvest_date: string;
  created_at: string;
}

interface DailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch;
  onSuccess: () => void;
}

export default function DailyLogModal({
  isOpen,
  onClose,
  batch,
  onSuccess,
}: DailyLogModalProps) {
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  
  const [logDate, setLogDate] = useState(getTodayDate());
  const [actionTaken, setActionTaken] = useState('');
  const [condition, setCondition] = useState('Normal');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const resetForm = useCallback(() => {
    setLogDate(getTodayDate());
    setActionTaken('');
    setCondition('Normal');
    setNotes('');
  }, []);

  const handleSubmit = async () => {
    if (!actionTaken.trim()) {
      toast({
        title: 'Validasi Error',
        description: 'Mohon pilih atau isi tindakan yang dilakukan',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        log_date: new Date(logDate + 'T00:00:00').toISOString(),
        action_taken: actionTaken,
        condition: condition,
        notes: notes.trim() || null,
      };

      const response = await apiClient.post(
        `/api/v1/batches/${batch.id}/daily-logs`,
        payload
      );

      if (response.data.status === 'success') {
        toast({
          title: 'Progres berhasil dicatat!',
          description: 'Log harian telah tersimpan.',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        resetForm();
        onSuccess();
      }
    } catch (error: any) {
      console.error('Daily log submission error:', error);
      toast({
        title: 'Gagal menyimpan log',
        description: error.response?.data?.detail || 'Terjadi kesalahan saat menyimpan progres harian',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <VStack align="start" spacing={1}>
            <Text fontSize="xl" fontWeight="bold">
              📝 Catat Progres Harian
            </Text>
            <Text fontSize="sm" fontWeight="normal" color="gray.600">
              Batch: {batch.name}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton isDisabled={loading} />
        
        <ModalBody>
          <Stack spacing={4}>
            <Box bg="blue.50" p={3} borderRadius="md" borderLeft="4px solid" borderColor="blue.500">
              <Text fontSize="sm" color="blue.900">
                💡 <strong>Tips:</strong> Catat setiap aktivitas penting seperti membuang gas, mengaduk, atau mengecek kondisi untuk hasil fermentasi optimal.
              </Text>
            </Box>

            <FormControl isRequired>
              <FormLabel>Tanggal</FormLabel>
              <Input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                max={getTodayDate()}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Tindakan yang Dilakukan</FormLabel>
              <Select
                placeholder="Pilih tindakan..."
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
              >
                <option value="Buka tutup botol (buang gas)">Buka tutup botol (buang gas)</option>
                <option value="Cek kondisi">Cek kondisi</option>
                <option value="Aduk campuran">Aduk campuran</option>
                <option value="Ukur pH">Ukur pH</option>
                <option value="Bersihkan bagian luar wadah">Bersihkan bagian luar wadah</option>
                <option value="Lainnya">Lainnya</option>
              </Select>
              {actionTaken === 'Lainnya' && (
                <Input
                  mt={2}
                  placeholder="Jelaskan tindakan yang dilakukan..."
                  onChange={(e) => setActionTaken(e.target.value)}
                />
              )}
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Kondisi Batch</FormLabel>
              <Select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="Normal">✅ Normal (tidak ada masalah)</option>
                <option value="Ada Jamur Putih">⚪ Ada Jamur Putih (normal di awal)</option>
                <option value="Berbau Busuk">⚠️ Berbau Busuk</option>
                <option value="Berbau Asam Segar">🍋 Berbau Asam Segar (baik)</option>
                <option value="Ada Jamur Hijau/Hitam">🚫 Ada Jamur Hijau/Hitam (berbahaya)</option>
                <option value="Gas Berlebihan">💨 Gas Berlebihan</option>
                <option value="Tidak Ada Aktivitas">😴 Tidak Ada Aktivitas</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Catatan Tambahan (Opsional)</FormLabel>
              <Textarea
                placeholder="Tambahkan catatan detail, misalnya: warna cairan, intensitas bau, jumlah gas yang keluar, dll."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                maxLength={2000}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                {notes.length}/2000 karakter
              </Text>
            </FormControl>

            {condition.includes('Busuk') || condition.includes('Hijau') || condition.includes('Hitam') ? (
              <Box bg="red.50" p={3} borderRadius="md" borderLeft="4px solid" borderColor="red.500">
                <Text fontSize="sm" color="red.900" fontWeight="semibold">
                  ⚠️ Peringatan
                </Text>
                <Text fontSize="xs" color="red.800" mt={1}>
                  Kondisi ini menandakan masalah serius. Segera pisahkan batch dari yang lain dan konsultasikan dengan ahli.
                </Text>
              </Box>
            ) : null}
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={handleClose}
            isDisabled={loading}
          >
            Batal
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Menyimpan..."
          >
            Simpan Progres
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
