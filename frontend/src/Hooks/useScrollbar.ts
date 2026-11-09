import { useState, useEffect } from 'react';

export interface ScrollbarState {
  scrollY: number;
  scrollX: number;
  isScrolled: boolean;
  scrollDirection: 'up' | 'down' | 'none';
  scrollPercentage: number;
  scrollToTop: (smooth?: boolean) => void;
}

/**
 * GLOBAL CALLING HOOK: useScrollbar
 * Tracks window scroll position, scroll direction, and provides scroll helpers.
 */
export function useScrollbar(threshold = 20): ScrollbarState {
  const [scrollY, setScrollY] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | 'none'>('none');
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentScrollX = window.scrollX;

      setScrollY(currentScrollY);
      setScrollX(currentScrollX);

      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }

      lastScrollY = currentScrollY;

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollPercentage(Math.min(100, Math.max(0, (currentScrollY / totalHeight) * 100)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = (smooth = true) => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  return {
    scrollY,
    scrollX,
    isScrolled: scrollY > threshold,
    scrollDirection,
    scrollPercentage,
    scrollToTop,
  };
}
