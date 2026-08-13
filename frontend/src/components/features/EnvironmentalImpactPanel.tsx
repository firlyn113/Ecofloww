'use client';

import { useState } from 'react';
import { Box, Card, CardBody, Heading, Text, Grid, Icon, Progress, VStack, HStack, Badge } from '@chakra-ui/react';
import { FiTrendingUp, FiDroplet, FiWind, FiLeaf } from 'react-icons/fi';

interface EnvironmentalMetrics {
  totalWasteDiverted: number;
  totalCO2Avoided: number;
  waterSaved: number;
  treesEquivalent: number;
  monthlyGrowth: number;
}

interface ImpactCardProps {
  icon: any;
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
              Progress
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

export default function EnvironmentalImpactPanel({ totalWasteDiverted = 0 }: { totalWasteDiverted?: number }) {
  const co2ConversionFactor = 1.9;
  const waterConversionFactor = 3;
  const treeEquivalentFactor = 0.02;

  const metrics: EnvironmentalMetrics = {
    totalWasteDiverted,
    totalCO2Avoided: totalWasteDiverted * co2ConversionFactor,
    waterSaved: totalWasteDiverted * waterConversionFactor,
    treesEquivalent: totalWasteDiverted * treeEquivalentFactor,
    monthlyGrowth: 24,
  };

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Header */}
        <Card bg="gradient-to-r from-emerald-50 to-green-50" borderRadius="2xl" borderWidth={1} borderColor="emerald.200">
          <CardBody p={6}>
            <HStack spacing={3}>
              <Icon as={FiLeaf} boxSize={8} color="emerald.700" />
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
            label="Sampah Organik Diolah"
            value={metrics.totalWasteDiverted.toFixed(1)}
            unit="kg"
            color="emerald.600"
            progress={65}
            target="100 kg"
          />
          <ImpactCard
            icon={FiWind}
            label="CO₂ yang Dihindari"
            value={metrics.totalCO2Avoided.toFixed(1)}
            unit="kg"
            color="blue.500"
            progress={58}
            target="200 kg"
          />
          <ImpactCard
            icon={FiDroplet}
            label="Air Bersih Terselamatkan"
            value={metrics.waterSaved.toFixed(1)}
            unit="L"
            color="cyan.500"
            progress={72}
            target="500 L"
          />
          <ImpactCard
            icon={FiLeaf}
            label="Setara Menanam Pohon"
            value={metrics.treesEquivalent.toFixed(1)}
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
              <Icon as={FiLeaf} boxSize={6} color="amber.700" />
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" fontWeight="bold" color="stone.900">
                  🌱 Dampak Positif Anda
                </Text>
                <Text fontSize="sm" color="stone.700">
                  Dengan mengolah {metrics.totalWasteDiverted.toFixed(1)} kg sampah organik, Anda telah mencegah{' '}
                  <strong>{metrics.totalCO2Avoided.toFixed(1)} kg CO₂</strong> masuk ke atmosfer—setara dengan dampak{' '}
                  <strong>{metrics.treesEquivalent.toFixed(1)} pohon</strong> yang menyerap karbon selama setahun!
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
