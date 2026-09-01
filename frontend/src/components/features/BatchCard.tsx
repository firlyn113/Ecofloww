'use client';

import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  Text,
  Button,
  Badge,
  Divider,
  HStack,
  Progress,
} from '@chakra-ui/react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

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

interface BatchCardProps {
  batch: Batch;
  onLogClick?: () => void;
  onDailyLogClick?: () => void;
  onRecommendationClick?: () => void;
  onAnalysisClick?: () => void;
  onRoadmapClick?: () => void;
  isCompleted?: boolean;
}

export default function BatchCard({ batch, onLogClick, onDailyLogClick, onRecommendationClick, onAnalysisClick, onRoadmapClick, isCompleted }: BatchCardProps) {
  const startDate = parseISO(batch.start_date);
  const harvestDate = parseISO(batch.harvest_date);
  const now = new Date();
  const totalDays = Math.floor((harvestDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const progressPercent = Math.min((elapsedDays / totalDays) * 100, 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'blue';
      case 'completed':
        return 'green';
      case 'harvested':
        return 'purple';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'SEDANG DIPROSES';
      case 'pending_start':
        return 'MENUNGGU DIMULAI';
      case 'completed':
        return 'SELESAI';
      case 'harvested':
        return 'DIPANEN';
      case 'failed':
        return 'GAGAL';
      default:
        return status.replace(/_/g, ' ').toUpperCase();
    }
  };

  return (
    <Card borderLeft="4px" borderLeftColor="#34A853">
      <CardHeader>
        <HStack justifyContent="space-between">
          <Stack spacing={1}>
            <Heading size="md">{batch.name}</Heading>
            <Text fontSize="sm" color="gray.600">
              Dimulai {formatDistanceToNow(startDate, { addSuffix: true, locale: id })}
            </Text>
          </Stack>
          <Badge colorScheme={getStatusColor(batch.status)}>
            {getStatusLabel(batch.status)}
          </Badge>
        </HStack>
      </CardHeader>

      <Divider />

      <CardBody>
        <Stack spacing={4}>
          <Box>
            <HStack justifyContent="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="medium">
                Progres Fermentasi
              </Text>
              <Text fontSize="sm" color="gray.600">
                Hari ke-{Math.max(0, elapsedDays)} dari {totalDays}
              </Text>
            </HStack>
            <Progress value={progressPercent} colorScheme="green" size="sm" borderRadius="md" />
          </Box>

          <Stack spacing={2} fontSize="sm">
            <HStack justifyContent="space-between">
              <Text color="gray.600">Bahan Baku (Sampah):</Text>
              <Text fontWeight="medium">{batch.waste_weight_kg} kg</Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text color="gray.600">Kebutuhan Air:</Text>
              <Text fontWeight="medium">{batch.water_liters} L</Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text color="gray.600">Kebutuhan Gula:</Text>
              <Text fontWeight="medium">{batch.sugar_kg} kg</Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text color="gray.600">Perkiraan Panen:</Text>
              <Text fontWeight="medium">
                {formatDistanceToNow(harvestDate, { addSuffix: true, locale: id })}
              </Text>
            </HStack>
          </Stack>

           {isCompleted ? (
             <Stack spacing={2}>
               <Button
                 bg="orange.500"
                 color="white"
                 size="sm"
                 onClick={onRoadmapClick}
                 _hover={{ bg: 'orange.600' }}
               >
                 Lihat Roadmap Pemrosesan
               </Button>
               <Button
                 bg="purple.500"
                 color="white"
                 size="sm"
                 onClick={onAnalysisClick}
                 _hover={{ bg: 'purple.600' }}
               >
                 Analisis Bisnis
               </Button>
             </Stack>
           ) : batch.status !== 'failed' ? (
             <Stack spacing={2}>
               <Button
                 mt={4}
                 bg="#34A853"
                 color="white"
                 size="sm"
                 onClick={onLogClick}
                 _hover={{ bg: '#2a8a42' }}
               >
                 Tambah Catatan Fermentasi
               </Button>
               <Button
                 bg="teal.500"
                 color="white"
                 size="sm"
                 onClick={onDailyLogClick}
                 _hover={{ bg: 'teal.600' }}
               >
                 📝 Catat Progres Harian
               </Button>
               <Button
                 bg="blue.500"
                 color="white"
                 size="sm"
                 onClick={onRecommendationClick}
                 _hover={{ bg: 'blue.600' }}
               >
                 Dapatkan Rekomendasi Produk
               </Button>
               <Button
                 bg="orange.500"
                 color="white"
                 size="sm"
                 onClick={onRoadmapClick}
                 _hover={{ bg: 'orange.600' }}
               >
                 Lihat Roadmap Pemrosesan
               </Button>
<Button
                  bg="purple.500"
                  color="white"
                  size="sm"
                  onClick={onAnalysisClick}
                  _hover={{ bg: 'purple.600' }}
                >
                  Analisis Bisnis
                </Button>
             </Stack>
           ) : null}

        </Stack>
      </CardBody>
    </Card>
  );
}
