import { useEffect, useRef } from 'react';
import { apiClient } from '@/src/Libs/apiClient';

/**
 * useGlobalAutoRefresh - A hook to automatically poll for global site updates.
 * If the site settings timestamp changes, it triggers a page reload.
 * 
 * @param intervalMs - The polling interval in milliseconds (default: 2 seconds)
 */
export function useGlobalAutoRefresh(intervalMs: number = 2000) {
  const initialTimestampRef = useRef<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isActive = true;

    const checkUpdate = async () => {
      if (!isActive) return;

      // Only check if document is visible to save battery/network
      if (document.visibilityState === 'visible') {
        try {
          const res = await apiClient('/settings/last_update/');
          if (res && res.last_updated) {
            if (!initialTimestampRef.current) {
              // Set the baseline timestamp on first successful fetch
              initialTimestampRef.current = res.last_updated;
            } else if (initialTimestampRef.current !== res.last_updated) {
              // If the timestamp changed, reload the page to get the latest UI and data
              console.log('[AutoRefresh] New data detected! Reloading page...');
              window.location.reload();
              return; // Stop polling since page is reloading
            }
          }
        } catch (e) {
          console.error('[AutoRefresh] Failed to check for updates:', e);
        }
      }

      if (isActive) {
        timeoutId = setTimeout(checkUpdate, intervalMs);
      }
    };

    // Start the polling cycle
    timeoutId = setTimeout(checkUpdate, intervalMs);

    // Handle visibility changes (check immediately when returning to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(timeoutId);
        checkUpdate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [intervalMs]);
}
