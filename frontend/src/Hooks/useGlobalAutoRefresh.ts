import { useEffect, useRef } from 'react';
import { apiClient } from '@/src/Libs/apiClient';

/**
 * useGlobalAutoRefresh - A hook to automatically poll for global site updates and server status.
 * If the site settings timestamp changes, it triggers a page reload.
 * If the server goes offline and comes back online, it triggers a page reload.
 * 
 * @param intervalMs - The polling interval in milliseconds (default: 2 seconds)
 * @param onlyOnReconnect - If true, ignores CMS timestamp changes and only reloads on server reconnect
 */
export function useGlobalAutoRefresh(intervalMs: number = 2000, onlyOnReconnect: boolean = false) {
  const initialTimestampRef = useRef<string | null>(null);
  const initialBootIdRef = useRef<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isActive = true;
    let wasDisconnected = false;

    const checkUpdate = async () => {
      if (!isActive) return;

      // Only check if document is visible to save battery/network
      if (document.visibilityState === 'visible') {
        try {
          const res = await apiClient('/settings/last_update/');
          if (res) {
            // 1. Check for literal connection drop recovery
            if (wasDisconnected) {
              console.log('[AutoRefresh] Server is back online! Reloading page...');
              window.location.reload();
              return;
            }

            // 2. Check if the server process itself restarted (even if we didn't catch it down)
            if (res.server_boot_id) {
              if (!initialBootIdRef.current) {
                initialBootIdRef.current = res.server_boot_id;
              } else if (initialBootIdRef.current !== res.server_boot_id) {
                console.log('[AutoRefresh] Server restart detected! Reloading page...');
                window.location.reload();
                return;
              }
            }

            // 3. Check for CMS content updates
            if (res.last_updated) {
              if (!initialTimestampRef.current) {
                // Set the baseline timestamp on first successful fetch
                initialTimestampRef.current = res.last_updated;
              } else if (initialTimestampRef.current !== res.last_updated && !onlyOnReconnect) {
                // If the timestamp changed, reload the page to get the latest UI and data
                console.log('[AutoRefresh] New data detected! Reloading page...');
                window.location.reload();
                return; // Stop polling since page is reloading
              }
            }
          }
        } catch (e) {
          console.warn('[AutoRefresh] Server appears offline or unreachable:', e);
          wasDisconnected = true;
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
