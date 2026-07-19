import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface CarouselItem {
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

interface BookCarouselProps {
  items: CarouselItem[];
  autoSlide?: boolean;
  autoSlideInterval?: number;
}

export const BookCarousel: React.FC<BookCarouselProps> = ({ 
  items, 
  autoSlide = true, 
  autoSlideInterval = 5000 
}) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [expandedItem, setExpandedItem] = useState<CarouselItem | null>(null);

  const goTo = useCallback((idx: number) => {
    const len = items.length;
    const wrapped = ((idx % len) + len) % len;
    setActiveIdx(wrapped);
  }, [items.length]);

  const prev = useCallback(() => goTo(activeIdx - 1), [goTo, activeIdx]);
  const next = useCallback(() => goTo(activeIdx + 1), [goTo, activeIdx]);

  useEffect(() => {
    if (!autoSlide || items.length <= 1) return;
    const id = setInterval(next, autoSlideInterval);
    return () => clearInterval(id);
  }, [next, autoSlide, autoSlideInterval, items.length]);

  const getPosition = (idx: number): 'active' | 'right' | 'left' | 'far-right' | 'far-left' | 'hidden' => {
    const len = items.length;
    const diff = ((idx - activeIdx) % len + len) % len;
    if (diff === 0) return 'active';
    if (diff === 1) return 'right';
    if (diff === len - 1) return 'left';
    if (diff === 2) return 'far-right';
    if (diff === len - 2) return 'far-left';
    return 'hidden';
  };

  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    setTouchStart(clientX);
  };

  const handleDragEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStart === null) return;
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const diff = touchStart - clientX;
    
    if (Math.abs(diff) > 40) {
      if (diff > 0) next();
      else prev();
    }
    setTouchStart(null);
  };

  if (items.length === 0) return null;

  const activeItem = items[activeIdx];

  return (
    <div className="w-full">
      <div className="relative w-full max-w-5xl mx-auto flex items-center justify-center">
        {/* Nav Left */}
        {items.length > 1 && (
          <button 
            className="carousel-nav-btn absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-50" 
            onClick={prev} 
            aria-label="Previous book"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
        )}

        <div 
          className="carousel-3d-stage relative min-h-[500px] md:min-h-[600px] w-full"
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          style={{ cursor: 'grab' }}
        >
          {items.map((item, idx) => {
            const pos = getPosition(idx);
            return (
              <div
                key={idx}
                className={`carousel-3d-card ${pos}`}
                style={{
                  width: pos === 'active' ? '100%' : pos === 'right' || pos === 'left' ? '85%' : '70%',
                  maxWidth: pos === 'active' ? '500px' : pos === 'right' || pos === 'left' ? '400px' : '300px',
                  // Book covers are typically taller than they are wide
                  aspectRatio: '3 / 4',
                }}
                onClick={() => {
                  if (pos !== 'active') {
                    goTo(idx);
                  } else {
                    setExpandedItem(item);
                  }
                }}
              >
                <div className={`w-full h-full rounded-xl overflow-hidden shadow-2xl border border-gold-light/20 bg-primary relative ${pos === 'active' ? 'cursor-zoom-in' : ''}`}>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover block"
                      loading="lazy"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-navy-mid">
                      <span className="material-symbols-outlined text-6xl text-gold-light opacity-50">
                        {item.icon || 'book'}
                      </span>
                    </div>
                  )}
                  {pos === 'active' && (
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-6 opacity-0 hover:opacity-100 transition-opacity cursor-zoom-in"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedItem(item);
                      }}
                    >
                      <span className="text-white font-medium flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm shadow-lg border border-white/20">
                        <span className="material-symbols-outlined text-sm">fullscreen</span>
                        Click to expand
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Nav Right */}
        {items.length > 1 && (
          <button 
            className="carousel-nav-btn absolute right-0 md:right-2 top-1/2 -translate-y-1/2 z-50" 
            onClick={next} 
            aria-label="Next book"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8 relative z-40">
        {items.map((_, idx) => (
          <button
            key={idx}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              idx === activeIdx ? 'bg-gold-light w-6' : 'bg-primary/20 hover:bg-primary/40'
            }`}
            onClick={() => goTo(idx)}
            aria-label={`Go to book ${idx + 1}`}
          />
        ))}
      </div>

      {/* Text displayed outside the carousel */}
      <div className="text-center mt-8 relative z-40 max-w-2xl mx-auto px-4">
        <h3 className="font-headline-md font-bold text-2xl text-primary mb-2">
          {activeItem.title}
        </h3>
        <p className="text-primary/70 text-sm leading-relaxed">
          {activeItem.description}
        </p>
      </div>

      {/* Floating Modal for Picture Expansion */}
      {expandedItem && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 z-[9999] animate-modal-overlay" 
          onClick={() => setExpandedItem(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-gold-light transition-colors z-[210] cursor-pointer"
            onClick={() => setExpandedItem(null)}
            aria-label="Close enlarged view"
          >
            <span className="material-symbols-outlined text-4xl">close</span>
          </button>
          <div className="flex flex-col items-center animate-modal-card" onClick={(e) => e.stopPropagation()}>
            {expandedItem.image ? (
              <img 
                src={expandedItem.image} 
                alt={expandedItem.title} 
                className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" 
              />
            ) : expandedItem.icon ? (
              <span className="material-symbols-outlined text-[120px] text-white/50 mb-6 block w-full text-center">{expandedItem.icon}</span>
            ) : null}
            <div className="text-center mt-6">
              <p className="text-white font-headline-md font-bold text-2xl tracking-wide drop-shadow-md">
                {expandedItem.title}
              </p>
              {expandedItem.description && (
                <p className="text-white/80 text-lg mt-2 drop-shadow-md">
                  {expandedItem.description}
                </p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
