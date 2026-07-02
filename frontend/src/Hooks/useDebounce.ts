// [Layer: Hooks] — useDebounce.ts
// Generic debounce hook. Delays the update of a value until the user
// has stopped changing it for `delay` milliseconds.
// Usage: const debouncedSearch = useDebounce(searchQuery, 400);

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
