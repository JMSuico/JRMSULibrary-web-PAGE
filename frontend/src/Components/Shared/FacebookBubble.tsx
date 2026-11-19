import React, { useEffect, useState } from 'react';
import { ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { useDraggableBubble } from '@/src/Hooks/useDraggableBubble';

interface FacebookBubbleProps {
  isHidden?: boolean;
}

const FACEBOOK_PAGE_URL = 'https://www.facebook.com/JRMSUkatipunanlibrary';
const FACEBOOK_EMBED_URL =
  'https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FJRMSUkatipunanlibrary&tabs=timeline&width=480&height=520&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false&appId';

export const FacebookBubble: React.FC<FacebookBubbleProps> = ({ isHidden = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [isIframeBlocked, setIsIframeBlocked] = useState(false);

  const { ref, style, isDragging } = useDraggableBubble({
    storageKey: 'fb_bubble_pos',
    defaultSide: 'right',
    defaultBottomPx: 126,
  });

  useEffect(() => {
    if (!isOpen) return;

    setIsIframeLoading(true);
    setIsIframeBlocked(false);

    const fallbackTimer = setTimeout(() => {
      setIsIframeLoading((loading) => {
        if (loading) {
          setIsIframeBlocked(true);
        }
        return false;
      });
    }, 4500);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    // Stay mounted in DOM at all times so the drag hook can pre-calculate position.
    // Use opacity to hide/show instead of unmounting, to prevent position jumps.
    <div className={`transition-opacity duration-500 ${isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {/* Floating Bubble — draggable + magnetic edge snap */}
      <div
        ref={ref}
        style={style}
        className="group w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg float-bubble bubble-3d-container flex items-center justify-center bg-facebook relative"
      >
        <button
          onClick={() => !isDragging && setIsOpen(true)}
          className="bubble-3d-btn w-full h-full flex items-center justify-center cursor-pointer border-none bg-transparent"
          aria-label="Open Facebook Page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 320 512" className="fill-white group-hover:fill-facebook transition-colors duration-500">
            <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
          </svg>
        </button>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="JRMSU Katipunan Campus Library Facebook Page"
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-modal-overlay"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-[480px] flex flex-col animate-modal-card"
            style={{ maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-facebook text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-sm sm:text-base truncate">JRMSU Katipunan Library</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-white/70 transition-colors cursor-pointer bg-transparent border-none p-1"
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Direct Page Banner + Always-Available External Button */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-navy-dark truncate">
                  JRMSU Katipunan Campus Library
                </p>
                <p className="text-[11px] text-slate-600 truncate">
                  Official Facebook Updates and Announcements
                </p>
              </div>
              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-facebook text-white text-xs font-semibold hover:opacity-90 transition-opacity no-underline shadow-sm"
              >
                <span>Open Facebook Page in New Tab</span>
                <ExternalLink size={14} />
              </a>
            </div>

            {/* Responsive iframe wrapper with loading & privacy-block fallback */}
            <div className="w-full relative overflow-y-auto bg-white" style={{ maxHeight: 'calc(90vh - 118px)' }}>
              {isIframeLoading && (
                <div className="absolute inset-0 z-10 bg-white/95 flex flex-col items-center justify-center gap-2.5 p-6 text-center">
                  <Loader2 size={28} className="animate-spin text-facebook" />
                  <p className="text-sm font-medium text-slate-700">
                    Loading Facebook Page feed...
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs">
                    If your browser blocks embedded Facebook content, use the button above to open the page directly.
                  </p>
                </div>
              )}

              {isIframeBlocked && (
                <div className="m-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-700" />
                    <div className="text-xs leading-relaxed">
                      <p className="font-semibold mb-1">
                        Embedded Facebook feed unavailable in this browser session
                      </p>
                      <p className="text-amber-800">
                        Browser privacy settings, third-party cookie restrictions, or an unauthenticated Facebook session may prevent the embedded timeline from displaying.
                      </p>
                    </div>
                  </div>
                  <a
                    href={FACEBOOK_PAGE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-facebook text-white text-xs font-semibold hover:opacity-90 transition-opacity no-underline"
                  >
                    <span>Open Facebook Page in New Tab</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              <iframe
                src={FACEBOOK_EMBED_URL}
                onLoad={() => setIsIframeLoading(false)}
                onError={() => {
                  setIsIframeLoading(false);
                  setIsIframeBlocked(true);
                }}
                style={{
                  width: '100%',
                  height: '520px',
                  border: 'none',
                  display: 'block',
                }}
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                title="JRMSU Katipunan Library Facebook Page"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
