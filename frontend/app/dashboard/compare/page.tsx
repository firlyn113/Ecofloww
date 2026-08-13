'use client';

import { useState } from 'react';
import { Box, Card, CardBody, Heading, Text, Select, Grid, VStack, HStack, Badge } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useBatches } from '@/lib/batches-context';

export default function BatchComparisonPage() {
  const { batches } = useBatches();
  const [batch1Id, setBatch1Id] = useState<number | null>(null);
  const [batch2Id, setBatch2Id] = useState<number | null>(null);

  const batch1 = batches.find((b) => b.id === batch1Id);
  const batch2 = batches.find((b) => b.id === batch2Id);

  const comparisonData = [
    {
      metric: 'Waste (kg)',
      batch1: batch1?.waste_weight_kg || 0,
      batch2: batch2?.waste_weight_kg || 0,
    },
    {
      metric: 'Water (L)',
      batch1: batch1?.water_liters || 0,
      batch2: batch2?.water_liters || 0,
    },
    {
      metric: 'Sugar (kg)',
      batch1: batch1?.sugar_kg || 0,
      batch2: batch2?.sugar_kg || 0,
    },
  ];

  const radarData = [
    { subject: 'Efficiency', batch1: 85, batch2: 92, fullMark: 100 },
    { subject: 'Quality', batch1: 78, batch2: 88, fullMark: 100 },
    { subject: 'Speed', batch1: 90, batch2: 75, fullMark: 100 },
    { subject: 'Cost', batch1: 70, batch2: 82, fullMark: 100 },
    { subject: 'Sustainability', batch1: 95, batch2: 90, fullMark: 100 },
  ];

  const timelineData = [
    { day: 0, batch1Temp: 25, batch2Temp: 26 },
    { day: 15, batch1Temp: 28, batch2Temp: 27 },
    { day: 30, batch1Temp: 30, batch2Temp: 29 },
    { day: 45, batch1Temp: 29, batch2Temp: 28 },
    { day: 60, batch1Temp: 27, batch2Temp: 27 },
    { day: 75, batch1Temp: 26, batch2Temp: 26 },
    { day: 90, batch1Temp: 25, batch2Temp: 25 },
  ];

  return (
    <Box p={6} maxW="7xl" mx="auto">
      <VStack align="stretch" spacing={6}>
        {/* Header */}
        <Card bg="gradient-to-r from-emerald-50 to-blue-50" borderRadius="2xl" borderWidth={1} borderColor="emerald.200">
          <CardBody p={8}>
            <Heading size="xl" color="stone.900" mb={2}>
              Perbandingan Batch
            </Heading>
            <Text fontSize="lg" color="stone.600">
              Analisis komparatif dua batch fermentasi untuk optimalisasi proses
            </Text>
          </CardBody>
        </Card>

        {/* Batch Selectors */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Badge colorScheme="blue" alignSelf="start">
                  Batch 1
                </Badge>
                <Select
                  placeholder="Pilih Batch Pertama"
                  value={batch1Id || ''}
                  onChange={(e) => setBatch1Id(Number(e.target.value))}
                  size="lg"
                >
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </Select>
                {batch1 && (
                  <Box p={4} bg="blue.50" borderRadius="lg">
                    <Text fontSize="sm" color="stone.700">
                      <strong>Status:</strong> {batch1.status}
                    </Text>
                    <Text fontSize="sm" color="stone.700">
                      <strong>Berat:</strong> {batch1.waste_weight_kg} kg
                    </Text>
                    <Text fontSize="sm" color="stone.700">
                      <strong>Mulai:</strong> {new Date(batch1.start_date).toLocaleDateString('id-ID')}
                    </Text>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Badge colorScheme="green" alignSelf="start">
                  Batch 2
                </Badge>
                <Select
                  placeholder="Pilih Batch Kedua"
                  value={batch2Id || ''}
                  onChange={(e) => setBatch2Id(Number(e.target.value))}
                  size="lg"
                >
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </Select>
                {batch2 && (
                  <Box p={4} bg="green.50" borderRadius="lg">
                    <Text fontSize="sm" color="stone.700">
                      <strong>Status:</strong> {batch2.status}
                    </Text>
                    <Text fontSize="sm" color="stone.700">
                      <strong>Berat:</strong> {batch2.waste_weight_kg} kg
                    </Text>
                    <Text fontSize="sm" color="stone.700">
                      <strong>Mulai:</strong> {new Date(batch2.start_date).toLocaleDateString('id-ID')}
                    </Text>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        </Grid>

        {batch1 && batch2 && (
          <>
            {/* Temperature Timeline Comparison */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4} color="stone.900">
                  Perbandingan Suhu Fermentasi (°C)
                </Heading>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: 'Hari', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Suhu (°C)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="batch1Temp" stroke="#3B82F6" name={batch1.name} strokeWidth={2} />
                    <Line type="monotone" dataKey="batch2Temp" stroke="#10B981" name={batch2.name} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Radar Chart - Performance Metrics */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4} color="stone.900">
                  Perbandingan Performa
                </Heading>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name={batch1.name} dataKey="batch1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                    <Radar name={batch2.name} dataKey="batch2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Summary Comparison */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4} color="stone.900">
                  Ringkasan Perbandingan
                </Heading>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                  {comparisonData.map((item) => (
                    <Box key={item.metric} p={4} bg="stone.50" borderRadius="lg">
                      <Text fontSize="sm" fontWeight="bold" color="stone.600" mb={2}>
                        {item.metric}
                      </Text>
                      <HStack justify="space-between">
                        <VStack align="start" spacing={0}>
                          <Badge colorScheme="blue">Batch 1</Badge>
                          <Text fontSize="lg" fontWeight="bold" color="stone.900">
                            {item.batch1}
                          </Text>
                        </VStack>
                        <VStack align="start" spacing={0}>
                          <Badge colorScheme="green">Batch 2</Badge>
                          <Text fontSize="lg" fontWeight="bold" color="stone.900">
                            {item.batch2}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  ))}
                </Grid>
              </CardBody>
            </Card>

            {/* Insights */}
            <Card bg="amber.50" borderRadius="xl" borderLeft="4px" borderColor="amber.500">
              <CardBody p={6}>
                <Heading size="sm" color="amber.900" mb={3}>
                  💡 Insight AI
                </Heading>
                <Text fontSize="sm" color="stone.700">
                  <strong>{batch1.name}</strong> memiliki efisiensi lebih tinggi pada 15 hari pertama, sedangkan{' '}
                  <strong>{batch2.name}</strong> menunjukkan kualitas akhir yang lebih baik. Rekomendasi: Terapkan
                  metode monitoring dari Batch 2 untuk hasil optimal.
                </Text>
              </CardBody>
            </Card>
          </>
        )}

        {(!batch1 || !batch2) && (
          <Card>
            <CardBody textAlign="center" py={12}>
              <Text fontSize="lg" color="stone.500">
                Pilih dua batch untuk membandingkan metrik fermentasi
              </Text>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
}
