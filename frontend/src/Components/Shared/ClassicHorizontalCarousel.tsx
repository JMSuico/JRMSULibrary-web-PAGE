import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ClassicCarouselItem {
  title?: string;
  description?: string;
  image?: string;
  icon?: string;
  src?: string;    // for physical setup images
  label?: string;  // for physical setup images
}

interface Props {
  items: ClassicCarouselItem[];
  onCardClick?: (item: ClassicCarouselItem, index: number) => void;
}

export const ClassicHorizontalCarousel: React.FC<Props> = ({ items, onCardClick }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const CARD_WIDTH = 240; // px including gap
  const CARD_GAP = 16;

  const updateScrollState = useCallback(() => {
    if (!trackRef.current) return;
    const { scrollLeft: sl, scrollWidth, clientWidth } = trackRef.current;
    setCanScrollLeft(sl > 4);
    setCanScrollRight(sl < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState]);

  // ── Mouse drag-to-scroll ──────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
    trackRef.current.style.cursor = 'grabbing';
  };

  const onMouseLeave = () => {
    setIsDragging(false);
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
  };

  const onMouseUp = () => {
    setIsDragging(false);
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  // ── Touch drag-to-scroll ──────────────────────────────────────
  const touchStartX = useRef(0);
  const touchScrollLeft = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].pageX;
    touchScrollLeft.current = trackRef.current?.scrollLeft ?? 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!trackRef.current) return;
    const x = e.touches[0].pageX;
    const walk = (touchStartX.current - x) * 1.2;
    trackRef.current.scrollLeft = touchScrollLeft.current + walk;
  };

  // ── Arrow nav ─────────────────────────────────────────────────
  const scroll = (dir: 'left' | 'right') => {
    if (!trackRef.current) return;
    const amount = (CARD_WIDTH + CARD_GAP) * 3;
    trackRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="relative group">
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-[#002B7F] hover:bg-[#002B7F] hover:text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Scrollable Track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
        style={{
          cursor: 'grab',
          userSelect: 'none',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
      >
        {items.map((item, i) => {
          const imgSrc = item.image || item.src;
          const title = item.title || item.label || `Item ${i + 1}`;

          return (
            <div
              key={i}
              onClick={() => !isDragging && onCardClick?.(item, i)}
              className="shrink-0 w-[220px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all bg-white group/card cursor-pointer"
              draggable={false}
            >
              {/* Image */}
              <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={title}
                    className="w-full h-full object-cover block transition-transform duration-500 group-hover/card:scale-110"
                    loading="lazy"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#002B7F]/10 to-[#002B7F]/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-[#002B7F]/50">
                      {item.icon || 'book'}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-bold text-[#002B7F] leading-tight line-clamp-2">{title}</p>
                {item.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-[#002B7F] hover:bg-[#002B7F] hover:text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};
