import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

interface GalleryImage {
  id: number;
  file: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  folder: string;
  autoSlide?: boolean;
  autoSlideInterval?: number;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  folder,
  autoSlide = false,
  autoSlideInterval = 3000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const total = images.length;

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-slide
  useEffect(() => {
    if (!autoSlide || isPaused || total <= 1) return;
    const id = setInterval(goNext, autoSlideInterval);
    return () => clearInterval(id);
  }, [autoSlide, autoSlideInterval, isPaused, total, goNext]);

  // Modal navigation
  const nextModal = () => setModalIndex((prev) => (prev + 1) % total);
  const prevModal = () => setModalIndex((prev) => (prev - 1 + total) % total);
  const openModal = (index: number) => {
    setModalIndex(index);
    setModalOpen(true);
  };

  // Keyboard support for modal
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
      if (e.key === "ArrowRight") nextModal();
      if (e.key === "ArrowLeft") prevModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) goNext();
    if (diff < -50) goPrev();
  };

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-white/40 italic text-sm">
        No images available.
      </div>
    );
  }

  return (
    <div className="gallery-root">
      {/* Slider viewport */}
      <div
        className="gallery-viewport"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Image gallery"
        role="region"
      >
        {/* Track translates by exactly -currentIndex * 100% of slide width */}
        <div
          className="gallery-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((img, index) => (
            <div key={img.id} className="gallery-slide">
              <img
                src={`/${folder}/${img.file}`}
                alt={`Gallery image ${index + 1} of ${total}`}
                className="gallery-slide-img"
                onClick={() => openModal(index)}
                loading="lazy"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Prev / Next arrows */}
        {total > 1 && (
          <>
            <button
              className="gallery-arrow gallery-arrow-left"
              onClick={goPrev}
              aria-label="Previous slide"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              className="gallery-arrow gallery-arrow-right"
              onClick={goNext}
              aria-label="Next slide"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </>
        )}
      </div>

      {/* Dot indicators + controls */}
      {total > 1 && (() => {
        // Sliding window: show at most MAX_DOTS dots centered on currentIndex
        const MAX_DOTS = 7;
        let startIdx = 0;
        if (total > MAX_DOTS) {
          startIdx = Math.max(0, Math.min(currentIndex - Math.floor(MAX_DOTS / 2), total - MAX_DOTS));
        }
        const visibleCount = Math.min(MAX_DOTS, total);
        const visibleDots = Array.from({ length: visibleCount }, (_, i) => startIdx + i);

        return (
          <div className="gallery-controls">
            <div className="gallery-dots" role="tablist" aria-label="Slide indicators">
              {visibleDots.map((idx, position) => {
                const isActive = idx === currentIndex;
                // Edge dots get smaller when there are more images off-screen
                const isEdge = total > MAX_DOTS && (position === 0 || position === visibleDots.length - 1);
                const isNearEdge = total > MAX_DOTS && (position === 1 || position === visibleDots.length - 2);
                return (
                  <button
                    key={idx}
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={[
                      "gallery-dot",
                      isActive ? "gallery-dot-active" : "",
                      isEdge ? "gallery-dot-xs" : "",
                      isNearEdge && !isActive ? "gallery-dot-sm" : "",
                    ].filter(Boolean).join(" ")}
                    onClick={() => setCurrentIndex(idx)}
                  />
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Counter */}
      <p className="gallery-counter" aria-live="polite">
        {currentIndex + 1} / {total}
      </p>

      {/* Lightbox Modal */}
      {modalOpen &&
        createPortal(
          <div
            className="gallery-modal-overlay"
            onClick={() => setModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Enlarged image view"
          >
            <div className="gallery-modal-inner" onClick={(e) => e.stopPropagation()}>
              <button
                className="gallery-modal-close"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <img
                src={`/${folder}/${images[modalIndex].file}`}
                alt={`Enlarged gallery image ${modalIndex + 1} of ${total}`}
                className="gallery-modal-img"
              />

              {total > 1 && (
                <>
                  <button
                    className="gallery-modal-arrow gallery-modal-arrow-left"
                    onClick={prevModal}
                    aria-label="Previous image"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    className="gallery-modal-arrow gallery-modal-arrow-right"
                    onClick={nextModal}
                    aria-label="Next image"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </>
              )}

              <div className="gallery-modal-counter">{modalIndex + 1} / {total}</div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
