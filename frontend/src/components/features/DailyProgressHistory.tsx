'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Heading,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import apiClient from '@/lib/api';

interface DailyLog {
  id: number;
  batch_id: number;
  log_date: string;
  action_taken: string;
  condition: string;
  notes: string | null;
  created_at: string;
}

interface DailyProgressHistoryProps {
  batchId: number;
}

export default function DailyProgressHistory({ batchId }: DailyProgressHistoryProps) {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/api/v1/batches/${batchId}/daily-logs`);
        if (isMounted && response.data.status === 'success') {
          setLogs(response.data.data.daily_logs || []);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorObj = err as { response?: { data?: { detail?: string } } };
          console.error('Error fetching daily logs:', err);
          setError(errorObj.response?.data?.detail || 'Gagal memuat riwayat progres');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadLogs();

    return () => {
      isMounted = false;
    };
  }, [batchId]);

  const getConditionColor = (condition: string) => {
    if (condition.includes('Normal') || condition.includes('Asam Segar')) return 'green';
    if (condition.includes('Jamur Putih')) return 'yellow';
    if (condition.includes('Busuk') || condition.includes('Hijau') || condition.includes('Hitam')) return 'red';
    if (condition.includes('Gas Berlebihan')) return 'orange';
    return 'gray';
  };

  const getConditionIcon = (condition: string) => {
    if (condition.includes('Normal')) return '✅';
    if (condition.includes('Jamur Putih')) return '⚪';
    if (condition.includes('Busuk')) return '⚠️';
    if (condition.includes('Asam Segar')) return '🍋';
    if (condition.includes('Hijau') || condition.includes('Hitam')) return '🚫';
    if (condition.includes('Gas Berlebihan')) return '💨';
    if (condition.includes('Tidak Ada Aktivitas')) return '😴';
    return '📋';
  };

  if (loading) {
    return (
      <Card mt={4}>
        <CardBody>
          <VStack spacing={4} py={8}>
            <Spinner size="lg" color="teal.500" />
            <Text color="gray.600">Memuat riwayat progres...</Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card mt={4}>
        <CardBody>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        </CardBody>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card mt={4}>
        <CardBody>
          <VStack spacing={3} py={6}>
            <Text fontSize="3xl">📝</Text>
            <Text color="gray.600" textAlign="center">
              Belum ada catatan progres harian untuk batch ini.
            </Text>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              Mulai catat aktivitas harianmu untuk memantau perkembangan fermentasi!
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card mt={4}>
      <CardBody>
        <Heading size="md" mb={4} color="teal.600">
          📊 Riwayat Progres Harian
        </Heading>
        <VStack spacing={4} align="stretch">
          {logs.map((log, index) => (
            <Box key={log.id}>
              <HStack align="start" spacing={4}>
                <Box
                  bg={`${getConditionColor(log.condition)}.100`}
                  color={`${getConditionColor(log.condition)}.700`}
                  borderRadius="full"
                  w={10}
                  h={10}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="xl"
                  flexShrink={0}
                >
                  {getConditionIcon(log.condition)}
                </Box>
                <Box flex={1}>
                  <HStack justifyContent="space-between" mb={2}>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">
                      {formatDistanceToNow(parseISO(log.log_date), { addSuffix: true, locale: id })}
                    </Text>
                    <Badge colorScheme={getConditionColor(log.condition)}>
                      {log.condition}
                    </Badge>
                  </HStack>
                  <Text fontWeight="semibold" color="gray.800" mb={1}>
                    {log.action_taken}
                  </Text>
                  {log.notes && (
                    <Text fontSize="sm" color="gray.600" bg="gray.50" mt={2} p={3} borderRadius="md">
                      {log.notes}
                    </Text>
                  )}
                </Box>
              </HStack>
              {index < logs.length - 1 && <Divider mt={4} />}
            </Box>
          ))}
        </VStack>
        {logs.length > 0 && (
          <Box mt={4} p={3} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderColor="blue.500">
            <Text fontSize="sm" color="blue.900">
              💡 Total catatan: <strong>{logs.length}</strong> entri progres harian
            </Text>
          </Box>
        )}
      </CardBody>
    </Card>
  );
}
