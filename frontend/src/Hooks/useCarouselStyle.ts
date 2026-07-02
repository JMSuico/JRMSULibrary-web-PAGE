import { useState, useEffect } from 'react';
import { settingsApi } from '@/src/Endpoints/settingsApi';

const CACHE_KEY = 'jrmsu_carousel_style_cache';

/**
 * useCarouselStyle
 * Fetches the carousel_style setting from the backend and caches it in localStorage.
 * Returns 'default' (3D) or 'classic' (horizontal flat).
 */
export function useCarouselStyle(): 'default' | 'classic' {
  const [style, setStyle] = useState<'default' | 'classic'>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    return (cached === 'classic' || cached === 'default') ? cached : 'default';
  });

  useEffect(() => {
    settingsApi.getSettings()
      .then(data => {
        if (data?.carousel_style === 'classic' || data?.carousel_style === 'default') {
          setStyle(data.carousel_style);
          localStorage.setItem(CACHE_KEY, data.carousel_style);
        }
      })
      .catch(() => { /* fallback to cached or default silently */ });
  }, []);

  return style;
}
