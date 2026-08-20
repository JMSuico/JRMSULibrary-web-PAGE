import { useEffect } from 'react';
import { initDomObfuscator, obfuscateSubtree } from '@/src/Libs/domObfuscator';

/**
 * Global lifecycle listener for DOM element encoding, atomic class obfuscation,
 * and DevTools security.
 * Allows inspection of the DOM so auditors/users see obfuscated Meta/StyleX atomic tokens
 * and custom style variables rather than project internals.
 */
export const useDevToolsProtection = () => {
  useEffect(() => {
    // 1. Initialize DOM Element Encoding & Atomic Class Obfuscation
    initDomObfuscator();

    // Re-run on layout events
    const handleLayoutChange = () => {
      obfuscateSubtree(document.body);
    };

    window.addEventListener('popstate', handleLayoutChange);
    window.addEventListener('resize', handleLayoutChange);

    // 2. Protect Page Source Saving (Ctrl+S / Cmd+S) and block DevTools shortcuts.
    //    Also blocks F12, Ctrl+Shift+I (Elements), Ctrl+Shift+J (Console), Ctrl+U (View Source).
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+S / Cmd+S (Prevent full page source saving)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
      }
      // Block F12 (Opens DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
      }
      // Block Ctrl+Shift+I (Elements / DevTools panel)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
      }
      // Block Ctrl+Shift+J (Console panel)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
      }
      // Block Ctrl+U (View Page Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
      }
    };

    // 3. Block Right-Click Context Menu (prevents casual "Inspect Element" access)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Attach listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleLayoutChange);
      window.removeEventListener('resize', handleLayoutChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);
};
