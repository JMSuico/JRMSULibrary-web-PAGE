import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const tabs = [
  { id: 'administration', label: 'Administration' },
  { id: 'manual', label: 'Manual' },
];

export default function AdministrationPage() {
  const location = useLocation();
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [activeTab, setActiveTab] = useState('administration');
  const [orgImageOpen, setOrgImageOpen] = useState(false);

  useEffect(() => {
    if (location.hash) {
      const hash = location.hash.replace('#', '');
      if (tabs.some(t => t.id === hash)) {
        setActiveTab(hash);
      }
    }
  }, [location.hash]);

  return (
    <section id="administration" className={`pt-28 pb-20 reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="max-w-max-width mx-auto px-4 md:px-gutter">
        <div className="text-center mb-10">
          <h2 className="font-headline-lg font-bold text-2xl sm:text-3xl md:text-4xl mb-4" style={{ color: '#001851', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>Administration</h2>
          <p className="max-w-2xl mx-auto" style={{ color: '#001851', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            Library organizational structure and policies manual.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-pill ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-3xl p-4 sm:p-8 md:p-12 shadow-2xl border border-gold-light/20 w-fit mx-auto max-w-full" style={{ background: 'rgba(0,24,81,0.9)', backdropFilter: 'blur(8px)' }}>
          {activeTab === 'administration' && (
            <div>
              <h3 className="font-headline-md font-bold text-2xl text-gold-light mb-8 text-center">
                Library Organizational Structure
              </h3>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setOrgImageOpen(true)}
                  className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl border-2 border-gold-light/30 cursor-pointer hover:opacity-95 transition-opacity group"
                  aria-label="View organizational structure image"
                >
                  <img
                    src="/assets/organizational structure library.png"
                    alt="JRMSU Library Organizational Structure Chart"
                    className="w-full h-auto object-contain"
                  />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-5xl opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">
                      zoom_in
                    </span>
                  </div>
                </button>
                <p className="text-sm text-white/60 mt-4">Click image to enlarge</p>
              </div>
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="max-w-3xl mx-auto">
              <h3 className="font-headline-md font-bold text-2xl text-gold-light mb-6 text-center">Manual</h3>
              <p className="text-white/80 mb-6 text-center">Library Policies Manual</p>
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg" style={{ minHeight: '70vh' }}>
                <iframe
                  src="/assets/library-policies-manual.pdf#toolbar=1&navpanes=0"
                  className="w-full h-full"
                  style={{ minHeight: '70vh' }}
                  title="Library Policies Manual"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {orgImageOpen && createPortal(
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setOrgImageOpen(false)}
        >
          <button
            className="absolute top-6 right-6 text-white text-3xl hover:text-gold-light transition-colors cursor-pointer z-10"
            onClick={() => setOrgImageOpen(false)}
            aria-label="Close image"
          >
            <span className="material-symbols-outlined text-4xl">close</span>
          </button>
          <img
            src="/assets/organizational structure library.png"
            alt="JRMSU Library Organizational Structure Chart"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </section>
  );
}
