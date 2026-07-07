import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useIntersectionObserver } from '@/src/Hooks/useIntersectionObserver';
import { ClassicHorizontalCarousel } from '@/src/Components/Shared/ClassicHorizontalCarousel';
import { useCarouselStyle } from '@/src/Hooks/useCarouselStyle';
import { galleryApi, GalleryImage } from '@/src/Endpoints/galleryApi';

interface GalleryModalItem {
  src: string;
  label: string;
}

// Static fallback images used only if the backend has no active entries
const STATIC_FALLBACK_IMAGES: GalleryModalItem[] = [
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

/** Resolve a GalleryImage from the backend into a displayable src URL */
function resolveImageSrc(img: GalleryImage): string {
  if (!img.image) return '';
  if (img.image.startsWith('http')) return img.image;
  // Media files served from Django backend
  return `http://localhost:8000${img.image.startsWith('/') ? '' : '/'}${img.image}`;
}

const GalleryViewModal: React.FC<{ images: GalleryModalItem[]; isOpen: boolean; onClose: () => void }> = ({ images, isOpen, onClose }) => {
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const PER_PAGE = 30;
  const totalPages = Math.max(1, Math.ceil(images.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = useMemo(() => {
    const start = currentPage * PER_PAGE;
    return images.slice(start, start + PER_PAGE);
  }, [images, currentPage]);

  if (!isOpen) return null;

  return createPortal(
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
        <div className="flex-1 overflow-y-auto p-6 relative">
          {viewMode === 'card' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {pageItems.map((img, idx) => (
                <div key={currentPage * PER_PAGE + idx} 
                     className="rounded-xl overflow-hidden shadow-md border border-gray-100 cursor-pointer group"
                     onClick={() => setSelectedImage(img.src)}
                >
                  <div className="overflow-hidden relative" style={{ aspectRatio: '4 / 3' }}>
                    <img src={img.src} alt={img.label} className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-110" loading="lazy" draggable={false} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                       <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity">zoom_in</span>
                    </div>
                  </div>
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
                      <tr key={realIdx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedImage(img.src)}>
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

        {/* Lightbox Overlay */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4" 
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white hover:text-gold-light transition-colors z-[210] cursor-pointer"
              onClick={() => setSelectedImage(null)}
              aria-label="Close enlarged image"
            >
              <span className="material-symbols-outlined text-4xl">close</span>
            </button>
            <img 
              src={selectedImage} 
              alt="Enlarged view" 
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" 
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export const LibrarySectionCarousel: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [activeIdx, setActiveIdx] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const carouselStyle = useCarouselStyle();

  // Dynamic images from backend — falls back to static if DB is empty
  const [sectionImages, setSectionImages] = useState<GalleryModalItem[]>(STATIC_FALLBACK_IMAGES);

  useEffect(() => {
    galleryApi.getAllImages()
      .then((data: GalleryImage[]) => {
        const activeImages = data.filter(img => img.is_active);
        if (activeImages.length > 0) {
          setSectionImages(
            activeImages.map(img => ({
              src: resolveImageSrc(img),
              label: img.section_label || img.title || 'Library Section',
            }))
          );
        }
        // If no active images from DB, static fallback remains
      })
      .catch(() => {
        // Silently keep static fallback images
      });
  }, []);

  const goTo = useCallback((idx: number) => {
    const len = sectionImages.length;
    const wrapped = ((idx % len) + len) % len;
    setActiveIdx(wrapped);
  }, [sectionImages.length]);

  const prev = useCallback(() => goTo(activeIdx - 1), [goTo, activeIdx]);
  const next = useCallback(() => goTo(activeIdx + 1), [goTo, activeIdx]);

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  const getPosition = (idx: number): 'active' | 'right' | 'left' | 'far-right' | 'far-left' | 'hidden' => {
    const len = sectionImages.length;
    const diff = ((idx - activeIdx) % len + len) % len;
    if (diff === 0) return 'active';
    if (diff === 1) return 'right';
    if (diff === len - 1) return 'left';
    if (diff === 2) return 'far-right';
    if (diff === len - 2) return 'far-left';
    return 'hidden';
  };

  return (
    <div id="library-section" className={`py-section-py-desktop reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="max-w-max-width mx-auto px-4 md:px-gutter">
        <div className="text-center mb-8">
          <h2 className="font-headline-lg font-bold text-4xl mb-4" style={{ color: 'var(--color-primary)', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
            Library Section
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: 'var(--color-primary)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            Take a visual tour of the JRMSU Katipunan Campus Library facilities and spaces.
          </p>
        </div>

        <div className="p-6 md:p-10 bg-transparent">
          {carouselStyle === 'classic' ? (
            <>
              <ClassicHorizontalCarousel
                items={sectionImages.map(img => ({ src: img.src, label: img.label }))}
                onCardClick={(_, idx) => setGalleryOpen(true)}
              />
              <div className="flex justify-center mt-6 relative z-40">
                <button
                  onClick={() => setGalleryOpen(true)}
                  className="bg-gold-light text-primary px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-gold-pale hover:scale-105 transition-all shadow-lg cursor-pointer border-none"
                >
                  View All List
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="relative w-full max-w-5xl mx-auto flex items-center justify-center">
                {/* Nav Left */}
                <button className="carousel-nav-btn absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-50" onClick={prev} aria-label="Previous section picture">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>

            <div className="carousel-3d-stage relative min-h-[450px] md:min-h-[550px] w-full">
              {sectionImages.map((img, idx) => {
                const pos = getPosition(idx);
                return (
                  <div
                    key={idx}
                    className={`carousel-3d-card ${pos}`}
                    style={{
                      width: pos === 'active' ? '100%' : pos === 'right' || pos === 'left' ? '85%' : '70%',
                      maxWidth: pos === 'active' ? '800px' : pos === 'right' || pos === 'left' ? '650px' : '500px',
                    }}
                    onClick={() => {
                      if (pos === 'active') {
                        setGalleryOpen(true);
                      } else {
                        goTo(idx);
                      }
                    }}
                  >
                    <div className="w-full" style={{ aspectRatio: '16 / 10' }}>
                      <img
                        src={img.src}
                        alt={img.label}
                        className="w-full h-full object-cover block"
                        loading="lazy"
                        draggable={false}
                      />
                    </div>
                    {pos === 'active' && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-6 opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white font-medium flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                          <span className="material-symbols-outlined text-sm">fullscreen</span>
                          Click to expand
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button className="carousel-nav-btn absolute right-0 md:right-2 top-1/2 -translate-y-1/2 z-50" onClick={next} aria-label="Next section picture">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
              </div>

              <div className="flex items-center justify-center gap-2 mt-8 relative z-40">
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

              <p className="text-center text-sm mt-4 font-bold relative z-40" style={{ color: 'var(--color-primary)' }}>
                {sectionImages[activeIdx]?.label}
              </p>

              <div className="flex justify-center mt-6 relative z-40">
                <button
                  onClick={() => setGalleryOpen(true)}
                  className="bg-gold-light text-primary px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-gold-pale hover:scale-105 transition-all shadow-lg cursor-pointer border-none"
                >
                  View All List
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <GalleryViewModal images={sectionImages} isOpen={galleryOpen} onClose={() => setGalleryOpen(false)} />
    </div>
  );
};