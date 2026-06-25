import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

export const LibraryMapSection: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  const googleMapsUrl = 'https://maps.app.goo.gl/D6EMrqq27fw4JTuW6';

  return (
    <section id="library-map" className={`py-section-py-desktop reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="max-w-max-width mx-auto px-4 md:px-gutter">
        <div className="rounded-3xl p-8 md:p-12 shadow-2xl border border-gold-light/20" style={{ background: 'rgba(0,24,81,0.15)', backdropFilter: 'blur(4px)' }}>
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="font-headline-lg text-4xl font-bold mb-4" style={{ color: '#001851', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>Library Map and Location</h2>
            <p className="" style={{ color: '#001851', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              Find us at the heart of Katipunan, Zamboanga del Norte.
            </p>
          </div>

          {/* Map Container */}
          <div className="h-[500px] rounded-2xl overflow-hidden shadow-2xl border-4 border-gold-light/30 mb-8">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3935.8299982714214!2d123.286122!3d8.509171!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32551a95873efafb%3A0x8f827d2b19175617!2sJose%20Rizal%20Memorial%20State%20University%20-%20Katipunan%20Campus!5e1!3m2!1sen!2sph"
              className="w-full h-full border-0"
              allowFullScreen={true}
              loading="lazy"
              title="JRMSU Katipunan Library Location"
            ></iframe>
          </div>

          {/* Address Info Card */}
          <div className="rounded-2xl p-6 md:p-8 border border-gold-light/20 shadow-lg" style={{ background: 'rgba(0,24,81,0.15)', backdropFilter: 'blur(4px)' }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: '#001851', color: '#F0D97A' }}>
                  <span className="material-symbols-outlined text-2xl">location_on</span>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#001851' }}>
                    Barangay Dos, Katipunan, Zamboanga del Norte
                  </p>
                  <p className="text-xs font-mono" style={{ color: 'rgba(0,24,81,0.7)' }}>
                    8.509171, 123.286122
                  </p>
                </div>
              </div>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold hover:bg-navy-mid transition-all shadow-lg hover:shadow-xl interactive-hover text-sm"
                style={{ background: '#001851', color: '#F0D97A' }}
              >
                <span className="material-symbols-outlined text-xl">directions</span>
                Get Directions
              </a>
            </div>
          </div>

          {/* Fallback Link */}
          <p className="text-center mt-4 text-xs" style={{ color: '#001851' }}>
            Can't see the map?{' '}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80 transition"
              style={{ color: '#C9A84C' }}
            >
              Open in Google Maps
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
