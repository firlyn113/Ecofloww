import localforage from 'localforage';

const offlineStore = localforage.createInstance({
  name: 'ecoflow-offline',
  storeName: 'sync_queue',
});

interface OfflineEntry {
  id: string;
  type: 'fermentation_log' | 'batch_create' | 'batch_update';
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

export async function addToOfflineQueue(type: OfflineEntry['type'], data: Record<string, unknown>): Promise<void> {
  const entry: OfflineEntry = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    data,
    timestamp: Date.now(),
    retries: 0,
  };

  const queue = await getOfflineQueue();
  queue.push(entry);
  await offlineStore.setItem('queue', queue);
  console.log('[Offline Queue] Added entry:', entry.id);
}

export async function getOfflineQueue(): Promise<OfflineEntry[]> {
  const queue = await offlineStore.getItem<OfflineEntry[]>('queue');
  return queue || [];
}

export async function clearOfflineQueue(): Promise<void> {
  await offlineStore.setItem('queue', []);
  console.log('[Offline Queue] Cleared');
}

interface ApiClient {
  post: (url: string, data?: unknown) => Promise<unknown>;
  put: (url: string, data?: unknown) => Promise<unknown>;
}

export async function syncOfflineData(apiClient: ApiClient): Promise<number> {
  if (!navigator.onLine) {
    console.log('[Offline Sync] Device is offline, skipping sync');
    return 0;
  }

  const queue = await getOfflineQueue();
  if (queue.length === 0) {
    console.log('[Offline Sync] No pending entries');
    return 0;
  }

  console.log(`[Offline Sync] Starting sync for ${queue.length} entries`);
  let syncedCount = 0;
  const remainingQueue: OfflineEntry[] = [];

  for (const entry of queue) {
    try {
      switch (entry.type) {
        case 'fermentation_log':
          await apiClient.post(`/api/v1/batches/${entry.data.batch_id}/logs`, entry.data);
          break;
        case 'batch_create':
          await apiClient.post('/api/v1/batches', entry.data);
          break;
        case 'batch_update':
          await apiClient.put(`/api/v1/batches/${entry.data.id}`, entry.data);
          break;
      }
      syncedCount++;
      console.log(`[Offline Sync] Successfully synced entry: ${entry.id}`);
    } catch (error) {
      console.error(`[Offline Sync] Failed to sync entry ${entry.id}:`, error);
      entry.retries++;
      if (entry.retries < 3) {
        remainingQueue.push(entry);
      } else {
        console.warn(`[Offline Sync] Entry ${entry.id} exceeded max retries, discarding`);
      }
    }
  }

  await offlineStore.setItem('queue', remainingQueue);
  console.log(`[Offline Sync] Complete. Synced: ${syncedCount}, Remaining: ${remainingQueue.length}`);
  return syncedCount;
}

export function setupAutoSync(apiClient: ApiClient, intervalMs: number = 30000) {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', () => {
    console.log('[Offline Sync] Device back online, syncing...');
    syncOfflineData(apiClient);
  });

  setInterval(() => {
    if (navigator.onLine) {
      syncOfflineData(apiClient);
    }
  }, intervalMs);

  console.log('[Offline Sync] Auto-sync initialized');
}

export async function getOfflineQueueSize(): Promise<number> {
  const queue = await getOfflineQueue();
  return queue.length;
}
