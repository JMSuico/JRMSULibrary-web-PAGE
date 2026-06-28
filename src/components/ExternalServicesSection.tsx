import React, { useState, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { externalServiceImages } from '../assets/data';
import { ImageGallery } from './ImageGallery';

export const ExternalServicesSection: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [expanded, setExpanded] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  // Auto-expand when scrolled into view
  useEffect(() => {
    if (isVisible && !hasAutoOpened) {
      setExpanded(true);
      setHasAutoOpened(true);
    }
  }, [isVisible, hasAutoOpened]);

  return (
    <section
      id="external-services"
      className={`py-section-py-desktop reveal ${isVisible ? 'visible' : ''}`}
      ref={ref as any}
    >
      <div className="max-w-max-width mx-auto px-4 md:px-gutter">
        <div className="rounded-3xl p-8 md:p-12 shadow-2xl border border-gold-light/20" style={{ background: 'rgba(0,24,81,0.9)', backdropFilter: 'blur(8px)' }}>
        <button
          className="w-full flex items-center justify-between p-4 bg-gold-light/30 rounded-xl hover:bg-gold-light/50 transition-all cursor-pointer"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          <span className="font-headline-md font-bold text-xl" style={{ color: '#001851', textShadow: '0 1px 4px rgba(255,255,255,0.5)' }}>
            View External Services Gallery
          </span>
          <span className={`material-symbols-outlined transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} style={{ color: '#001851' }}>
            expand_more
          </span>
        </button>

        {expanded && (
          <div className="mt-6">
            <ImageGallery images={externalServiceImages} folder="assets/Library External Services" autoSlide={true} autoSlideInterval={3000} />
          </div>
        )}
        </div>
      </div>
    </section>
  );
};
