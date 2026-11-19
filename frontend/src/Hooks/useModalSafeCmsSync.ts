import { useCallback, useEffect, useRef } from 'react';

export type CmsSyncDecision = 'defer' | 'skip_echo' | 'sync';

export interface EvaluateCmsSyncActionParams {
  enabled: boolean;
  isBusy: boolean;
  lastLocalSaveAt: number;
  nowMs: number;
  selfEchoWindowMs: number;
}

/**
 * Pure decision helper determining whether an incoming CMS update should be
 * deferred (disabled or busy), skipped as a self-echo, or synchronized now.
 */
export function evaluateCmsSyncAction(params: EvaluateCmsSyncActionParams): CmsSyncDecision {
  const { enabled, isBusy, lastLocalSaveAt, nowMs, selfEchoWindowMs } = params;
  if (!enabled || isBusy) {
    return 'defer';
  }
  if (lastLocalSaveAt > 0 && nowMs - lastLocalSaveAt < selfEchoWindowMs) {
    return 'skip_echo';
  }
  return 'sync';
}

export interface UseModalSafeCmsSyncOptions {
  isBusy: boolean;
  onSync: () => Promise<unknown> | void;
  captureNow?: (overrideAnchorId?: string | number | null) => void;
  restoreNow?: (overrideAnchorId?: string | number | null) => void;
  selfEchoWindowMs?: number;
  enabled?: boolean;
}

export interface UseModalSafeCmsSyncResult {
  markLocalSave: () => void;
  triggerSync: (overrideAnchorId?: string | number | null) => Promise<void>;
}

const DEFAULT_SELF_ECHO_WINDOW_MS = 1500;

/**
 * Coordinates `cms_updated` synchronization safely around active modals/forms:
 * defers updates while `isBusy`, flushes deferred updates once idle, suppresses
 * self-triggered echo events inside `selfEchoWindowMs`, serializes overlapping
 * syncs, and preserves scroll/anchor across async revalidation.
 */
export function useModalSafeCmsSync(
  options: UseModalSafeCmsSyncOptions,
): UseModalSafeCmsSyncResult {
  const {
    isBusy,
    onSync,
    captureNow,
    restoreNow,
    selfEchoWindowMs = DEFAULT_SELF_ECHO_WINDOW_MS,
    enabled = true,
  } = options;

  const isMountedRef = useRef<boolean>(true);
  const isBusyRef = useRef<boolean>(isBusy);
  const enabledRef = useRef<boolean>(enabled);
  const selfEchoWindowMsRef = useRef<number>(selfEchoWindowMs);
  const onSyncRef = useRef(onSync);
  const captureNowRef = useRef(captureNow);
  const restoreNowRef = useRef(restoreNow);

  isBusyRef.current = isBusy;
  enabledRef.current = enabled;
  selfEchoWindowMsRef.current = selfEchoWindowMs;
  onSyncRef.current = onSync;
  captureNowRef.current = captureNow;
  restoreNowRef.current = restoreNow;

  const lastLocalSaveAtRef = useRef<number>(0);
  const pendingSyncRef = useRef<boolean>(false);
  const syncChainRef = useRef<Promise<void>>(Promise.resolve());
  const rafIdsRef = useRef<{ outer: number | null; inner: number | null }>({
    outer: null,
    inner: null,
  });

  const cancelPendingRestoreRafs = useCallback(() => {
    if (typeof cancelAnimationFrame !== 'function') {
      rafIdsRef.current.outer = null;
      rafIdsRef.current.inner = null;
      return;
    }
    if (rafIdsRef.current.outer !== null) {
      cancelAnimationFrame(rafIdsRef.current.outer);
      rafIdsRef.current.outer = null;
    }
    if (rafIdsRef.current.inner !== null) {
      cancelAnimationFrame(rafIdsRef.current.inner);
      rafIdsRef.current.inner = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cancelPendingRestoreRafs();
    };
  }, [cancelPendingRestoreRafs]);

  const scheduleRestore = useCallback(
    (overrideAnchorId?: string | number | null) => {
      if (!isMountedRef.current || !restoreNowRef.current) return;
      cancelPendingRestoreRafs();

      if (typeof requestAnimationFrame !== 'function') {
        if (isMountedRef.current) {
          restoreNowRef.current?.(overrideAnchorId);
        }
        return;
      }

      rafIdsRef.current.outer = requestAnimationFrame(() => {
        rafIdsRef.current.outer = null;
        if (!isMountedRef.current) return;
        rafIdsRef.current.inner = requestAnimationFrame(() => {
          rafIdsRef.current.inner = null;
          if (!isMountedRef.current) return;
          restoreNowRef.current?.(overrideAnchorId);
        });
      });
    },
    [cancelPendingRestoreRafs],
  );

  const markLocalSave = useCallback(() => {
    lastLocalSaveAtRef.current = Date.now();
  }, []);

  const triggerSync = useCallback(
    (overrideAnchorId?: string | number | null): Promise<void> => {
      const run = async () => {
        if (!isMountedRef.current) return;
        pendingSyncRef.current = false;
        captureNowRef.current?.(overrideAnchorId);
        await Promise.resolve(onSyncRef.current());
        if (!isMountedRef.current) return;
        scheduleRestore(overrideAnchorId);
      };

      const next = syncChainRef.current.then(run, run);
      syncChainRef.current = next.catch(() => undefined);
      return next;
    },
    [scheduleRestore],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleCmsUpdated = () => {
      const decision = evaluateCmsSyncAction({
        enabled: enabledRef.current,
        isBusy: isBusyRef.current,
        lastLocalSaveAt: lastLocalSaveAtRef.current,
        nowMs: Date.now(),
        selfEchoWindowMs: selfEchoWindowMsRef.current,
      });

      if (decision === 'defer') {
        if (enabledRef.current && isBusyRef.current) {
          pendingSyncRef.current = true;
        }
        return;
      }

      if (decision === 'skip_echo') {
        return;
      }

      pendingSyncRef.current = false;
      void triggerSync().catch(() => undefined);
    };

    window.addEventListener('cms_updated', handleCmsUpdated);
    return () => {
      window.removeEventListener('cms_updated', handleCmsUpdated);
    };
  }, [triggerSync]);

  useEffect(() => {
    if (!enabled || isBusy || !pendingSyncRef.current) return;

    const decision = evaluateCmsSyncAction({
      enabled,
      isBusy,
      lastLocalSaveAt: lastLocalSaveAtRef.current,
      nowMs: Date.now(),
      selfEchoWindowMs,
    });

    if (decision === 'sync') {
      pendingSyncRef.current = false;
      void triggerSync().catch(() => undefined);
    } else if (decision === 'skip_echo') {
      pendingSyncRef.current = false;
    }
  }, [enabled, isBusy, selfEchoWindowMs, triggerSync]);

  return {
    markLocalSave,
    triggerSync,
  };
}
