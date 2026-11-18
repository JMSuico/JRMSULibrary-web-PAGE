import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  fetchWithDedup,
  getCacheEntry,
  getCacheError,
  invalidateCacheByPrefix,
  isCacheInFlight,
  mutateCacheEntry,
  subscribeCacheKey,
} from '@/src/Libs/swrCache';

export interface UseCachedQueryOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  staleTimeMs?: number;       // default 60000
  persistStorage?: boolean;   // default false
  enabled?: boolean;          // default true
  listenCmsUpdate?: boolean;  // default false
}

export interface UseCachedQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;         // true ONLY when no cached data exists yet
  isRefreshing: boolean;      // true during background revalidate
  error: Error | null;
  refetch: (force?: boolean) => Promise<T | undefined>;
  mutate: (updater: T | ((prev: T | undefined) => T)) => void;
}

export { invalidateCacheByPrefix };

export const useCachedQuery = <T>(
  options: UseCachedQueryOptions<T>
): UseCachedQueryResult<T> => {
  const {
    key,
    fetcher,
    staleTimeMs = 60000,
    persistStorage = false,
    enabled = true,
    listenCmsUpdate = false,
  } = options;

  const [, forceRender] = useReducer((count: number) => count + 1, 0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const revalidate = useCallback(
    async (force: boolean = false): Promise<T | undefined> => {
      const existing = getCacheEntry<T>(key, persistStorage);
      const isFresh =
        existing !== undefined && Date.now() - existing.updatedAt < staleTimeMs;

      if (!force && isFresh) {
        return existing.data;
      }

      try {
        return await fetchWithDedup<T>(
          key,
          () => fetcherRef.current(),
          persistStorage
        );
      } catch {
        return getCacheEntry<T>(key, persistStorage)?.data;
      }
    },
    [key, persistStorage, staleTimeMs]
  );

  useEffect(() => {
    const unsubscribe = subscribeCacheKey(
      key,
      () => {
        if (isMountedRef.current) {
          forceRender();
        }
      },
      () => {
        if (isMountedRef.current && enabled) {
          void revalidate(true);
        }
      }
    );

    if (enabled) {
      void revalidate(false);
    }

    return unsubscribe;
  }, [key, enabled, revalidate]);

  useEffect(() => {
    if (!listenCmsUpdate || !enabled) return;

    const handleCmsUpdate = () => {
      void revalidate(true);
    };

    window.addEventListener('cms_updated', handleCmsUpdate);
    return () => window.removeEventListener('cms_updated', handleCmsUpdate);
  }, [listenCmsUpdate, enabled, revalidate]);

  const refetch = useCallback(
    (force: boolean = true): Promise<T | undefined> => revalidate(force),
    [revalidate]
  );

  const mutate = useCallback(
    (updater: T | ((prev: T | undefined) => T)): void => {
      mutateCacheEntry<T>(key, updater, persistStorage);
    },
    [key, persistStorage]
  );

  const entry = getCacheEntry<T>(key, persistStorage);
  const inFlight = isCacheInFlight(key);
  const error = getCacheError(key);
  const data = entry?.data;

  const isLoading = enabled && data === undefined && error === null;
  const isRefreshing = inFlight && data !== undefined;

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refetch,
    mutate,
  };
};
