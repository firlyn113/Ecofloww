'use client';

import { useState } from 'react';
import { Box, Card, CardBody, Heading, Text, Button, Grid, Avatar, Badge, HStack, VStack, Divider, Icon } from '@chakra-ui/react';
import { FiShare2, FiHeart, FiMessageCircle, FiTrendingUp, FiUsers } from 'react-icons/fi';

interface CommunityBatch {
  id: number;
  userName: string;
  userAvatar?: string;
  batchName: string;
  wasteWeight: number;
  status: string;
  daysElapsed: number;
  tips: string;
  likes: number;
  comments: number;
  sharedAt: string;
}

const mockCommunityBatches: CommunityBatch[] = [
  {
    id: 1,
    userName: 'Ibu Siti Rahayu',
    batchName: 'Sampah Dapur - Juli 2026',
    wasteWeight: 12.5,
    status: 'active',
    daysElapsed: 45,
    tips: 'Saya tambahkan kulit jeruk untuk aroma yang lebih segar. Pastikan tutup rapat!',
    likes: 24,
    comments: 8,
    sharedAt: '2 hari lalu',
  },
  {
    id: 2,
    userName: 'Pak Budi Santoso',
    batchName: 'Batch Organik RT 05',
    wasteWeight: 25.0,
    status: 'harvested',
    daysElapsed: 90,
    tips: 'Hasil panen sangat baik! Kunci sukses: jangan buka tutup terlalu sering, cek gas seminggu sekali.',
    likes: 56,
    comments: 15,
    sharedAt: '1 minggu lalu',
  },
  {
    id: 3,
    userName: 'Komunitas Hijau Jakarta',
    batchName: 'Eco-Enzyme Komunitas #12',
    wasteWeight: 50.0,
    status: 'active',
    daysElapsed: 60,
    tips: 'Batch komunitas skala besar! Kami gunakan drum 200L. Progress sangat baik dengan pH 3.5.',
    likes: 102,
    comments: 34,
    sharedAt: '3 hari lalu',
  },
];

export default function CommunityPage() {
  const [batches] = useState<CommunityBatch[]>(mockCommunityBatches);
  const [likedBatches, setLikedBatches] = useState<Set<number>>(new Set());

  const handleLike = (batchId: number) => {
    setLikedBatches((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(batchId)) {
        newSet.delete(batchId);
      } else {
        newSet.add(batchId);
      }
      return newSet;
    });
  };

  return (
    <Box p={6} maxW="7xl" mx="auto">
      <VStack align="stretch" spacing={6}>
        {/* Header */}
        <Card bg="gradient-to-r from-emerald-50 to-amber-50" borderRadius="2xl" borderWidth={1} borderColor="emerald.200">
          <CardBody p={8}>
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={2}>
                <HStack>
                  <Icon as={FiUsers} boxSize={8} color="emerald.700" />
                  <Heading size="xl" color="stone.900">
                    Komunitas EcoFlow
                  </Heading>
                </HStack>
                <Text fontSize="lg" color="stone.600">
                  Berbagi pengalaman, tips, dan inspirasi fermentasi eco-enzyme dari komunitas
                </Text>
              </VStack>
              <Button
                leftIcon={<FiShare2 />}
                colorScheme="green"
                size="lg"
                bg="emerald.700"
                _hover={{ bg: 'emerald.600' }}
              >
                Bagikan Batch Saya
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Stats */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          <Card>
            <CardBody textAlign="center">
              <Icon as={FiUsers} boxSize={8} color="emerald.600" mb={2} />
              <Heading size="md" color="stone.800">1,247</Heading>
              <Text fontSize="sm" color="stone.600">Anggota Aktif</Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody textAlign="center">
              <Icon as={FiShare2} boxSize={8} color="amber.600" mb={2} />
              <Heading size="md" color="stone.800">342</Heading>
              <Text fontSize="sm" color="stone.600">Batch Dibagikan</Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody textAlign="center">
              <Icon as={FiTrendingUp} boxSize={8} color="emerald.600" mb={2} />
              <Heading size="md" color="stone.800">89%</Heading>
              <Text fontSize="sm" color="stone.600">Success Rate</Text>
            </CardBody>
          </Card>
        </Grid>

        {/* Community Batches Feed */}
        <Heading size="lg" color="stone.900" mt={4}>
          Timeline Komunitas
        </Heading>

        <VStack align="stretch" spacing={4}>
          {batches.map((batch) => (
            <Card key={batch.id} borderRadius="xl" borderWidth={1} borderColor="stone.200" _hover={{ shadow: 'lg' }} transition="all 0.2s">
              <CardBody p={6}>
                <HStack align="start" spacing={4} mb={4}>
                  <Avatar name={batch.userName} size="md" bg="emerald.500" />
                  <VStack align="start" spacing={1} flex={1}>
                    <Heading size="sm" color="stone.900">
                      {batch.userName}
                    </Heading>
                    <Text fontSize="xs" color="stone.500">
                      {batch.sharedAt}
                    </Text>
                  </VStack>
                  <Badge colorScheme={batch.status === 'harvested' ? 'green' : 'yellow'} fontSize="xs" px={3} py={1}>
                    {batch.status === 'harvested' ? 'Panen Berhasil' : 'Dalam Proses'}
                  </Badge>
                </HStack>

                <VStack align="start" spacing={3}>
                  <Heading size="md" color="emerald.700">
                    {batch.batchName}
                  </Heading>

                  <HStack spacing={4} fontSize="sm" color="stone.600">
                    <Text>
                      <strong>{batch.wasteWeight} kg</strong> bahan organik
                    </Text>
                    <Text>•</Text>
                    <Text>
                      <strong>Hari {batch.daysElapsed}</strong> dari 90
                    </Text>
                  </HStack>

                  <Box bg="amber.50" p={4} borderRadius="lg" borderLeft="4px" borderColor="amber.500" w="full">
                    <Text fontSize="sm" color="stone.700" fontStyle="italic">
                      💡 {batch.tips}
                    </Text>
                  </Box>

                  <Divider />

                  <HStack spacing={4} w="full">
                    <Button
                      leftIcon={<FiHeart />}
                      variant="ghost"
                      size="sm"
                      colorScheme={likedBatches.has(batch.id) ? 'red' : 'gray'}
                      onClick={() => handleLike(batch.id)}
                    >
                      {batch.likes + (likedBatches.has(batch.id) ? 1 : 0)}
                    </Button>
                    <Button leftIcon={<FiMessageCircle />} variant="ghost" size="sm">
                      {batch.comments} Komentar
                    </Button>
                    <Button leftIcon={<FiShare2 />} variant="ghost" size="sm" ml="auto">
                      Bagikan
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
}
