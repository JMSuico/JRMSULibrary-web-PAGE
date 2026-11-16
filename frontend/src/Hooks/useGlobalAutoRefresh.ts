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
const MAX_WS_RETRIES = 6;

export function useGlobalAutoRefresh(intervalMs: number = 10000, onlyOnReconnect: boolean = false) {
  const initialTimestampRef = useRef<string | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let wsRetryTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let isActive = true;
    let wasDisconnected = false;
    let ws: WebSocket | null = null;
    let isWsConnected = false;
    let retries = 0;
    let circuitOpen = false;

    // --- 1. Instant Real-Time WebSocket Logic ---
    // NOTE: Render and Vercel free tiers do NOT support WebSockets.
    // Attempting to connect floods the network with reconnect attempts.
    // We detect cloud hostnames and skip WS entirely, relying on HTTP polling instead.
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isCloudFreeTier = hostname.includes('onrender.com') || hostname.includes('vercel.app');

    const connectWs = () => {
      if (!isActive || isCloudFreeTier || circuitOpen) return; // Skip when inactive, on cloud free tier, or circuit open
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

      if (wsRetryTimeoutId) {
        clearTimeout(wsRetryTimeoutId);
        wsRetryTimeoutId = null;
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/admin/`;

      let socket: WebSocket;
      try {
        socket = new WebSocket(wsUrl);
      } catch (e) {
        console.warn('[GlobalAutoRefresh] WebSocket initialization failed, relying on HTTP polling:', e);
        circuitOpen = true;
        return;
      }
      ws = socket;

      socket.onopen = () => {
        if (!isActive || ws !== socket) {
          socket.close();
          return;
        }
        console.log('[GlobalAutoRefresh] WebSocket connected! Instant updates active.');
        retries = 0;
        circuitOpen = false;
        isWsConnected = true;

        // If we were previously disconnected, trigger a refresh immediately upon reconnecting!
        if (wasDisconnected) {
          console.log('[GlobalAutoRefresh] Server is back online (WS)! Silently refreshing data...');
          wasDisconnected = false;
          window.dispatchEvent(new CustomEvent('cms_updated'));
        }
      };

      socket.onmessage = (event) => {
        if (!isActive || ws !== socket) return;
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

      socket.onclose = () => {
        if (ws !== socket) return;
        ws = null;
        isWsConnected = false;
        wasDisconnected = true; // Mark as disconnected so we refresh when it comes back
        if (!isActive) return;

        if (retries >= MAX_WS_RETRIES) {
          circuitOpen = true;
          console.warn('[GlobalAutoRefresh] Max WebSocket retries reached; relying on HTTP polling fallback.');
          return;
        }

        const backoffMs = Math.min(30000, 2000 * Math.pow(2, Math.min(retries, 4)));
        retries += 1;
        console.log(`[GlobalAutoRefresh] WebSocket disconnected, falling back to HTTP polling (retry ${retries}/${MAX_WS_RETRIES} in ${backoffMs}ms).`);
        wsRetryTimeoutId = setTimeout(connectWs, backoffMs);
      };

      socket.onerror = () => {
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          socket.close();
        }
      };
    };

    connectWs();


    // --- 2. Fallback HTTP Polling Logic (Low frequency + mutex against overlapping chains) ---
    let isPollInFlight = false;
    const checkUpdate = async () => {
      if (!isActive) return;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (!isPollInFlight && !isWsConnected && document.visibilityState === 'visible') {
        isPollInFlight = true;
        try {
          const res = await apiClient('/settings/last_update/');
          if (res) {
            if (wasDisconnected) {
              console.log('[GlobalAutoRefresh] Server is back online! Silently refreshing data...');
              wasDisconnected = false;
              window.dispatchEvent(new CustomEvent('cms_updated'));
            }

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
        } finally {
          isPollInFlight = false;
        }
      }

      if (isActive) timeoutId = setTimeout(checkUpdate, intervalMs);
    };

    timeoutId = setTimeout(checkUpdate, intervalMs);

    const resetWsAndPoll = (forcePoll: boolean) => {
      if (!isActive) return;
      retries = 0;
      circuitOpen = false;
      const shouldPoll = forcePoll || !isWsConnected;
      if (!isWsConnected) {
        connectWs();
      }
      if (shouldPoll) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        checkUpdate();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        resetWsAndPoll(false);
      }
    };

    const handleOnline = () => {
      resetWsAndPoll(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      isActive = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (wsRetryTimeoutId) clearTimeout(wsRetryTimeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      if (ws) {
        const socketToClose = ws;
        ws = null;
        socketToClose.onopen = null;
        socketToClose.onmessage = null;
        socketToClose.onerror = null;
        socketToClose.onclose = null;
        if (
          socketToClose.readyState === WebSocket.OPEN ||
          socketToClose.readyState === WebSocket.CONNECTING
        ) {
          socketToClose.close();
        }
      }
    };
  }, [intervalMs, onlyOnReconnect]);
}
