import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

export const LibraryMapSection: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  const googleMapsUrl = 'https://maps.app.goo.gl/D6EMrqq27fw4JTuW6';

  return (
    <section id="library-map" className={`py-section-py-desktop reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="max-w-max-width mx-auto px-4 md:px-gutter">
        <div className="bg-primary/95 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl border border-gold-light/20">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="font-headline-lg text-4xl text-white font-bold mb-4">Library Map and Location</h2>
            <p className="text-white/70">
              Find us at the heart of Katipunan, Zamboanga del Norte.
            </p>
          </div>

          {/* Map Container */}
          <div className="h-[500px] rounded-2xl overflow-hidden shadow-2xl border-4 border-gold-light/30 mb-8">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1500!2d123.286343!3d8.510036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwMzAnMzYuMSJOIDEyM8KwMTcnMTAuOCJF!5e1!3m2!1sen!2sph"
              className="w-full h-full border-0"
              allowFullScreen={true}
              loading="lazy"
              title="JRMSU Katipunan Library Location - Satellite View"
            ></iframe>
          </div>

          {/* Address Info Card */}
          <div className="bg-navy-mid/60 rounded-2xl p-6 md:p-8 border border-gold-light/20 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary text-gold-light flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">location_on</span>
                </div>
                <div>
                  <p className="text-sm text-white/80 mb-1">
                    Barangay Dos, Katipunan, Zamboanga del Norte
                  </p>
                  <p className="text-xs text-white/60 font-mono">
                    8.510036, 123.286343
                  </p>
                </div>
              </div>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-gold-light rounded-full font-bold hover:bg-navy-mid transition-all shadow-lg hover:shadow-xl interactive-hover text-sm"
              >
                <span className="material-symbols-outlined text-xl">directions</span>
                Get Directions
              </a>
            </div>
          </div>

          {/* Fallback Link */}
          <p className="text-center mt-4 text-xs text-white/60">
            Can't see the map?{' '}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-light underline hover:text-gold-pale transition"
            >
              Open in Google Maps
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
