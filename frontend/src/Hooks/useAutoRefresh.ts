import { useEffect, useRef } from 'react';

/**
 * useAutoRefresh - A hook to automatically poll an API at a given interval,
 * but primarily uses WebSockets for real-time updates.
 * 
 * @param fetchFn - The function to call to fetch data
 * @param intervalMs - The fallback polling interval (if WS fails)
 */
export function useAutoRefresh(fetchFn: () => Promise<void> | void, intervalMs: number = 30000) {
  const fetchFnRef = useRef(fetchFn);
  
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    // We deprecated the individual WebSockets and interval polling here!
    // Now, we rely entirely on the central useGlobalAutoRefresh hook which maintains 
    // a single WebSocket connection and emits the 'cms_updated' event.
    // This stops 8+ duplicate WebSockets from spawning and causing UI flickering.
    const handleUpdate = () => {
      fetchFnRef.current();
    };
    window.addEventListener('cms_updated', handleUpdate);
    return () => window.removeEventListener('cms_updated', handleUpdate);
  }, []);
}
