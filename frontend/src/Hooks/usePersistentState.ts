import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import {
  readPersistedValue,
  writePersistedValue,
  type StorageKind,
} from '@/src/Libs/statePersistence';

export interface UsePersistentStateOptions<T> {
  storage?: StorageKind;
  validate?: (value: unknown) => value is T;
  maxAgeMs?: number;
}

const resolveInitialValue = <T>(defaultValue: T | (() => T)): T =>
  typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue;

/**
 * Drop-in persistent replacement for React useState backed by sessionStorage or localStorage.
 * Preserves UI filters, active tabs, selected items, and view modes across saves, navigations, and F5 refreshes.
 */
export const usePersistentState = <T>(
  storageKey: string,
  defaultValue: T | (() => T),
  options: UsePersistentStateOptions<T> = {},
): [T, Dispatch<SetStateAction<T>>] => {
  const { storage = 'session', validate, maxAgeMs } = options;
  const fallbackRef = useRef<T>(resolveInitialValue(defaultValue));

  const [state, setState] = useState<T>(() =>
    readPersistedValue<T>(storageKey, fallbackRef.current, storage, validate, maxAgeMs),
  );

  const prevKeyRef = useRef<string>(storageKey);
  useEffect(() => {
    if (prevKeyRef.current !== storageKey) {
      prevKeyRef.current = storageKey;
      const hydrated = readPersistedValue<T>(
        storageKey,
        fallbackRef.current,
        storage,
        validate,
        maxAgeMs,
      );
      setState(hydrated);
    }
  }, [storageKey, storage, validate, maxAgeMs]);

  const setPersistedState = useCallback<Dispatch<SetStateAction<T>>>(
    (updater) => {
      setState((prev) => {
        const next =
          typeof updater === 'function'
            ? (updater as (prevState: T) => T)(prev)
            : updater;
        writePersistedValue<T>(storageKey, next, storage);
        return next;
      });
    },
    [storageKey, storage],
  );

  return [state, setPersistedState];
};
