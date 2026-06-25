import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface GalleryImage {
  id: number;
  file: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  folder: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, folder }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextModal = () => {
    setModalIndex((prev) => (prev + 1) % images.length);
  };

  const prevModal = () => {
    setModalIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openModal = (index: number) => {
    setModalIndex(index);
    setModalOpen(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    if (touchStartX.current - touchEndX.current > 50) nextSlide();
    if (touchEndX.current - touchStartX.current > 50) prevSlide();
  };

  return (
    <div>
      <div
        className="gallery-slider-container rounded-xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="gallery-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((img, index) => (
            <div key={img.id} className="gallery-slide">
              <img
                src={`/${folder}/${img.file}`}
                alt={`Gallery image ${img.id}`}
                onClick={() => openModal(index)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          className="p-3 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-all interactive-hover"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>

        <div className="flex gap-2">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex ? 'bg-primary scale-125' : 'bg-outline-variant'
              }`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>

        <button
          className="p-3 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-all interactive-hover"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <span className="material-symbols-outlined">arrow_forward_ios</span>
        </button>
      </div>

      {/* Enlarged Modal */}
      {modalOpen && createPortal(
        <div
          className="modal-overlay"
          onClick={() => setModalOpen(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') setModalOpen(false); }}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -left-14 top-1/2 -translate-y-1/2 p-3 bg-white/20 text-white rounded-full hover:bg-white/40 transition-all z-10"
              onClick={prevModal}
              aria-label="Previous image"
            >
              <span className="material-symbols-outlined text-3xl">chevron_left</span>
            </button>

            <img
              src={`/${folder}/${images[modalIndex].file}`}
              alt={`Enlarged gallery image ${images[modalIndex].id}`}
              className="max-h-[85vh] max-w-[85vw] object-contain rounded-xl shadow-2xl"
            />

            <button
              className="absolute -right-14 top-1/2 -translate-y-1/2 p-3 bg-white/20 text-white rounded-full hover:bg-white/40 transition-all z-10"
              onClick={nextModal}
              aria-label="Next image"
            >
              <span className="material-symbols-outlined text-3xl">chevron_right</span>
            </button>

            <button
              className="absolute -top-12 right-0 text-white/70 hover:text-white text-lg transition-colors"
              onClick={() => setModalOpen(false)}
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>

            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {modalIndex + 1} / {images.length}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
