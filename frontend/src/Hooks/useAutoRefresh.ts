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
    let timeoutId: NodeJS.Timeout;
    let isActive = true;
    let ws: WebSocket | null = null;
    let isWsConnected = false;

    // --- WebSocket Logic ---
    const connectWs = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // The Nginx proxy must forward /ws/ to the backend! Or we just hit the backend if we are using channels.
      // Wait, we didn't add /ws/ location to Nginx yet! I will assume it's directly accessible or we will update Nginx.
      const wsUrl = `${protocol}//${window.location.host}/ws/admin/`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[AutoRefresh] WebSocket connected');
        isWsConnected = true;
      };

      ws.onmessage = (event) => {
        if (!isActive) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'admin_update') {
            console.log('[AutoRefresh] Received update event, refreshing data...');
            fetchFnRef.current();
          }
        } catch (e) {
          console.error('[AutoRefresh] WS parse error:', e);
        }
      };

      ws.onclose = () => {
        console.log('[AutoRefresh] WebSocket disconnected, falling back to polling');
        isWsConnected = false;
        // Try to reconnect after 5 seconds
        if (isActive) {
          setTimeout(connectWs, 5000);
        }
      };
      
      ws.onerror = (err) => {
        console.error('[AutoRefresh] WebSocket error:', err);
        ws?.close();
      };
    };

    connectWs();

    // --- Fallback Polling Logic ---
    const poll = async () => {
      if (!isActive) return;
      
      // Only fetch if WS is NOT connected and document is visible
      if (!isWsConnected && document.visibilityState === 'visible') {
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

    timeoutId = setTimeout(poll, intervalMs);

    // Handle visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchFnRef.current(); // Fetch immediately upon returning to tab
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (ws) {
        ws.close();
      }
    };
  }, [intervalMs]);
}
