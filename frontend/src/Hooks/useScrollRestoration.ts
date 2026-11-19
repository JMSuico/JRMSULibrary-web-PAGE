import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import {
  readPersistedValue,
  removePersistedValue,
  writePersistedValue,
  type StorageKind,
} from '@/src/Libs/statePersistence';

export interface SavedScrollSnapshot {
  y: number;
  containerTop: number;
  containerLeft: number;
  horizontalLeft: number;
  anchorId: string | null;
}

export interface UseScrollRestorationOptions {
  storageKey: string;
  isReady?: boolean;
  containerRef?: RefObject<HTMLElement | null>;
  horizontalRef?: RefObject<HTMLElement | null>;
  anchorAttribute?: string;
  storage?: StorageKind;
  highlightDurationMs?: number;
}

export interface UseScrollRestorationResult {
  captureNow: (overrideAnchorId?: string | number | null) => void;
  restoreNow: (overrideAnchorId?: string | number | null) => void;
  clearSavedScroll: () => void;
  lastAnchorId: string | null;
  highlightedId: string | null;
  setLastAnchorId: (id: string | number | null) => void;
}

const DEFAULT_SNAPSHOT: SavedScrollSnapshot = {
  y: 0,
  containerTop: 0,
  containerLeft: 0,
  horizontalLeft: 0,
  anchorId: null,
};

const isValidSnapshot = (val: unknown): val is SavedScrollSnapshot => {
  if (typeof val !== 'object' || val === null) return false;
  const candidate = val as Record<string, unknown>;
  return (
    typeof candidate.y === 'number' &&
    typeof candidate.containerTop === 'number' &&
    typeof candidate.containerLeft === 'number' &&
    typeof candidate.horizontalLeft === 'number' &&
    (candidate.anchorId === null || typeof candidate.anchorId === 'string')
  );
};

const normalizeAnchorId = (id: string | number | null | undefined): string | null =>
  id === null || id === undefined ? null : String(id);

/**
 * Persists and restores window scroll, inner scrollable containers, horizontal carousels,
 * and last-edited/viewed element anchors across saves, route transitions, and browser refreshes.
 */
