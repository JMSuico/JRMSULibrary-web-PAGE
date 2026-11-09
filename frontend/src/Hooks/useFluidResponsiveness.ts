import { useState, useEffect } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface FluidResponsiveness {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;       // < 768px
  isTablet: boolean;       // >= 768px and < 1024px
  isDesktop: boolean;      // >= 1024px
  isWide: boolean;         // >= 1440px
  isTouch: boolean;
  orientation: 'portrait' | 'landscape';
}

function getBreakpoint(width: number): Breakpoint {
  if (width < 640) return 'xs';
  if (width < 768) return 'sm';
  if (width < 1024) return 'md';
  if (width < 1280) return 'lg';
  if (width < 1536) return 'xl';
  return '2xl';
}

/**
 * GLOBAL CALLING HOOK: useFluidResponsiveness
 * Universal responsive scaling, viewport dimensions & device breakpoint detection.
 */
export function useFluidResponsiveness(): FluidResponsiveness {
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 1200, height: 800 };
    }
    return { width: window.innerWidth, height: window.innerHeight };
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { width, height } = dimensions;
  const breakpoint = getBreakpoint(width);
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isWide = width >= 1440;
  const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const orientation = width >= height ? 'landscape' : 'portrait';

  return {
    width,
    height,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    isTouch,
    orientation,
  };
}
