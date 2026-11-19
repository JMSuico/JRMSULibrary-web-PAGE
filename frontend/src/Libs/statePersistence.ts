import { invalidateCacheByPrefix } from './swrCache';

export type StorageKind = 'session' | 'local';

export const STATE_STORAGE_PREFIX = 'jrmsu_state:';
export const ADMIN_STATE_PREFIX = 'admin:';
export const PUBLIC_STATE_PREFIX = 'public:';

interface StoredEnvelope<T> {
  v: T;
  ts: number;
}

const getStorage = (kind: StorageKind): Storage | null => {
  if (typeof window === 'undefined') return null;
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
};

export const buildStateStorageKey = (key: string): string =>
  key.startsWith(STATE_STORAGE_PREFIX) ? key : `${STATE_STORAGE_PREFIX}${key}`;

export const readPersistedValue = <T>(
  key: string,
  fallback: T,
  kind: StorageKind = 'session',
  validate?: (value: unknown) => value is T,
  maxAgeMs?: number,
): T => {
  const storage = getStorage(kind);
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(buildStateStorageKey(key));
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'v' in parsed &&
      'ts' in parsed &&
      typeof (parsed as StoredEnvelope<unknown>).ts === 'number'
    ) {
      const envelope = parsed as StoredEnvelope<unknown>;
      if (maxAgeMs !== undefined && Date.now() - envelope.ts > maxAgeMs) {
        storage.removeItem(buildStateStorageKey(key));
        return fallback;
      }
      if (validate) {
        return validate(envelope.v) ? envelope.v : fallback;
      }
      return envelope.v as T;
    }
    return fallback;
  } catch {
    return fallback;
  }
};

export const writePersistedValue = <T>(
  key: string,
  value: T,
  kind: StorageKind = 'session',
): void => {
  const storage = getStorage(kind);
  if (!storage) return;
  try {
    const envelope: StoredEnvelope<T> = { v: value, ts: Date.now() };
    storage.setItem(buildStateStorageKey(key), JSON.stringify(envelope));
  } catch {
    // Ignore storage quota or restricted browser mode errors
  }
};

export const removePersistedValue = (
  key: string,
  kind: StorageKind = 'session',
): void => {
  const storage = getStorage(kind);
  if (!storage) return;
  try {
    storage.removeItem(buildStateStorageKey(key));
  } catch {
    // Ignore storage removal errors
  }
};

export const clearPersistedByPrefix = (
  prefix: string,
  kind: StorageKind = 'session',
): void => {
  const storage = getStorage(kind);
  if (!storage) return;
  try {
    const fullPrefix = buildStateStorageKey(prefix);
    const keysToDelete: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const candidate = storage.key(i);
      if (candidate && candidate.startsWith(fullPrefix)) {
        keysToDelete.push(candidate);
      }
    }
    keysToDelete.forEach((k) => storage.removeItem(k));
  } catch {
    // Ignore storage iteration errors
  }
};

export const clearAllAdminCaches = (): void => {
  clearPersistedByPrefix(ADMIN_STATE_PREFIX, 'session');
  clearPersistedByPrefix(ADMIN_STATE_PREFIX, 'local');
  clearPersistedByPrefix('scroll:admin:', 'session');
  clearPersistedByPrefix('scroll:admin:', 'local');
  invalidateCacheByPrefix('admin:');
};
