import { useEffect } from 'react';
import { initDomObfuscator } from '@/src/Libs/domObfuscator';

/**
 * Global lifecycle listener for DOM/runtime integrity and visitor DevTools/export protection.
 * Blocks inspection, view-source, save, print, and context menu for public visitors and
 * whenever a read-only viewer modal (`[data-readonly-viewer="true"]`) is open, while
 * preserving normal Admin usability on `/admin/*` outside read-only viewer modals.
 */
const isAdminRoutePath = (pathname: string): boolean => /^\/admin(?:\/|$)/.test(pathname);

const isGuardActive = (): boolean => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  return (
    !isAdminRoutePath(window.location.pathname) ||
    Boolean(document.querySelector('[data-readonly-viewer="true"]'))
  );
};

export const useDevToolsProtection = () => {
  useEffect(() => {
    // 1. Initialize Runtime Anti-Debugging & Security Traps
    initDomObfuscator();

    // 2. Intercept DevTools, View-Source, Save, and Print shortcuts in capture phase.
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGuardActive()) return;

      const key = e.key.toLowerCase();
      const hasPrimaryModifier = e.ctrlKey || e.metaKey;

      const isDevToolsShortcut =
        e.key === 'F12' ||
        key === 'f12' ||
        (hasPrimaryModifier && e.shiftKey && (key === 'i' || key === 'c' || key === 'j')) ||
        (e.metaKey && e.altKey && (key === 'i' || key === 'c' || key === 'j'));

      const isRestrictedAction =
        hasPrimaryModifier && (key === 'u' || key === 's' || key === 'p');

      if (isDevToolsShortcut || isRestrictedAction) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // 3. Block Right-Click Context Menu in capture phase when guard is active
    //    (prevents Inspect / Save as / Print from browser context menu).
    const handleContextMenu = (e: MouseEvent) => {
      if (!isGuardActive()) return;
      e.preventDefault();
    };

    // Attach capture-phase listeners
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('contextmenu', handleContextMenu, { capture: true });

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    };
  }, []);
};
