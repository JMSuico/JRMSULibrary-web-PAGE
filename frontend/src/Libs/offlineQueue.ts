/**
 * JRMSU Library System — Offline Request Queue & Resilient Sync
 * Caches student contact inquiries and feedback submissions when campus Wi-Fi drops,
 * and automatically replays them once connectivity is restored.
 */

export interface QueuedRequest {
  id: string;
  endpoint: string;
  method: string;
  body: string | null;
  label: string;
  createdAt: number;
  retryCount: number;
}

const STORAGE_KEY = 'jrmsu_offline_queue_v1';
const MAX_RETRIES = 5;

export const offlineQueue = {
  getQueue: (): QueuedRequest[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveQueue: (queue: QueuedRequest[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to persist offline queue to localStorage', e);
    }
  },

  enqueue: (endpoint: string, options: RequestInit = {}, label: string = 'Form Submission'): QueuedRequest => {
    const queue = offlineQueue.getQueue();
    const item: QueuedRequest = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      endpoint,
      method: options.method || 'POST',
      body: typeof options.body === 'string' ? options.body : null,
      label,
      createdAt: Date.now(),
      retryCount: 0,
    };

    queue.push(item);
    offlineQueue.saveQueue(queue);

    window.dispatchEvent(new CustomEvent('offline_request_queued', {
      detail: { item, queueSize: queue.length }
    }));

    return item;
  },

  remove: (id: string) => {
    const queue = offlineQueue.getQueue().filter(q => q.id !== id);
    offlineQueue.saveQueue(queue);
  },

  /**
   * Replays all queued requests sequentially
   */
  processQueue: async (): Promise<number> => {
    if (!navigator.onLine) return 0;

    const queue = offlineQueue.getQueue();
    if (queue.length === 0) return 0;

    let syncedCount = 0;
    const remaining: QueuedRequest[] = [];

    for (const item of queue) {
      try {
        const res = await fetch(item.endpoint.startsWith('http') ? item.endpoint : `/api${item.endpoint}`, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: item.body,
          credentials: 'include',
        });

        if (res.ok) {
          syncedCount++;
          window.dispatchEvent(new CustomEvent('offline_request_synced', {
            detail: { item }
          }));
        } else if (res.status >= 400 && res.status < 500) {
          // Client error (validation), drop from queue to avoid infinite retry loop
          console.warn(`Dropped malformed queued request ${item.id} with status ${res.status}`);
        } else {
          // Server error 5xx, keep with backoff
          item.retryCount++;
          if (item.retryCount < MAX_RETRIES) {
            remaining.push(item);
          }
        }
      } catch (err) {
        // Network still unreachable
        item.retryCount++;
        if (item.retryCount < MAX_RETRIES) {
          remaining.push(item);
        }
      }
    }

    offlineQueue.saveQueue(remaining);
    return syncedCount;
  },

  /**
   * Initializes network reconnection listeners and periodic sync timer
   */
  initAutoSync: () => {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      offlineQueue.processQueue().then(count => {
        if (count > 0) {
          console.log(`[OfflineQueue] Successfully synced ${count} queued requests`);
        }
      });
    });

    // Check every 45 seconds if queue has items
    setInterval(() => {
      if (navigator.onLine && offlineQueue.getQueue().length > 0) {
        offlineQueue.processQueue();
      }
    }, 45000);
  },
};

// Start background listener
if (typeof window !== 'undefined') {
  offlineQueue.initAutoSync();
}
