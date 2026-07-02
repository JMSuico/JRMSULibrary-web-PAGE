import React, { useState, useCallback, useEffect } from 'react';

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

        <div className="carousel-3d-stage relative min-h-[350px] md:min-h-[450px] w-full">
          {items.map((item, idx) => {
            const pos = getPosition(idx);
            return (
              <div
                key={idx}
                className={`carousel-3d-card ${pos}`}
                style={{
                  width: pos === 'active' ? '240px' : pos === 'right' || pos === 'left' ? '180px' : '140px',
                  // Book covers are typically taller than they are wide (e.g. 2:3 or 3:4 ratio)
                  aspectRatio: '2 / 3',
                }}
                onClick={() => {
                  if (pos !== 'active') {
                    goTo(idx);
                  }
                }}
              >
                <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-gold-light/20 bg-primary">
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
    </div>
  );
};
