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
export function useGlobalAutoRefresh(intervalMs: number = 10000, onlyOnReconnect: boolean = false) {
  const initialTimestampRef = useRef<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isActive = true;
    let wasDisconnected = false;
    let ws: WebSocket | null = null;
    let isWsConnected = false;

    // --- 1. Instant Real-Time WebSocket Logic ---
    const connectWs = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/admin/`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[GlobalAutoRefresh] WebSocket connected! Instant updates active.');
        isWsConnected = true;
        
        // If we were previously disconnected, trigger a refresh immediately upon reconnecting!
        if (wasDisconnected) {
          console.log('[GlobalAutoRefresh] Server is back online (WS)! Silently refreshing data...');
          wasDisconnected = false;
          window.dispatchEvent(new CustomEvent('cms_updated'));
        }
      };

      ws.onmessage = (event) => {
        if (!isActive) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'admin_update') {
            // Instant 0-delay notification for UI components to silently fetch new data!
            console.log('[GlobalAutoRefresh] Instant update event received via WS, dispatching cms_updated...');
            window.dispatchEvent(new CustomEvent('cms_updated'));
          }
        } catch (e) {
          console.error('[GlobalAutoRefresh] WS parse error:', e);
        }
      };

      ws.onclose = () => {
        console.log('[GlobalAutoRefresh] WebSocket disconnected, falling back to HTTP polling.');
        isWsConnected = false;
        wasDisconnected = true; // Mark as disconnected so we refresh when it comes back
        if (isActive) setTimeout(connectWs, 2000); // Fast 2-second reconnect attempts
      };
      
      ws.onerror = () => ws?.close();
    };

    connectWs();

    // --- 2. Fallback HTTP Polling Logic (Low frequency to save battery) ---
    const checkUpdate = async () => {
      if (!isActive) return;

      // Only check HTTP if WS is broken AND document is visible to save battery/network
      if (!isWsConnected && document.visibilityState === 'visible') {
        try {
          const res = await apiClient('/settings/last_update/');
          if (res) {
            // Check for literal connection drop recovery
            if (wasDisconnected) {
              console.log('[GlobalAutoRefresh] Server is back online! Silently refreshing data...');
              wasDisconnected = false;
              window.dispatchEvent(new CustomEvent('cms_updated'));
            }

            // Check for CMS content updates
            if (res.last_updated) {
              if (!initialTimestampRef.current) {
                initialTimestampRef.current = res.last_updated;
              } else if (initialTimestampRef.current !== res.last_updated && !onlyOnReconnect) {
                console.log('[GlobalAutoRefresh] New data detected via HTTP! Dispatching cms_updated...');
                initialTimestampRef.current = res.last_updated;
                window.dispatchEvent(new CustomEvent('cms_updated'));
              }
            }
          }
        } catch (e) {
          console.warn('[GlobalAutoRefresh] Server appears offline or unreachable:', e);
          wasDisconnected = true;
        }
      }

      if (isActive) timeoutId = setTimeout(checkUpdate, intervalMs);
    };

    timeoutId = setTimeout(checkUpdate, intervalMs);

    // Handle visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isWsConnected) {
        clearTimeout(timeoutId);
        checkUpdate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (ws) ws.close();
    };
  }, [intervalMs, onlyOnReconnect]);
}
