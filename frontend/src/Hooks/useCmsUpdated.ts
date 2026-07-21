import { useEffect } from 'react';

export function useCmsUpdated(callback: () => void) {
  useEffect(() => {
    const handleUpdate = () => {
      callback();
    };
    window.addEventListener('cms_updated', handleUpdate);
    return () => window.removeEventListener('cms_updated', handleUpdate);
  }, [callback]);
}
