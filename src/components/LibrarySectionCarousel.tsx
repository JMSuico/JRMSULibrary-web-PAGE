import React, { useState, useEffect, useCallback } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const sectionImages = [
  { src: '/assets/PHYSICAL SET-UP 2026/READING AREA.jpg', label: 'Reading Area' },
  { src: '/assets/PHYSICAL SET-UP 2026/CIRCULATION SECTION.jpg', label: 'Circulation Section' },
  { src: '/assets/PHYSICAL SET-UP 2026/REFERENCE SECTION.jpg', label: 'Reference Section' },
  { src: '/assets/PHYSICAL SET-UP 2026/RESEARCH SECTION.jpg', label: 'Research Section' },
  { src: '/assets/PHYSICAL SET-UP 2026/PERIODICAL SECTION.jpg', label: 'Periodical Section' },
  { src: '/assets/PHYSICAL SET-UP 2026/MULTIMEDIA SECTION.jpg', label: 'Multimedia Section' },
  { src: '/assets/PHYSICAL SET-UP 2026/SPECIAL COLLECTION SECTION.jpg', label: 'Special Collection Section' },
  { src: '/assets/PHYSICAL SET-UP 2026/SOCIAL LEARNING ZONE.jpg', label: 'Social Learning Zone' },
  { src: '/assets/PHYSICAL SET-UP 2026/COLLABORATIVE ZONE.jpg', label: 'Collaborative Zone' },
  { src: '/assets/PHYSICAL SET-UP 2026/READING AREA - 2ND FLOOR.jpg', label: 'Reading Area - 2nd Floor' },
  { src: '/assets/PHYSICAL SET-UP 2026/INFORMATION COUNTER.jpg', label: 'Information Counter' },
  { src: '/assets/PHYSICAL SET-UP 2026/WORKSTATION.jpg', label: 'Workstation' },
];

const FACE_COUNT = sectionImages.length;
const ANGLE_PER_FACE = 360 / FACE_COUNT;
const RADIUS = 380;

export const LibrarySectionCarousel: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [activeIdx, setActiveIdx] = useState(0);

  const goTo = useCallback((idx: number) => {
    const len = sectionImages.length;
    const wrapped = ((idx % len) + len) % len;
    setActiveIdx(wrapped);
    document.body.style.backgroundImage = `url('${sectionImages[wrapped].src}')`;
  }, []);

  const prev = useCallback(() => goTo(activeIdx - 1), [goTo, activeIdx]);
  const next = useCallback(() => goTo(activeIdx + 1), [goTo, activeIdx]);

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  useEffect(() => {
    return () => {
      document.body.style.backgroundImage = '';
    };
  }, []);

  const currentAngle = -activeIdx * ANGLE_PER_FACE;

  return (
    <section id="library-section" className={`py-section-py-desktop reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="max-w-max-width mx-auto px-4 md:px-gutter">
        <div className="text-center mb-8">
          <h2 className="font-headline-lg font-bold text-4xl mb-4" style={{ color: '#001851', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
            Library Section
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: '#001851', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            Take a visual tour of the JRMSU Katipunan Campus Library facilities and spaces.
          </p>
        </div>

        <div className="bg-primary/95 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-2xl border border-gold-light/20">
          <div className="relative">
            {/* Cube container */}
            <div className="cube-slider-perspective rounded-2xl overflow-hidden shadow-xl h-[300px] md:h-[450px]">
              <div
                className="cube-slider-stage w-full h-full"
                style={{ transform: `rotateY(${currentAngle}deg)` }}
              >
                {sectionImages.map((img, idx) => {
                  const faceAngle = idx * ANGLE_PER_FACE;
                  return (
                    <div
                      key={idx}
                      className="cube-slider-face"
                      style={{
                        transform: `rotateY(${faceAngle}deg) translateZ(${RADIUS}px)`,
                      }}
                    >
                      <img
                        src={img.src}
                        alt={img.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="absolute inset-y-0 left-0 flex items-center">
              <button
                className="carousel-nav-btn ml-3"
                onClick={prev}
                aria-label="Previous section picture"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                className="carousel-nav-btn mr-3"
                onClick={next}
                aria-label="Next section picture"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            {sectionImages.map((_, idx) => (
              <button
                key={idx}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  idx === activeIdx
                    ? 'bg-gold-light w-6'
                    : 'bg-white/40 hover:bg-white/60'
                }`}
                onClick={() => goTo(idx)}
                aria-label={`Go to ${sectionImages[idx].label}`}
              />
            ))}
          </div>

          <p className="text-center text-sm text-white/80 mt-4 font-medium">
            {sectionImages[activeIdx].label}
          </p>
        </div>
      </div>
    </section>
  );
};