import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface GalleryModalItem {
  src: string;
  label: string;
}

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

const GalleryViewModal: React.FC<{ images: GalleryModalItem[]; isOpen: boolean; onClose: () => void }> = ({ images, isOpen, onClose }) => {
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const PER_PAGE = 30;
  const totalPages = Math.max(1, Math.ceil(images.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = useMemo(() => {
    const start = currentPage * PER_PAGE;
    return images.slice(start, start + PER_PAGE);
  }, [images, currentPage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-headline-md text-lg font-bold text-primary">Library Section Gallery</h2>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none ${
                  viewMode === 'card' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
                aria-label="Card view"
              >
                <span className="material-symbols-outlined text-base align-middle">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none ${
                  viewMode === 'table' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
                aria-label="Table view"
              >
                <span className="material-symbols-outlined text-base align-middle">table_rows</span>
              </button>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer bg-transparent border-none" aria-label="Close">
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === 'card' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {pageItems.map((img, idx) => (
                <div key={currentPage * PER_PAGE + idx} className="rounded-xl overflow-hidden shadow-md border border-gray-100">
                  <img src={img.src} alt={img.label} className="w-full h-32 object-cover" />
                  <p className="text-xs text-gray-600 p-2 text-center font-medium truncate">{img.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs uppercase tracking-wider w-10">#</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs uppercase tracking-wider">Thumbnail</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs uppercase tracking-wider">Label</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((img, idx) => {
                    const realIdx = currentPage * PER_PAGE + idx + 1;
                    return (
                      <tr key={realIdx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 text-gray-400 text-xs">{realIdx}</td>
                        <td className="py-3 px-3">
                          <img src={img.src} alt={img.label} className="w-16 h-10 object-cover rounded" />
                        </td>
                        <td className="py-3 px-3 text-primary font-medium">{img.label}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-transparent">
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {currentPage + 1} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-transparent">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const LibrarySectionCarousel: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [activeIdx, setActiveIdx] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);

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
    return () => { document.body.style.backgroundImage = ''; };
  }, []);

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

        <div className="rounded-3xl p-6 md:p-10 shadow-2xl border border-gold-light/20" style={{ background: 'rgba(0,24,81,0.15)', backdropFilter: 'blur(4px)' }}>
          <div className="relative">
            {/* Cover slideshow */}
            <div className="rounded-2xl overflow-hidden shadow-xl h-[300px] md:h-[450px] relative">
              {sectionImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img.src}
                  alt={img.label}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                  style={{ opacity: idx === activeIdx ? 1 : 0 }}
                />
              ))}
            </div>

            <div className="absolute inset-y-0 left-0 flex items-center">
              <button className="carousel-nav-btn ml-3" onClick={prev} aria-label="Previous section picture">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button className="carousel-nav-btn mr-3" onClick={next} aria-label="Next section picture">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            {sectionImages.map((_, idx) => (
              <button
                key={idx}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  idx === activeIdx ? 'bg-gold-light w-6' : 'bg-white/40 hover:bg-white/60'
                }`}
                onClick={() => goTo(idx)}
                aria-label={`Go to ${sectionImages[idx].label}`}
              />
            ))}
          </div>

          <p className="text-center text-sm mt-4 font-medium" style={{ color: '#F0D97A', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            {sectionImages[activeIdx].label}
          </p>

          <div className="flex justify-center mt-6">
            <button
              onClick={() => setGalleryOpen(true)}
              className="bg-gold-light text-primary px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-gold-pale transition-all shadow-lg cursor-pointer border-none"
            >
              View All List
            </button>
          </div>
        </div>
      </div>
      <GalleryViewModal images={sectionImages} isOpen={galleryOpen} onClose={() => setGalleryOpen(false)} />
    </section>
  );
};