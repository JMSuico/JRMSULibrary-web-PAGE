import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useIntersectionObserver } from '@/src/Hooks/useIntersectionObserver';
import { cmsApi, ManagedFile } from '@/src/Endpoints/cmsApi';
import { Loader2, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const tabs = [
  { id: 'administration', label: 'Administration' },
  { id: 'manual', label: 'Manual' },
];

export default function AdministrationPage() {
  const location = useLocation();
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [activeTab, setActiveTab] = useState('administration');
  const [orgImageOpen, setOrgImageOpen] = useState(false);
  const [orgChartUrl, setOrgChartUrl] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState<string | null>(null);
  const [allFiles, setAllFiles] = useState<ManagedFile[]>([]);
  const [expandedFileId, setExpandedFileId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.hash) {
      const hash = location.hash.replace('#', '');
      if (tabs.some(t => t.id === hash)) {
        setActiveTab(hash);
      }
    }
  }, [location.hash]);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const files = await cmsApi.getAllFiles();
        // Fallbacks included if CMS doesn't have the files yet
        const orgChart = files.find(f => f.name.toLowerCase().includes('org') || f.name.toLowerCase().includes('structure'));
        const manual = files.find(f => f.name.toLowerCase().includes('manual') || f.name.toLowerCase().includes('policy'));

        if (orgChart) setOrgChartUrl(orgChart.file.startsWith('http') ? orgChart.file : `http://127.0.0.1:8000/media/${orgChart.file}`);
        if (manual) setManualUrl(manual.file.startsWith('http') ? manual.file : `http://127.0.0.1:8000/media/${manual.file}`);
        setAllFiles(files.filter(f => f.is_active));
      } catch (e) {
        console.error('Failed to load administration assets from CMS', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  return (
    <section id="administration" className={`pt-28 pb-20 reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="max-w-max-width mx-auto px-4 md:px-gutter">
        <div className="text-center mb-10">
          <h2 className="font-headline-lg font-bold text-2xl sm:text-3xl md:text-4xl mb-4" style={{ color: 'var(--color-primary)', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>Administration</h2>
          <p className="max-w-2xl mx-auto" style={{ color: 'var(--color-primary)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
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
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-gold-light w-8 h-8" />
            </div>
          ) : activeTab === 'administration' ? (
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
                    src={orgChartUrl || "/assets/organizational structure library.png"}
                    alt="JRMSU Library Organizational Structure Chart"
                    className="w-full h-auto object-contain bg-white"
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
          ) : (
            <div className="max-w-3xl mx-auto">
              <h3 className="font-headline-md font-bold text-2xl text-gold-light mb-6 text-center">Manual & Policies</h3>
              <p className="text-white/80 mb-6 text-center">Library Resources and Policies</p>
              
              <div className="flex flex-col gap-4">
                {allFiles.length === 0 ? (
                  <div className="bg-white/10 rounded-2xl p-8 text-center text-white/70">
                    No files available at this time.
                  </div>
                ) : (
                  allFiles.map(file => {
                    return (
                      <div key={file.id} className="bg-white rounded-xl overflow-hidden shadow-lg transition-all animate-modal-card">
                        <button
                          onClick={() => setExpandedFileId(file.id)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="text-primary w-5 h-5" />
                            <span className="font-semibold text-gray-900">{file.name}</span>
                          </div>
                          <ChevronRight className="text-gray-500 w-5 h-5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Modal for Manual Viewer */}
      {expandedFileId && createPortal((() => {
        const file = allFiles.find(f => f.id === expandedFileId);
        if (!file) return null;
        const fileUrl = file.file.startsWith('http') ? file.file : `http://127.0.0.1:8000/media/${file.file}`;
        const isPdf = fileUrl.toLowerCase().endsWith('.pdf');
        const isImage = fileUrl.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/);

        return (
          <div className="fixed inset-0 ] flex items-center justify-center p-4 sm:p-6 md:p-8 z-[9999] animate-modal-overlay">
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-modal-overlay"
              onClick={() => setExpandedFileId(null)}
              aria-hidden="true"
            />
            <div className="relative z-10 w-full max-w-5xl h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-modal-card">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-navy to-navy-dark">
                <div className="flex items-center gap-3">
                  <FileText className="text-gold-light w-6 h-6" />
                  <h3 className="text-lg font-bold text-white m-0 line-clamp-1">{file.name}</h3>
                </div>
                <button
                  onClick={() => setExpandedFileId(null)}
                  className="text-white/80 hover:text-white transition-colors p-1"
                  aria-label="Close modal"
                >
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>
              
              {/* Body */}
              <div className="flex-1 bg-gray-50 overflow-hidden relative">
                {isPdf ? (
                  <iframe
                    src={`${fileUrl}#toolbar=0&navpanes=0`}
                    className="w-full h-full border-0"
                    title={file.name}
                  />
                ) : isImage ? (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <img src={fileUrl} alt={file.name} className="max-w-full max-h-full object-contain rounded shadow" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-8 text-center">
                    <div>
                      <FileText className="mx-auto w-16 h-16 text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">This file type cannot be previewed inline.</p>
                      <a 
                        href={fileUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-2 px-6 py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy-dark transition-colors shadow-lg hover:shadow-xl"
                      >
                        <span className="material-symbols-outlined text-xl">download</span>
                        Download or View (Read Only)
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })(), document.body)}
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
            src={orgChartUrl || "/assets/organizational structure library.png"}
            alt="JRMSU Library Organizational Structure Chart"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </section>
  );
}
