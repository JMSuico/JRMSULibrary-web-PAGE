import React, { useState } from 'react';
import { useIntersectionObserver } from '@/src/Hooks/useIntersectionObserver';

export const LibraryMapSection: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [mapEngine, setMapEngine] = useState<'google' | 'osm'>('google');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const googleMapsUrl = 'https://maps.google.com/?q=8.510047,123.286297';
  const coordinates = '8.510047, 123.286297';
  
  // Google Satellite Embed
  const googleEmbedUrl = 'https://maps.google.com/maps?q=8.510047,123.286297&hl=en&z=18&t=k&output=embed';
  
  // OpenStreetMap Embed (100% immune to API key limits or Google frame restrictions)
  const osmEmbedUrl = 'https://www.openstreetmap.org/export/embed.html?bbox=123.28000%2C8.50600%2C123.29200%2C8.51400&layer=mapnik&marker=8.510047%2C123.286297';

  const currentEmbedUrl = mapEngine === 'google' ? googleEmbedUrl : osmEmbedUrl;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(googleMapsUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyCoords = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(coordinates);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2500);
    }
  };

  return (
    <section id="library-map" className={`py-section-py-desktop reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="max-w-max-width mx-auto px-4 md:px-gutter">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="font-headline-lg text-4xl font-bold mb-4" style={{ color: 'var(--color-primary)', textShadow: '0 2px 8px var(--color-black-alpha-60)' }}>
            Library Map and Location
          </h2>
          <p className="" style={{ color: 'var(--color-primary)', textShadow: '0 1px 4px var(--color-black-alpha-50)' }}>
            Find us at the heart of Katipunan, Zamboanga del Norte.
          </p>
        </div>

        <div className="p-4 sm:p-6 md:p-8 bg-transparent">
          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-stretch">
            {/* Left Column: Address Info Card */}
            <div className="flex flex-col justify-center space-y-6">
              <div 
                className="rounded-2xl p-6 md:p-10 border border-gold-light/20 shadow-lg flex-1 flex flex-col justify-center" 
                style={{ background: 'var(--color-navy-alpha-90)', backdropFilter: 'blur(8px)' }}
              >
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-md bg-gold-light text-primary">
                    <span className="material-symbols-outlined text-3xl">location_on</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-xl font-bold mb-2 text-gold-light">Our Location</h3>
                    <p className="text-base leading-relaxed mb-2 text-white/90">
                      Barangay Dos, Katipunan,<br />Zamboanga del Norte, Philippines
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-mono tracking-wider text-white/70">
                        {coordinates}
                      </p>
                      <button
                        type="button"
                        onClick={handleCopyCoords}
                        className="px-2.5 py-1 rounded text-xs font-bold bg-white/15 text-gold-light hover:bg-white/25 transition-colors cursor-pointer border border-white/20"
                        title="Copy GPS coordinates"
                      >
                        {copiedCoords ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 mt-auto">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold hover:bg-gold transition-all shadow-xl hover:shadow-2xl interactive-hover text-sm flex-1 text-center"
                      style={{ background: 'var(--color-gold-light)', color: 'var(--color-primary)' }}
                    >
                      <span className="material-symbols-outlined text-xl">directions</span>
                      Get Directions ↗
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold bg-white/15 text-white hover:bg-white/25 border border-white/20 transition-all shadow-md text-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">{copiedLink ? 'check' : 'content_copy'}</span>
                      {copiedLink ? 'Link Copied!' : 'Copy Map Link'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/80 pt-2 border-t border-white/10">
                    <span>Katipunan Campus Main Library</span>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:opacity-80 transition font-medium text-gold-light"
                    >
                      Open in App / Tab ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Map Container (Dual-Engine: Google Satellite / OpenStreetMap) */}
            <div className="h-[420px] lg:h-full min-h-[420px] rounded-2xl overflow-hidden shadow-2xl border-4 border-gold-light/30 relative bg-navy-dark flex flex-col">
              
              {/* Map Engine Controls Toolbar */}
              <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-1 bg-navy-dark/90 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-lg pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => { setMapEngine('google'); setIframeError(false); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mapEngine === 'google'
                        ? 'bg-gold text-navy shadow-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Google Satellite
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMapEngine('osm'); setIframeError(false); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mapEngine === 'osm'
                        ? 'bg-gold text-navy shadow-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Street Map (OpenStreetMap)
                  </button>
                </div>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-navy-dark/90 backdrop-blur-md border border-white/20 text-gold-light text-xs font-bold hover:bg-navy shadow-lg transition-colors pointer-events-auto"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  <span>Full Map</span>
                </a>
              </div>

              {/* Fallback Overlay if Iframe gets blocked by browser policy */}
              {iframeError && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-navy text-white">
                  <span className="material-symbols-outlined text-5xl text-gold mb-3">map</span>
                  <h4 className="text-lg font-bold text-white mb-2">Map Frame Protected</h4>
                  <p className="text-xs text-white/70 max-w-sm mb-5 leading-relaxed">
                    If this browser network restricts third-party map frames, you can switch to OpenStreetMap or launch directly in Google Maps.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => { setMapEngine('osm'); setIframeError(false); }}
                      className="px-4 py-2.5 rounded-lg bg-gold text-navy font-bold text-xs hover:bg-gold-light transition-all shadow-lg cursor-pointer"
                    >
                      Switch to OpenStreetMap
                    </button>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-lg border border-white/30 text-white font-medium text-xs hover:bg-white/10 transition-colors"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              )}

              {/* Live Iframe */}
              <iframe
                key={mapEngine}
                src={currentEmbedUrl}
                className="w-full h-full border-0 flex-1"
                allowFullScreen={true}
                loading="lazy"
                title={`JRMSU Katipunan Library Location (${mapEngine === 'google' ? 'Google Satellite' : 'OpenStreetMap'})`}
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => setIframeLoaded(true)}
                onError={() => setIframeError(true)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
