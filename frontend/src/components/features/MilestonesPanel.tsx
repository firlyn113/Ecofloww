'use client';

import { Box, Card, CardBody, Heading, VStack, HStack, Icon, Text, Badge } from '@chakra-ui/react';
import { FiAward, FiCheckCircle, FiLock } from 'react-icons/fi';

interface UserStats {
  total_batches?: number;
  completed_batches?: number;
  total_logs?: number;
  total_harvests?: number;
  waste_diverted_kg?: number;
}

interface MilestonesPanelProps {
  stats?: UserStats;
}

export default function MilestonesPanel({ stats = {} }: MilestonesPanelProps) {
  const {
    total_batches = 0,
    completed_batches = 0,
    total_logs = 0,
    total_harvests = 0,
    waste_diverted_kg = 0,
  } = stats;

  const milestones = [
    {
      title: 'Batch Pertama Dibuat',
      description: 'Anda telah memulai perjalanan eco-enzyme Anda.',
      isUnlocked: total_batches >= 1,
    },
    {
      title: '10 Catatan Tercatat',
      description: 'Konsisten memantau perkembangan batch Anda.',
      isUnlocked: total_logs >= 10,
    },
    {
      title: 'Panen Pertama',
      description: 'Berhasil memanen eco-enzyme untuk pertama kalinya.',
      isUnlocked: total_harvests >= 1,
    },
    {
      title: '5 Batch Diselesaikan',
      description: 'Menyelesaikan 5 batch fermentasi.',
      isUnlocked: completed_batches >= 5,
    },
    {
      title: 'Juara Eco',
      description: 'Mengalihkan lebih dari 10kg sampah organik.',
      isUnlocked: waste_diverted_kg >= 10,
    },
  ];

  return (
    <Box>
      <VStack align="stretch" spacing={4}>
        <HStack spacing={3} mb={2}>
          <Icon as={FiAward} boxSize={6} color="amber.500" />
          <Heading size="md" color="stone.900">
            Pencapaian
          </Heading>
        </HStack>

        <VStack align="stretch" spacing={3}>
          {milestones.map((milestone, index) => (
            <Card
              key={index}
              borderRadius="lg"
              borderWidth={1}
              borderColor={milestone.isUnlocked ? 'emerald.200' : 'stone.200'}
              bg={milestone.isUnlocked ? 'emerald.50' : 'white'}
              opacity={milestone.isUnlocked ? 1 : 0.7}
              transition="all 0.2s"
            >
              <CardBody p={4}>
                <HStack spacing={4}>
                  <Box
                    p={2}
                    borderRadius="full"
                    bg={milestone.isUnlocked ? 'emerald.100' : 'stone.100'}
                    color={milestone.isUnlocked ? 'emerald.600' : 'stone.400'}
                  >
                    <Icon as={milestone.isUnlocked ? FiCheckCircle : FiLock} boxSize={5} />
                  </Box>
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontWeight="bold" color={milestone.isUnlocked ? 'emerald.900' : 'stone.700'}>
                      {milestone.title}
                    </Text>
                    <Text fontSize="sm" color={milestone.isUnlocked ? 'emerald.700' : 'stone.500'}>
                      {milestone.description}
                    </Text>
                  </VStack>
                  <Badge
                    colorScheme={milestone.isUnlocked ? 'emerald' : 'gray'}
                    variant={milestone.isUnlocked ? 'solid' : 'subtle'}
                  >
                    {milestone.isUnlocked ? 'Tercapai' : 'Terkunci'}
                  </Badge>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
}

