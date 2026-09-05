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
  Stack,
  useToast,
  VStack,
  HStack,
  Box,
  Text,
  Progress,
  Checkbox,
  Badge,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { cacheRoadmap, getCachedRoadmap } from '@/lib/roadmap-cache';

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: number;
  productTemplateId: number;
  onSuccess: () => void;
}

interface RoadmapStep {
  title: string;
  description: string;
  details: string;
  completed: boolean;
}

interface RoadmapData {
  id: number;
  batch_id: number;
  product_template_id: number;
  status: string;
  current_step: number;
  total_steps: number;
  completed_steps: number;
  progress_percentage: number;
  steps: RoadmapStep[];
  started_at: string | null;
  completed_at: string | null;
}

export default function RoadmapModal({
  isOpen,
  onClose,
  batchId,
  productTemplateId,
  onSuccess,
}: RoadmapModalProps) {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let isMounted = true;

    const tryGet = async () => {
      const response = await apiClient.get(`/api/v1/batches/${batchId}/roadmap`);
      if (isMounted) {
        setRoadmap(response.data.data);
        cacheRoadmap(batchId, productTemplateId, response.data.data);
      }
    };

    const showCachedIfOffline = (): boolean => {
      if (!navigator.onLine) {
        const cached = getCachedRoadmap(batchId);
        if (cached && isMounted) {
          setRoadmap(cached.data as RoadmapData);
          toast({
            title: 'Mode offline',
            description: 'Menampilkan roadmap tersimpan. Perubahan progress akan tersinkron saat online.',
            status: 'info',
            isClosable: true,
            duration: 4000,
          });
          return true;
        }
      }
      return false;
    };

    const loadRoadmap = async () => {
      try {
        setLoading(true);
        try {
          await tryGet();
          return;
        } catch {
          if (showCachedIfOffline()) return;
          try {
            const createRes = await apiClient.post(`/api/v1/batches/${batchId}/roadmap`, {
              product_template_id: productTemplateId,
            });
            if (isMounted) {
              setRoadmap(createRes.data.data);
              cacheRoadmap(batchId, productTemplateId, createRes.data.data);
            }
          } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string }; status?: number } };
            const alreadyExists = err.response && [400, 409].includes(err.response.status ?? 0);
            if (alreadyExists) {
              try {
                await tryGet();
                return;
              } catch {
                // fall through ke cache offline
              }
            }
            if (showCachedIfOffline()) return;
            if (isMounted) {
              toast({
                title: 'Gagal',
                description: err.response?.data?.detail || 'Gagal memuat data roadmap',
                status: 'error',
                isClosable: true,
              });
            }
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (isOpen && roadmap === null) {
      loadRoadmap();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, batchId, productTemplateId, toast, roadmap]);

  const handleDownloadReport = async () => {
    try {
      const response = await apiClient.get(`/api/v1/batches/${batchId}/roadmap/report`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `roadmap-batch-${batchId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: 'Gagal mengunduh',
        description: err.response?.data?.detail || 'Laporan roadmap tidak dapat diunduh',
        status: 'error',
        isClosable: true,
      });
    }
  };

  const handleStepToggle = async (stepIndex: number, completed: boolean) => {
    if (!roadmap) return;

    // Optimistic UI Update
    const updatedSteps = roadmap.steps.map((step, idx) => 
      idx === stepIndex ? { ...step, completed } : step
    );
    
    const completedCount = updatedSteps.filter(s => s.completed).length;
    const totalSteps = updatedSteps.length;
    const newProgress = (completedCount / totalSteps) * 100;
    
    // Update UI immediately (optimistic)
    setRoadmap({
      ...roadmap,
      steps: updatedSteps,
      completed_steps: completedCount,
      progress_percentage: newProgress,
      status: completedCount === 0 ? 'not_started' : completedCount === totalSteps ? 'completed' : 'in_progress'
    });

    try {
      setUpdating(true);
      const response = await apiClient.put(
        `/api/v1/batches/${batchId}/roadmap/steps/${stepIndex}`,
        { completed }
      );
      // Update with server response
      setRoadmap(response.data.data);
      cacheRoadmap(batchId, productTemplateId, response.data.data);
      toast({
        title: 'Berhasil',
        description: `Langkah ${completed ? 'selesai' : 'dibatalkan'}`,
        status: 'success',
        isClosable: true,
        duration: 2000,
      });
    } catch (error: unknown) {
      // Revert optimistic update on error
      setRoadmap(roadmap);
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: 'Gagal',
        description: err.response?.data?.detail || 'Gagal memperbarui langkah',
        status: 'error',
        isClosable: true,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleClose = () => {
    setRoadmap(null);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'in_progress':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Selesai';
      case 'in_progress':
        return 'Sedang Berjalan';
      case 'not_started':
        return 'Belum Dimulai';
      default:
        return 'Memuat...';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered closeOnOverlayClick={false} closeOnEsc={!updating}>
      <ModalOverlay />
      <ModalContent aria-labelledby="roadmap-title" maxH="90vh" overflowY="auto" bg="var(--bg-card, white)" color="var(--text-primary, #1f2937)" borderColor="var(--border-color, #e5e7eb)" w={{ base: 'calc(100% - 2rem)', md: '100%' }}>
        <ModalHeader id="roadmap-title">
          <HStack justifyContent="space-between">
            <Text>Roadmap Pemrosesan</Text>
            <Badge colorScheme={getStatusColor(roadmap?.status || 'not_started')}>
              {getStatusLabel(roadmap?.status || '')}
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton aria-label="Tutup dialog roadmap" />
        <ModalBody>
          {loading ? (
            <Text>Memuat roadmap...</Text>
          ) : roadmap ? (
            <Stack spacing={6}>
              <Box>
                <HStack justifyContent="space-between" mb={2}>
                  <Text fontWeight="bold">Progres</Text>
                  <Text fontSize="sm" color="gray.600">
                    {roadmap.completed_steps} / {roadmap.total_steps} langkah
                  </Text>
                </HStack>
                <Progress
                  value={roadmap.progress_percentage}
                  colorScheme="green"
                  borderRadius="md"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {roadmap.progress_percentage.toFixed(0)}% selesai
                </Text>
              </Box>

              <VStack as="ul" listStyleType="none" spacing={4} align="stretch">
                {roadmap.steps.map((step, index) => (
                  <Box
                    as="li"
                    key={index}
                    borderWidth="1px"
                    borderRadius="md"
                    p={4}
                    bg={step.completed ? 'green.50' : 'white'}
                    borderColor={step.completed ? 'green.200' : 'gray.200'}
                  >
                    <HStack spacing={3} mb={2}>
                      <Checkbox
                        id={`step-${index}`}
                        isChecked={step.completed}
                        onChange={(e) => handleStepToggle(index, e.target.checked)}
                        isDisabled={updating}
                        aria-labelledby={`step-label-${index}`}
                      />
                      <VStack as="label" htmlFor={`step-${index}`} cursor="pointer" align="start" spacing={0} flex={1}>
                        <Text id={`step-label-${index}`} fontWeight="bold" textDecoration={step.completed ? 'line-through' : 'none'}>
                          {index + 1}. {step.title}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {step.description}
                        </Text>
                      </VStack>
                    </HStack>
                    <Text fontSize="sm" color="gray.700" pl={8}>
                      {step.details}
                    </Text>
                  </Box>
                ))}
              </VStack>

              {roadmap.status === 'completed' && (
                <Box borderWidth="1px" borderRadius="md" p={4} bg="green.50" borderColor="green.200">
                  <Text fontWeight="bold" color="green.700" mb={2}>
                    Roadmap Selesai!
                  </Text>
                  <Text fontSize="sm" color="green.600">
                    Semua langkah telah selesai. Produk Anda siap digunakan atau dipasarkan!
                  </Text>
                </Box>
              )}
            </Stack>
          ) : (
            <Text>Tidak dapat memuat roadmap</Text>
          )}
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Tutup
          </Button>
          {roadmap && (
            <Button type="button" variant="outline" ml={3} onClick={handleDownloadReport}>
              Unduh Checklist PDF
            </Button>
          )}
          {roadmap?.status === 'completed' && (
            <Button
              type="button"
              bg="#34A853"
              color="white"
              ml={3}
              onClick={() => {
                onSuccess();
                handleClose();
              }}
              _hover={{ bg: '#2a8a42' }}
            >
              Selesai
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
