import React, { useState } from 'react';

export const FacebookBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Bubble */}
      <div className="group fixed bottom-24 right-4 sm:right-6 z-[60] w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg cursor-pointer float-bubble bubble-3d-container flex items-center justify-center bg-facebook">
        <button
          onClick={() => setIsOpen(true)}
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
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-modal-overlay"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-[480px] flex flex-col animate-modal-card"
            style={{ height: 'min(85vh, 680px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-facebook text-white px-4 py-3 flex items-center justify-between shrink-0">
              <span className="font-bold text-sm sm:text-base">JRMSU Katipunan Library</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-white/70 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Responsive iframe wrapper */}
            <div className="flex-1 overflow-hidden relative">
              <iframe
                src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FJRMSUkatipunanlibrary&tabs=timeline&width=480&height=600&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false&appId"
                style={{
                  width: '100%',
                  height: '100%',
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
    </>
  );
};
