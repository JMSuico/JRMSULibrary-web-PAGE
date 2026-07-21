import React from 'react';
import { useIntersectionObserver } from '@/src/Hooks/useIntersectionObserver';

export const LibraryMapSection: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  const googleMapsUrl = 'https://maps.app.goo.gl/D6EMrqq27fw4JTuW6';

  return (
    <section id="library-map" className={`py-section-py-desktop reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="max-w-max-width mx-auto px-4 md:px-gutter">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="font-headline-lg text-4xl font-bold mb-4" style={{ color: 'var(--color-primary)', textShadow: '0 2px 8px var(--color-black-alpha-60)' }}>Library Map and Location</h2>
          <p className="" style={{ color: 'var(--color-primary)', textShadow: '0 1px 4px var(--color-black-alpha-50)' }}>
            Find us at the heart of Katipunan, Zamboanga del Norte.
          </p>
        </div>
        <div className="p-4 sm:p-6 md:p-8 bg-transparent">

          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-stretch">
            {/* Left Column: Address Info Card */}
            <div className="flex flex-col justify-center space-y-6">
              <div className="rounded-2xl p-6 md:p-10 border border-gold-light/20 shadow-lg flex-1 flex flex-col justify-center" style={{ background: 'var(--color-navy-alpha-90)', backdropFilter: 'blur(8px)' }}>
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-md bg-gold-light text-primary">
                    <span className="material-symbols-outlined text-3xl">location_on</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-xl font-bold mb-2 text-gold-light">Our Location</h3>
                    <p className="text-base leading-relaxed mb-2 text-white/90">
                      Barangay Dos, Katipunan,<br />Zamboanga del Norte
                    </p>
                    <p className="text-sm font-mono tracking-wider text-white/60">
                      8.509171, 123.286122
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 mt-auto">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold hover:bg-navy-mid transition-all shadow-xl hover:shadow-2xl interactive-hover text-sm w-full"
                    style={{ background: 'var(--color-primary)', color: 'var(--color-gold-light)' }}
                  >
                    <span className="material-symbols-outlined text-xl">directions</span>
                    Get Directions
                  </a>
                  <p className="text-center mt-2 text-xs text-white/80">
                    Can't see the map?{' '}
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:opacity-80 transition font-medium text-gold-light"
                    >
                      Open in Google Maps
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Map Container (Satellite View) */}
            <div className="h-[400px] lg:h-full min-h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-gold-light/30">
              <iframe
                src="https://maps.google.com/maps?q=8.509171,123.286122&t=k&z=18&output=embed"
                className="w-full h-full border-0"
                allowFullScreen={true}
                loading="lazy"
                title="JRMSU Katipunan Library Location (Satellite)"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