export const useScrollRestoration = ({
  storageKey,
  isReady = true,
  containerRef,
  horizontalRef,
  anchorAttribute = 'data-cache-anchor-id',
  storage = 'session',
  highlightDurationMs = 3500,
}: UseScrollRestorationOptions): UseScrollRestorationResult => {
  const fullKey = `scroll:${storageKey}`;

  const [lastAnchorId, setLastAnchorIdState] = useState<string | null>(
    () => readPersistedValue<SavedScrollSnapshot>(fullKey, DEFAULT_SNAPSHOT, storage, isValidSnapshot).anchorId,
  );
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const isReadyRef = useRef<boolean>(isReady);
  isReadyRef.current = isReady;
  const isRestoringRef = useRef<boolean>(false);
  const hasRestoredOnReadyRef = useRef<boolean>(false);
  const throttleTimerRef = useRef<number | null>(null);
  const highlightTimerRef = useRef<number | null>(null);
  const restoreTimerRef = useRef<number | null>(null);
  const restoreGenRef = useRef<number>(0);
  const lastAnchorRef = useRef<string | null>(lastAnchorId);
  lastAnchorRef.current = lastAnchorId;

  const triggerHighlight = useCallback(
    (id: string | null) => {
      if (highlightTimerRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(highlightTimerRef.current);
      }
      setHighlightedId(id);
      if (id && typeof window !== 'undefined' && highlightDurationMs > 0) {
        highlightTimerRef.current = window.setTimeout(() => {
          setHighlightedId(null);
        }, highlightDurationMs);
      }
    },
    [highlightDurationMs],
  );

  const readCurrentSnapshot = useCallback(
    (overrideAnchorId?: string | number | null): SavedScrollSnapshot => {
      const resolvedAnchor =
        overrideAnchorId !== undefined ? normalizeAnchorId(overrideAnchorId) : lastAnchorRef.current;
      return {
        y: typeof window !== 'undefined' ? Math.max(0, Math.round(window.scrollY)) : 0,
        containerTop: containerRef?.current ? Math.max(0, Math.round(containerRef.current.scrollTop)) : 0,
        containerLeft: containerRef?.current ? Math.max(0, Math.round(containerRef.current.scrollLeft)) : 0,
        horizontalLeft: horizontalRef?.current ? Math.max(0, Math.round(horizontalRef.current.scrollLeft)) : 0,
        anchorId: resolvedAnchor,
      };
    },
    [containerRef, horizontalRef],
  );

  const captureNow = useCallback(
    (overrideAnchorId?: string | number | null) => {
      if (overrideAnchorId !== undefined) {
        const nextAnchor = normalizeAnchorId(overrideAnchorId);
        lastAnchorRef.current = nextAnchor;
        setLastAnchorIdState(nextAnchor);
      }
      const snap = readCurrentSnapshot(overrideAnchorId);
      if (!isReadyRef.current && (typeof window === 'undefined' || window.scrollY === 0 || snap.containerTop === 0)) {
        const existing = readPersistedValue<SavedScrollSnapshot>(
          fullKey,
          DEFAULT_SNAPSHOT,
          storage,
          isValidSnapshot,
        );
        if ((typeof window === 'undefined' || window.scrollY === 0) && existing.y > 0) {
          snap.y = existing.y;
        }
        if (snap.containerTop === 0 && existing.containerTop > 0) {
          snap.containerTop = existing.containerTop;
        }
        if (snap.containerLeft === 0 && existing.containerLeft > 0) {
          snap.containerLeft = existing.containerLeft;
        }
        if (snap.horizontalLeft === 0 && existing.horizontalLeft > 0) {
          snap.horizontalLeft = existing.horizontalLeft;
        }
      }
      writePersistedValue<SavedScrollSnapshot>(fullKey, snap, storage);
    },
    [fullKey, readCurrentSnapshot, storage],
  );

  const setLastAnchorId = useCallback(
    (id: string | number | null) => {
      const next = normalizeAnchorId(id);
      lastAnchorRef.current = next;
      setLastAnchorIdState(next);
      captureNow(next);
      if (next) triggerHighlight(next);
    },
    [captureNow, triggerHighlight],
  );

  const applyRestoration = useCallback(
    (snap: SavedScrollSnapshot, preferAnchor: boolean) => {
      if (typeof window === 'undefined') return;
      const currentGen = ++restoreGenRef.current;
      if (restoreTimerRef.current !== null) {
        window.clearTimeout(restoreTimerRef.current);
        restoreTimerRef.current = null;
      }
      isRestoringRef.current = true;

      const attemptRestore = (remainingTries: number) => {
        if (restoreGenRef.current !== currentGen) return;

        if (horizontalRef?.current && snap.horizontalLeft > 0) {
          horizontalRef.current.scrollLeft = snap.horizontalLeft;
        }
        if (containerRef?.current) {
          if (snap.containerTop > 0) containerRef.current.scrollTop = snap.containerTop;
          if (snap.containerLeft > 0) containerRef.current.scrollLeft = snap.containerLeft;
        }

        let scrolledToAnchor = false;
        if (preferAnchor && snap.anchorId && typeof document !== 'undefined') {
          const escaped =
            typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
              ? CSS.escape(snap.anchorId)
              : snap.anchorId.replace(/"/g, '\\"');
          const el = document.querySelector(`[${anchorAttribute}="${escaped}"]`);
          if (el instanceof HTMLElement) {
            el.scrollIntoView({ behavior: 'auto', block: 'center' });
            triggerHighlight(snap.anchorId);
            scrolledToAnchor = true;
          }
        }

        if (!scrolledToAnchor && snap.y > 0) {
          window.scrollTo({ top: snap.y, left: 0, behavior: 'auto' });
        }

        const needsRetry =
          remainingTries > 0 &&
          ((preferAnchor && snap.anchorId && !scrolledToAnchor) ||
            (!scrolledToAnchor && snap.y > 0 && Math.abs(window.scrollY - snap.y) > 48));

        if (needsRetry) {
          restoreTimerRef.current = window.setTimeout(
            () => window.requestAnimationFrame(() => attemptRestore(remainingTries - 1)),
            60,
          );
        } else {
          restoreTimerRef.current = window.setTimeout(() => {
            if (restoreGenRef.current === currentGen) {
              isRestoringRef.current = false;
              restoreTimerRef.current = null;
            }
          }, 180);
        }
      };

      window.requestAnimationFrame(() => attemptRestore(8));
    },
    [anchorAttribute, containerRef, horizontalRef, triggerHighlight],
  );

  const restoreNow = useCallback(
    (overrideAnchorId?: string | number | null) => {
      const saved = readPersistedValue<SavedScrollSnapshot>(
        fullKey,
        DEFAULT_SNAPSHOT,
        storage,
        isValidSnapshot,
      );
      const effectiveAnchor =
        overrideAnchorId !== undefined ? normalizeAnchorId(overrideAnchorId) : saved.anchorId;
      if (effectiveAnchor) {
        lastAnchorRef.current = effectiveAnchor;
        setLastAnchorIdState(effectiveAnchor);
      }
      applyRestoration(
        {
          ...saved,
          anchorId: effectiveAnchor,
        },
        Boolean(effectiveAnchor),
      );
    },
    [applyRestoration, fullKey, storage],
  );

  const clearSavedScroll = useCallback(() => {
    lastAnchorRef.current = null;
    setLastAnchorIdState(null);
    setHighlightedId(null);
    removePersistedValue(fullKey, storage);
  }, [fullKey, storage]);

  // Restore once async data for the page becomes ready; re-arm if loading state returns
  useEffect(() => {
    if (!isReady) {
      hasRestoredOnReadyRef.current = false;
      return;
    }
    if (hasRestoredOnReadyRef.current) return;
    hasRestoredOnReadyRef.current = true;
    const saved = readPersistedValue<SavedScrollSnapshot>(
      fullKey,
      DEFAULT_SNAPSHOT,
      storage,
      isValidSnapshot,
    );
    if (saved.y > 0 || saved.containerTop > 0 || saved.horizontalLeft > 0 || saved.anchorId) {
      applyRestoration(saved, Boolean(saved.anchorId));
    }
  }, [applyRestoration, fullKey, isReady, storage]);

  // Reset restoration gate when storageKey changes (e.g. tab switch)
  useEffect(() => {
    hasRestoredOnReadyRef.current = false;
  }, [fullKey]);

  // Throttled scroll tracking; never clobbers non-zero saved offsets while loading or mid-restoration
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scheduleCapture = () => {
      if (!isReadyRef.current || isRestoringRef.current) return;
      if (throttleTimerRef.current !== null) return;
      throttleTimerRef.current = window.setTimeout(() => {
        throttleTimerRef.current = null;
        if (!isRestoringRef.current && isReadyRef.current) {
          captureNow();
        }
      }, 120);
    };

    const handlePageHide = () => {
      if (isReadyRef.current && !isRestoringRef.current) {
        captureNow();
      }
    };

    window.addEventListener('scroll', scheduleCapture, { passive: true });
    window.addEventListener('pagehide', handlePageHide);
    const containerEl = containerRef?.current;
    const horizontalEl = horizontalRef?.current;
    containerEl?.addEventListener('scroll', scheduleCapture, { passive: true });
    horizontalEl?.addEventListener('scroll', scheduleCapture, { passive: true });

    return () => {
      if (throttleTimerRef.current !== null) {
        window.clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
      if (isReadyRef.current && !isRestoringRef.current) {
        captureNow();
      }
      window.removeEventListener('scroll', scheduleCapture);
      window.removeEventListener('pagehide', handlePageHide);
      containerEl?.removeEventListener('scroll', scheduleCapture);
      horizontalEl?.removeEventListener('scroll', scheduleCapture);
    };
  }, [captureNow, containerRef, horizontalRef, isReady]);

  useEffect(
    () => () => {
      if (highlightTimerRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(highlightTimerRef.current);
      }
      if (restoreTimerRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(restoreTimerRef.current);
      }
    },
    [],
  );

  return {
    captureNow,
    restoreNow,
    clearSavedScroll,
    lastAnchorId,
    highlightedId,
    setLastAnchorId,
  };
};
