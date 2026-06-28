import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

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

const BookDetailModal: React.FC<{ item: CarouselItem; onClose: () => void }> = ({ item, onClose }) => createPortal(
  <div
    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    onClick={onClose}
  >
    <div
      className="relative w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-gold-light/20 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #001655, #002B7F)' }}
      onClick={(e) => e.stopPropagation()}
    >
      {item.image && (
        <img
          src={item.image}
          alt={item.title}
          className="w-24 h-24 md:w-28 md:h-28 object-contain rounded-2xl mx-auto mb-5"
        />
      )}
      {item.icon && !item.image && (
        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.15)' }}>
            <span className="material-symbols-outlined text-5xl text-gold-light">{item.icon}</span>
          </div>
        </div>
      )}
      <h3 className="font-headline-md font-bold text-2xl text-center text-gold-light mb-4">{item.title}</h3>
      <p className="text-blue-100 text-sm leading-relaxed text-center max-w-md mx-auto">{item.description}</p>
      <div className="flex justify-center mt-8">
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all cursor-pointer bg-gold-light text-primary hover:bg-gold-pale border-none"
        >
          Close
        </button>
      </div>
    </div>
  </div>,
  document.body
);

export const BlueModalCarousel: React.FC<BlueModalCarouselProps> = ({
  items,
  initialIndex = 0,
  onChange,
  autoSlide = false,
  autoSlideInterval = 5000,
}) => {
  const [activeIdx, setActiveIdx] = useState(initialIndex);
  const [selectedItem, setSelectedItem] = useState<CarouselItem | null>(null);

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
    <>
      <div className="carousel-3d-perspective w-full py-6 relative">
        <button
          className="carousel-nav-btn absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-30"
          onClick={prev}
          aria-label="Previous"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>

        <div className="carousel-3d-stage relative h-[320px] sm:h-[360px] md:h-[460px]">
          {items.map((item, idx) => {
            const pos = getPosition(idx);
            return (
              <div
                key={idx}
                className={`carousel-3d-card ${pos}`}
                style={{
                  width: pos === 'active' ? 'clamp(280px, 85vw, 460px)' : pos === 'right' || pos === 'left' ? 'clamp(220px, 60vw, 360px)' : 'clamp(180px, 40vw, 280px)',
                }}
                onClick={() => {
                  if (pos === 'active') {
                    setSelectedItem(item);
                  } else {
                    goTo(idx);
                  }
                }}
              >
                <div
                  className={`w-full h-full rounded-2xl p-8 flex flex-col items-center justify-center text-center ${
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
                      className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-xl mb-4"
                    />
                  )}
                  {item.icon && !item.image && (
                    <span className="material-symbols-outlined text-5xl md:text-6xl mb-4 text-gold-light">
                      {item.icon}
                    </span>
                  )}
                  <h3 className="font-headline-md font-bold text-lg md:text-xl mb-2 leading-tight">
                    {item.title}
                  </h3>
                  <p className={`text-xs md:text-sm leading-relaxed ${pos === 'active' ? 'text-blue-100' : 'text-white/50'}`}>
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

      {selectedItem && (
        <BookDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </>
  );
};
