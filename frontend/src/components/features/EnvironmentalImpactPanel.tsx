'use client';

import { useState, useEffect } from 'react';
import { Box, Card, CardBody, Heading, Text, Grid, Icon, Progress, VStack, HStack, Badge, Center, Spinner } from '@chakra-ui/react';
import { FiTrendingUp, FiDroplet, FiWind } from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';
import apiClient from '@/lib/api';

interface ImpactData {
  limbah_teralihkan_kg: number;
  co2_dikurangi_kg: number;
  air_terselamatkan_liter: number;
  setara_pohon: number;
}

import { IconType } from 'react-icons';

interface ImpactCardProps {
  icon: IconType;
  label: string;
  value: string;
  unit: string;
  color: string;
  progress: number;
  target: string;
}

const ImpactCard = ({ icon, label, value, unit, color, progress, target }: ImpactCardProps) => (
  <Card borderRadius="xl" borderWidth={1} borderColor="stone.200" _hover={{ shadow: 'lg' }} transition="all 0.2s">
    <CardBody p={6}>
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Icon as={icon} boxSize={8} color={color} />
          <Badge colorScheme="green" fontSize="xs">
            +{progress}%
          </Badge>
        </HStack>
        <VStack align="start" spacing={1}>
          <Text fontSize="sm" color="stone.600" fontWeight="medium">
            {label}
          </Text>
          <HStack align="baseline" spacing={1}>
            <Heading size="xl" color="stone.900">
              {value}
            </Heading>
            <Text fontSize="lg" color="stone.600" fontWeight="medium">
              {unit}
            </Text>
          </HStack>
        </VStack>
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="xs" color="stone.500">
              Progres
            </Text>
            <Text fontSize="xs" color="stone.500">
              Target: {target}
            </Text>
          </HStack>
          <Progress value={progress} colorScheme="green" borderRadius="full" size="sm" />
        </Box>
      </VStack>
    </CardBody>
  </Card>
);

export default function EnvironmentalImpactPanel() {
  const [data, setData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get('/api/v1/impact/user')
      .then((response) => {
        if (!cancelled) {
          setData(response.data.data);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Center py={10}>
        <Spinner color="emerald.500" />
      </Center>
    );
  }

  const impactData = data || {
    limbah_teralihkan_kg: 0,
    co2_dikurangi_kg: 0,
    air_terselamatkan_liter: 0,
    setara_pohon: 0,
  };

  const formatNumber = (num: number) => num.toLocaleString('id-ID', { maximumFractionDigits: 1 });

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Header */}
        <Card bg="gradient-to-r from-emerald-50 to-green-50" borderRadius="2xl" borderWidth={1} borderColor="emerald.200">
          <CardBody p={6}>
            <HStack spacing={3}>
              <Icon as={FaLeaf} boxSize={8} color="emerald.700" />
              <VStack align="start" spacing={0}>
                <Heading size="lg" color="stone.900">
                  Dampak Lingkungan
                </Heading>
                <Text fontSize="sm" color="stone.600">
                  Kontribusi Anda untuk planet yang lebih hijau
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Metrics Grid */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
          <ImpactCard
            icon={FiTrendingUp}
            label="Limbah Teralihkan"
            value={formatNumber(impactData.limbah_teralihkan_kg)}
            unit="kg"
            color="emerald.600"
            progress={65}
            target="100 kg"
          />
          <ImpactCard
            icon={FiWind}
            label="CO₂ Dikurangi"
            value={formatNumber(impactData.co2_dikurangi_kg)}
            unit="kg"
            color="blue.500"
            progress={58}
            target="200 kg"
          />
          <ImpactCard
            icon={FiDroplet}
            label="Air Bersih Terselamatkan"
            value={formatNumber(impactData.air_terselamatkan_liter)}
            unit="L"
            color="cyan.500"
            progress={72}
            target="500 L"
          />
          <ImpactCard
            icon={FaLeaf}
            label="Setara Pohon"
            value={formatNumber(impactData.setara_pohon)}
            unit="pohon"
            color="green.600"
            progress={45}
            target="10 pohon"
          />
        </Grid>

        {/* Insight Card */}
        <Card bg="amber.50" borderRadius="xl" borderLeft="4px" borderColor="amber.500">
          <CardBody p={6}>
            <HStack spacing={3}>
              <Icon as={FaLeaf} boxSize={6} color="amber.700" />
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" fontWeight="bold" color="stone.900">
                  🌱 Ringkasan Dampak Anda
                </Text>
                <Text fontSize="sm" color="stone.700">
                  Dengan mengolah {formatNumber(impactData.limbah_teralihkan_kg)} kg sampah organik, Anda telah mencegah{' '}
                  <strong>{formatNumber(impactData.co2_dikurangi_kg)} kg CO₂</strong> masuk ke atmosfer—setara dengan dampak{' '}
                  <strong>{formatNumber(impactData.setara_pohon)} pohon</strong> yang menyerap karbon selama setahun!
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
