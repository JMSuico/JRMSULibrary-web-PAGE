import { useEffect, useRef } from 'react';

/**
 * useAutoRefresh - A hook to automatically poll an API at a given interval.
 * It automatically pauses polling when the browser tab is hidden to save resources.
 * 
 * @param fetchFn - The function to call to fetch data (e.g., fetchMessages)
 * @param intervalMs - The polling interval in milliseconds
 */
export function useAutoRefresh(fetchFn: () => Promise<void> | void, intervalMs: number = 30000) {
  const fetchFnRef = useRef(fetchFn);
  
  // Keep the latest fetch function in a ref so the effect doesn't re-run if fetchFn identity changes
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isActive = true;

    const poll = async () => {
      if (!isActive) return;
      
      // Only fetch if the document is visible
      if (document.visibilityState === 'visible') {
        try {
          await fetchFnRef.current();
        } catch (e) {
          console.error('[AutoRefresh] Fetch failed:', e);
        }
      }
      
      // Schedule the next poll
      if (isActive) {
        timeoutId = setTimeout(poll, intervalMs);
      }
    };

    // Start polling
    timeoutId = setTimeout(poll, intervalMs);

    // Handle visibility changes (resume immediately when returning to tab if we missed an interval)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(timeoutId);
        poll(); // Fetch immediately upon returning
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
