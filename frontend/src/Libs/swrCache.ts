export interface CacheEntry<T> {
  data: T;
  updatedAt: number;
}

interface CacheListeners {
  onChange: Set<() => void>;
  onInvalidate: Set<() => void>;
}

const STORAGE_PREFIX = 'jrmsu_swr:';

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inFlightMap = new Map<string, Promise<unknown>>();
const errorMap = new Map<string, Error | null>();
const keyVersionMap = new Map<string, number>();
const listenersMap = new Map<string, CacheListeners>();

const getListeners = (key: string): CacheListeners => {
  let entry = listenersMap.get(key);
  if (!entry) {
    entry = {
      onChange: new Set<() => void>(),
      onInvalidate: new Set<() => void>(),
    };
    listenersMap.set(key, entry);
  }
  return entry;
};

const notifyChange = (key: string): void => {
  const listeners = listenersMap.get(key);
  if (!listeners) return;
  listeners.onChange.forEach((listener) => listener());
};

const notifyInvalidate = (key: string): void => {
  const listeners = listenersMap.get(key);
  if (!listeners) return;
  listeners.onInvalidate.forEach((listener) => listener());
};

const readStorageEntry = <T>(key: string): CacheEntry<T> | undefined => {
  if (typeof window === 'undefined' || !window.localStorage) return undefined;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return undefined;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'data' in parsed &&
      'updatedAt' in parsed &&
      typeof (parsed as { updatedAt: unknown }).updatedAt === 'number'
    ) {
      return parsed as CacheEntry<T>;
    }
    return undefined;
  } catch {
    return undefined;
  }
};

const writeStorageEntry = <T>(key: string, entry: CacheEntry<T>): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    // Ignore storage quota or privacy-mode errors
  }
};

const removeStorageEntry = (key: string): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch {
    // Ignore storage removal errors
  }
};

export const getCacheEntry = <T>(
  key: string,
  persistStorage: boolean = false
): CacheEntry<T> | undefined => {
  const memEntry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (memEntry) return memEntry;

  if (persistStorage) {
    const stored = readStorageEntry<T>(key);
    if (stored) {
      memoryCache.set(key, stored as CacheEntry<unknown>);
      return stored;
    }
  }
  return undefined;
};

export const setCacheEntry = <T>(
  key: string,
  data: T,
  persistStorage: boolean = false
): CacheEntry<T> => {
  const entry: CacheEntry<T> = {
    data,
    updatedAt: Date.now(),
  };
  memoryCache.set(key, entry as CacheEntry<unknown>);
  errorMap.set(key, null);
  if (persistStorage) {
    writeStorageEntry(key, entry);
  }
  notifyChange(key);
  return entry;
};

export const mutateCacheEntry = <T>(
  key: string,
  updater: T | ((prev: T | undefined) => T),
  persistStorage: boolean = false
): T => {
  const existing = getCacheEntry<T>(key, persistStorage);
  const nextData =
    typeof updater === 'function'
      ? (updater as (prev: T | undefined) => T)(existing?.data)
      : updater;
  setCacheEntry(key, nextData, persistStorage);
  return nextData;
};

export const fetchWithDedup = <T>(
  key: string,
  fetcher: () => Promise<T>,
  persistStorage: boolean = false
): Promise<T> => {
  const active = inFlightMap.get(key) as Promise<T> | undefined;
  if (active) return active;

  const requestVersion = keyVersionMap.get(key) ?? 0;

  const promise = Promise.resolve()
    .then(() => fetcher())
    .then((data) => {
      if ((keyVersionMap.get(key) ?? 0) === requestVersion) {
        setCacheEntry(key, data, persistStorage);
      }
      return data;
    })
    .catch((err: unknown) => {
      const normalizedError =
        err instanceof Error ? err : new Error(String(err || 'Request failed'));
      if ((keyVersionMap.get(key) ?? 0) === requestVersion) {
        errorMap.set(key, normalizedError);
        notifyChange(key);
      }
      throw normalizedError;
    })
    .finally(() => {
      if (inFlightMap.get(key) === promise) {
        inFlightMap.delete(key);
        notifyChange(key);
      }
    });

  inFlightMap.set(key, promise as Promise<unknown>);
  notifyChange(key);
  return promise;
};

export const isCacheInFlight = (key: string): boolean => inFlightMap.has(key);

export const getCacheError = (key: string): Error | null => errorMap.get(key) ?? null;

export const subscribeCacheKey = (
  key: string,
  onChange: () => void,
  onInvalidate: () => void
): (() => void) => {
  const listeners = getListeners(key);
  listeners.onChange.add(onChange);
  listeners.onInvalidate.add(onInvalidate);

  return () => {
    const current = listenersMap.get(key);
    if (!current) return;
    current.onChange.delete(onChange);
    current.onInvalidate.delete(onInvalidate);
    if (current.onChange.size === 0 && current.onInvalidate.size === 0) {
      listenersMap.delete(key);
    }
  };
};

const collectMatchingKeys = (prefix: string): Set<string> => {
  const matchedKeys = new Set<string>();

  memoryCache.forEach((_, key) => {
    if (key.startsWith(prefix)) matchedKeys.add(key);
  });
  inFlightMap.forEach((_, key) => {
    if (key.startsWith(prefix)) matchedKeys.add(key);
  });
  errorMap.forEach((_, key) => {
    if (key.startsWith(prefix)) matchedKeys.add(key);
  });
  listenersMap.forEach((_, key) => {
    if (key.startsWith(prefix)) matchedKeys.add(key);
  });

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const fullPrefix = `${STORAGE_PREFIX}${prefix}`;
      for (let i = 0; i < window.localStorage.length; i++) {
        const storageKey = window.localStorage.key(i);
        if (storageKey && storageKey.startsWith(fullPrefix)) {
          matchedKeys.add(storageKey.slice(STORAGE_PREFIX.length));
        }
      }
    } catch {
      // Ignore storage scan errors
    }
  }

  return matchedKeys;
};

export const invalidateCacheByPrefix = (prefix: string): void => {
  const matchedKeys = collectMatchingKeys(prefix);

  matchedKeys.forEach((key) => {
    keyVersionMap.set(key, (keyVersionMap.get(key) ?? 0) + 1);
    memoryCache.delete(key);
    inFlightMap.delete(key);
    errorMap.delete(key);
    removeStorageEntry(key);
    notifyChange(key);
    notifyInvalidate(key);
  });
};

/**
 * Marks cached entries matching `prefix` as stale (updatedAt: 0) without deleting cached data,
 * then notifies active query subscribers to background-revalidate cleanly without DOM collapse.
 */
export const revalidateCacheByPrefix = (prefix: string): void => {
  const matchedKeys = collectMatchingKeys(prefix);

  matchedKeys.forEach((key) => {
    keyVersionMap.set(key, (keyVersionMap.get(key) ?? 0) + 1);
    inFlightMap.delete(key);
    errorMap.delete(key);

    const memEntry = memoryCache.get(key);
    if (memEntry) {
      memoryCache.set(key, {
        data: memEntry.data,
        updatedAt: 0,
      });
    }

    const storedEntry = readStorageEntry<unknown>(key);
    if (storedEntry) {
      writeStorageEntry(key, {
        data: storedEntry.data,
        updatedAt: 0,
      });
    }

    notifyInvalidate(key);
  });
};
