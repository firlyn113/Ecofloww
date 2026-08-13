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
  Checkbox,
  Textarea,
  NumberInput,
  NumberInputField,
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Image,
  Icon,
  IconButton,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { useState, useCallback, useRef } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import apiClient from '@/lib/api';
import { enqueueFermentationLog } from '@/lib/offline-queue';

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

interface FermentationLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch;
  onSuccess: () => void;
}

export default function FermentationLogModal({
  isOpen,
  onClose,
  batch,
  onSuccess,
}: FermentationLogModalProps) {
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  
  const [logDate, setLogDate] = useState(getTodayDate());
  const [aroma, setAroma] = useState('sweet');
  const [color, setColor] = useState('brown');
  const [gasPresence, setGasPresence] = useState(false);
  const [temperature, setTemperature] = useState('25');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<Record<string, unknown> | null>(null);
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toast = useToast();

  const resetForm = useCallback(() => {
    setLogDate(getTodayDate());
    setAroma('sweet');
    setColor('brown');
    setGasPresence(false);
    setTemperature('25');
    setNotes('');
    setPrediction(null);
    setSelectedImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Gambar terlalu besar',
          description: 'Pilih gambar kurang dari 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return null;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
      
      const response = await apiClient.post('/api/v1/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Gagal mengunggah',
        description: 'Melanjutkan pembuatan catatan tanpa gambar.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!logDate || !temperature) {
      toast({
        title: 'Validasi Error',
        description: 'Isi semua field yang diperlukan',
        status: 'error',
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      
      let uploadedImageUrl = null;
      if (selectedImage) {
        uploadedImageUrl = await uploadImage();
      }

      const payload = {
        log_date: new Date(logDate).toISOString(),
        aroma,
        color,
        gas_presence: gasPresence,
        temperature_c: parseFloat(temperature),
        notes,
        image_url: uploadedImageUrl || undefined,
      };
      const response = await apiClient.post(`/api/v1/batches/${batch.id}/logs`, payload);

      setPrediction(response.data.data);

      toast({
        title: 'Berhasil',
        description: 'Catatan fermentasi berhasil disimpan',
        status: 'success',
        isClosable: true,
      });

      setTimeout(() => {
        resetForm();
        onSuccess();
        onClose();
      }, 1500);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      if (!navigator.onLine && !err.response) {
        enqueueFermentationLog(batch.id, {
          log_date: new Date(logDate).toISOString(),
          aroma,
          color,
          gas_presence: gasPresence,
          temperature_c: parseFloat(temperature),
          notes,
        });
        toast({
          title: 'Disimpan offline',
          description: 'Catatan akan disinkronkan saat koneksi kembali.',
          status: 'info',
          isClosable: true,
        });
        resetForm();
        onSuccess();
        onClose();
      } else {
        toast({
          title: 'Error',
          description: err.response?.data?.detail || 'Gagal membuat catatan',
          status: 'error',
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { resetForm(); onClose(); }} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent bg="gray.800" borderColor="gray.700" w={{ base: 'calc(100% - 2rem)', md: '100%' }}>
        <ModalHeader id="fermentation-log-title" color="gray.100">Catatan Fermentasi - {batch.name}</ModalHeader>
        <ModalCloseButton aria-label="Tutup dialog catatan fermentasi" color="gray.300" />
        <form onSubmit={handleSubmit} aria-label="Form catatan fermentasi">
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel htmlFor="log-date" color="gray.300">Tanggal Pencatatan</FormLabel>
                <Input
                  id="log-date"
                  name="logDate"
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  bg="gray.700"
                  borderColor="gray.600"
                  color="gray.100"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel htmlFor="aroma" color="gray.300">Aroma</FormLabel>
                <Select
                  id="aroma"
                  name="aroma"
                  value={aroma} 
                  onChange={(e) => setAroma(e.target.value)}
                  bg="gray.700"
                  borderColor="gray.600"
                  color="gray.100"
                >
                  <option value="sweet" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Manis</option>
                  <option value="sour" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Asam</option>
                  <option value="fruity" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Buah-buahan</option>
                  <option value="slightly_rotten" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Sedikit Busuk</option>
                  <option value="strongly_rotten" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Sangat Busuk</option>
                  <option value="moldy" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Jamur</option>
                  <option value="unusual" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Tidak Biasa</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel htmlFor="color" color="gray.300">Warna</FormLabel>
                <Select
                  id="color"
                  name="color"
                  value={color} 
                  onChange={(e) => setColor(e.target.value)}
                  bg="gray.700"
                  borderColor="gray.600"
                  color="gray.100"
                >
                  <option value="brown" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Cokelat</option>
                  <option value="dark_brown" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Cokelat Gelap</option>
                  <option value="light_brown" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Cokelat Muda</option>
                  <option value="amber" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Amber</option>
                  <option value="gold" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Emas</option>
                  <option value="honey" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Madu</option>
                  <option value="unexpected_shift" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Perubahan Warna Aneh</option>
                  <option value="black" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Hitam</option>
                  <option value="green" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Hijau</option>
                  <option value="white_mold" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>Jamur Putih</option>
                </Select>
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <Checkbox
                  id="gas-presence"
                  name="gasPresence"
                  isChecked={gasPresence}
                  onChange={(e) => setGasPresence(e.target.checked)}
                  colorScheme="green"
                >
                  <Text color="gray.300">Terdapat Gelembung Gas</Text>
                </Checkbox>
              </FormControl>

              <FormControl isRequired>
                <FormLabel htmlFor="temperature" color="gray.300">Suhu (°C)</FormLabel>
                <NumberInput value={temperature} onChange={setTemperature} min={-50} max={100}>
                  <NumberInputField
                    id="temperature"
                    name="temperature"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="gray.100"
                  />
                </NumberInput>
              </FormControl>
              
              <FormControl>
                <FormLabel htmlFor="observation-photo" color="gray.300">Foto Observasi</FormLabel>
                <Box
                  border="2px dashed"
                  borderColor="gray.600"
                  borderRadius="md"
                  p={4}
                  textAlign="center"
                  cursor="pointer"
                  onClick={() => !imagePreviewUrl && fileInputRef.current?.click()}
                  _hover={!imagePreviewUrl ? { borderColor: 'green.400', bg: 'gray.700' } : {}}
                  position="relative"
                  transition="all 0.2s"
                  bg="gray.800"
                >
                  <Input
                    id="observation-photo"
                    name="observationPhoto"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    display="none"
                    onChange={handleImageChange}
                  />
                  
                  {imagePreviewUrl ? (
                    <Box position="relative">
                      <Image 
                        src={imagePreviewUrl} 
                        alt="Preview" 
                        maxH="200px" 
                        mx="auto"
                        borderRadius="md"
                      />
                      <IconButton
                        aria-label="Remove image"
                        icon={<FiX />}
                        position="absolute"
                        top={2}
                        right={2}
                        size="sm"
                        colorScheme="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearImage();
                        }}
                        isDisabled={isUploading}
                      />
                    </Box>
                  ) : (
                    <VStack spacing={2}>
                      <Icon as={FiUpload} fontSize="2xl" color="gray.500" />
                      <Text color="gray.400" fontSize="sm">
                        Klik untuk mengunggah foto
                      </Text>
                      <Text fontSize="xs" color="gray.500">PNG, JPG maksimal 5MB</Text>
                    </VStack>
                  )}
                </Box>
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="notes" color="gray.300">Catatan</FormLabel>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Tambahan observasi lainnya..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  bg="gray.700"
                  borderColor="gray.600"
                  color="gray.100"
                  _placeholder={{ color:'gray.500' }}
                  rows={3}
                />
              </FormControl>

              {prediction && (
                <Box 
                  bg="gray.700" 
                  p={4} 
                  borderRadius="lg" 
                  borderLeft="4px"
                  borderLeftColor="green.500"
                >
                  <VStack align="start" spacing={2}>
                     <HStack>
                       <Text fontWeight="bold" color="gray.100">Status:</Text>
                       <Badge colorScheme={
                         String(prediction.ai_status_prediction) === 'Normal' ? 'green' :
                         String(prediction.ai_status_prediction) === 'Caution' ? 'orange' :
                         'red'
                       }>
                         {String(prediction.ai_status_prediction)}
                       </Badge>
                     </HStack>
                     <HStack>
                       <Text fontWeight="bold" color="gray.100">Confidence:</Text>
                       <Text color="gray.300">{(Number(prediction.ai_confidence_score) * 100).toFixed(0)}%</Text>
                     </HStack>
                     <HStack>
                       <Text fontWeight="bold" color="gray.100">Health Score:</Text>
                       <Text color="gray.300">{Number(prediction.health_score)}/100</Text>
                     </HStack>
                     <Box>
                       <Text fontWeight="bold" mb={1} color="gray.100">Saran:</Text>
                       <Text fontSize="sm" color="gray.300">{String(prediction.corrective_action_suggestion)}</Text>
                     </Box>
                      {Boolean(prediction.harvest_alert_triggered) && (
                        <Alert status="success" mt={2} borderRadius="md" bg="purple.500" color="white">
                          <AlertIcon color="white" />
                          <AlertDescription fontWeight="bold">🌾 Siap Panen!</AlertDescription>
                        </Alert>
                      )}
                  </VStack>
                </Box>
              )}
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button 
              type="button"
              variant="ghost" 
              mr={3} 
              onClick={() => { resetForm(); onClose(); }}
              color="gray.300"
              isDisabled={loading || isUploading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              bg="#34A853"
              color="white"
              isLoading={loading || isUploading}
              loadingText={isUploading ? "Mengunggah..." : "Menyimpan..."}
              _hover={{ bg: '#2a8a42' }}
            >
              Simpan Catatan
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
