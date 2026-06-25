import React, { useState, useCallback, useEffect } from 'react';

interface CarouselItem {
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

interface BlueModalCarouselProps {
  items: CarouselItem[];
  initialIndex?: number;
  onChange?: (index: number) => void;
  autoSlide?: boolean;
  autoSlideInterval?: number;
}

export const BlueModalCarousel: React.FC<BlueModalCarouselProps> = ({
  items,
  initialIndex = 0,
  onChange,
  autoSlide = false,
  autoSlideInterval = 5000,
}) => {
  const [activeIdx, setActiveIdx] = useState(initialIndex);

  const goTo = useCallback((idx: number) => {
    const len = items.length;
    const wrapped = ((idx % len) + len) % len;
    setActiveIdx(wrapped);
    onChange?.(wrapped);
  }, [items.length, onChange]);

  const prev = useCallback(() => goTo(activeIdx - 1), [goTo, activeIdx]);
  const next = useCallback(() => goTo(activeIdx + 1), [goTo, activeIdx]);

  useEffect(() => {
    if (!autoSlide || items.length <= 1) return;
    const id = setInterval(next, autoSlideInterval);
    return () => clearInterval(id);
  }, [autoSlide, autoSlideInterval, next, items.length]);

  if (items.length === 0) return null;

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

  return (
    <div className="carousel-3d-perspective w-full py-12 relative">
      <button
        className="carousel-nav-btn absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-30"
        onClick={prev}
        aria-label="Previous"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>

      <div className="carousel-3d-stage relative h-[300px] md:h-[360px]">
        {items.map((item, idx) => {
          const pos = getPosition(idx);
          return (
            <div
              key={idx}
              className={`carousel-3d-card ${pos}`}
              style={{
                width: pos === 'active' ? '280px' : pos === 'right' || pos === 'left' ? '220px' : '180px',
              }}
              onClick={() => pos !== 'active' && goTo(idx)}
            >
              <div
                className={`w-full h-full rounded-2xl p-5 flex flex-col items-center justify-center text-center ${
                  pos === 'active'
                    ? 'bg-gradient-to-br from-navy-dark to-navy-mid text-white shadow-2xl'
                    : 'bg-navy-dark/80 backdrop-blur-md text-white/70 border border-white/10'
                }`}
                style={pos === 'active' ? { boxShadow: '0 0 60px rgba(37, 99, 235, 0.35)' } : undefined}
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-xl mb-3"
                  />
                )}
                {item.icon && !item.image && (
                  <span className="material-symbols-outlined text-3xl md:text-4xl mb-3 text-gold-light">
                    {item.icon}
                  </span>
                )}
                <h3 className="font-headline-md font-bold text-sm md:text-base mb-1 leading-tight">
                  {item.title}
                </h3>
                <p className={`text-[10px] md:text-xs leading-relaxed ${pos === 'active' ? 'text-blue-100' : 'text-white/50'}`}>
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="carousel-nav-btn absolute right-0 md:right-2 top-1/2 -translate-y-1/2 z-30"
        onClick={next}
        aria-label="Next"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>

      <div className="flex justify-center gap-2 mt-6">
        {items.map((_, idx) => (
          <button
            key={idx}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              idx === activeIdx
                ? 'bg-gold-light w-6'
                : 'bg-white/40 hover:bg-white/60'
            }`}
            onClick={() => goTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
