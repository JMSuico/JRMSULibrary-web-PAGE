import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

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
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ClassicCarouselItem | null>(null);

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
    setIsMouseDown(true);
    setHasDragged(false);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
    trackRef.current.style.cursor = 'grabbing';
    trackRef.current.style.scrollSnapType = 'none'; // disable snap while dragging
  };

  const onMouseLeave = () => {
    setIsMouseDown(false);
    if (trackRef.current) {
      trackRef.current.style.cursor = 'grab';
      trackRef.current.style.scrollSnapType = 'x mandatory';
    }
  };

  const onMouseUp = () => {
    setIsMouseDown(false);
    if (trackRef.current) {
      trackRef.current.style.cursor = 'grab';
      trackRef.current.style.scrollSnapType = 'x mandatory';
    }
    // Allow onClick to read the state before resetting
    setTimeout(() => setHasDragged(false), 50);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    trackRef.current.scrollLeft = scrollLeft - walk;
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
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-navy hover:bg-navy hover:text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100"
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
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch'
        }}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      >
        {items.map((item, i) => {
          const imgSrc = item.image || item.src;
          const title = item.title || item.label || `Item ${i + 1}`;

          return (
            <div
              key={i}
              onClick={() => {
                if (!hasDragged) {
                  if (onCardClick) onCardClick(item, i);
                  else setSelectedItem(item);
                }
              }}
              className="shrink-0 w-[220px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all bg-white group/card cursor-pointer"
              style={{ scrollSnapAlign: 'start' }}
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
                  <div className="w-full h-full bg-gradient-to-br from-navy/10 to-navy/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-navy/50">
                      {item.icon || 'book'}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-bold text-navy leading-tight line-clamp-2">{title}</p>
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
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-navy hover:bg-navy hover:text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Floating Modal for Picture Expansion */}
      {selectedItem && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 z-[9999] animate-modal-overlay" 
          onClick={() => setSelectedItem(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-gold-light transition-colors cursor-pointer z-50"
            onClick={() => setSelectedItem(null)}
            aria-label="Close enlarged view"
          >
            <X size={40} />
          </button>
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-4xl w-full text-center flex flex-col items-center animate-modal-card overflow-y-auto max-h-[90vh]" 
            onClick={(e) => e.stopPropagation()}
          >
            {(selectedItem.image || selectedItem.src) ? (
              <div className="w-full max-h-[60vh] rounded-xl overflow-hidden shadow-lg mx-auto flex items-center justify-center bg-gray-50 border border-gray-200 relative group">
                <img 
                  src={selectedItem.image || selectedItem.src} 
                  alt={selectedItem.title || selectedItem.label} 
                  className="max-w-full max-h-[60vh] object-contain transition-transform duration-500 hover:scale-105 cursor-zoom-in" 
                  onClick={() => window.open(selectedItem.image || selectedItem.src, '_blank')}
                  title="Click to view full screen"
                />
              </div>
            ) : selectedItem.icon ? (
              <span className="material-symbols-outlined text-[120px] text-navy/40 mb-6 block w-full">{selectedItem.icon}</span>
            ) : null}
            
            {(selectedItem.title || selectedItem.label) && (
              <h3 className="font-headline-lg font-bold text-2xl sm:text-3xl text-navy mt-8 mb-4">
                {selectedItem.title || selectedItem.label}
              </h3>
            )}
            {selectedItem.description && (
              <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                {selectedItem.description}
              </p>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
