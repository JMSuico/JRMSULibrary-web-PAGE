import { useEffect } from 'react';
import { initDomObfuscator } from '@/src/Libs/domObfuscator';

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

    // 2. Protect Page Source Saving (Ctrl+S / Cmd+S)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+S / Cmd+S (Prevent full page source saving)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
      }
    };

    // Attach listeners
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};

