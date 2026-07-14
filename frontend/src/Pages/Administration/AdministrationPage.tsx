import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useIntersectionObserver } from '@/src/Hooks/useIntersectionObserver';
import { cmsApi, ManagedFile } from '@/src/Endpoints/cmsApi';
import { Loader2, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { FileViewerModal } from '@/src/Components/Modals/FileViewerModal';
import type { TreeNodeData } from '@/src/Libs/Assets/treeData';

const getFileUrl = (filePath: string) => {
  if (!filePath) return '';
  if (filePath.startsWith('http')) return filePath;
  
  // Dynamically compute the URL based on the current hostname to support Wi-Fi deployment
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
  const baseUrl = `http://${hostname}:8000`;
  
  if (filePath.startsWith('/media/')) return `${baseUrl}${filePath}`;
  if (filePath.startsWith('/')) return `${baseUrl}/media${filePath}`;
  return `${baseUrl}/media/${filePath}`;
};

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

        if (orgChart) setOrgChartUrl(getFileUrl(orgChart.file));
        if (manual) setManualUrl(getFileUrl(manual.file));
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
          <h2 className="font-headline-lg font-bold text-2xl sm:text-3xl md:text-4xl mb-4" style={{ color: 'var(--color-primary)', textShadow: '0 2px 8px var(--color-black-alpha-60)' }}>Administration</h2>
          <p className="max-w-2xl mx-auto" style={{ color: 'var(--color-primary)', textShadow: '0 1px 4px var(--color-black-alpha-50)' }}>
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

        <div className="rounded-3xl p-4 sm:p-8 md:p-12 shadow-2xl border border-gold-light/20 w-full mx-auto max-w-6xl" style={{ background: 'var(--color-navy-alpha-90)', backdropFilter: 'blur(8px)' }}>
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
                  className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border-2 border-gold-light/30 cursor-pointer hover:opacity-95 transition-opacity group"
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
            <div className="w-full mx-auto">
              <h3 className="font-headline-md font-bold text-2xl mb-6 text-center" style={{ color: 'var(--color-gold-light)' }}>Manual & Policies</h3>
              <p className="mb-6 text-center" style={{ color: 'var(--color-white-alpha-80)' }}>Library Resources and Policies</p>
              
              <div className="flex flex-col gap-6">
                {allFiles.length === 0 ? (
                  <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: 'var(--color-white-alpha-10)', color: 'var(--color-white-alpha-70)' }}>
                    No files available at this time.
                  </div>
                ) : (
                  allFiles.map(file => {
                    const fileUrl = getFileUrl(file.file);
                    const isPdf = fileUrl.toLowerCase().endsWith('.pdf');
                    const isImage = fileUrl.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/);

                    return (
                      <div key={file.id} className="rounded-xl overflow-hidden shadow-lg transition-all animate-modal-card" style={{ backgroundColor: 'var(--color-white)' }}>
                        <div className="w-full flex items-center justify-between p-4 border-b" style={{ backgroundColor: 'var(--color-gray-50)', borderColor: 'var(--color-gray-200)' }}>
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                            <span className="font-semibold" style={{ color: 'var(--color-gray-900)' }}>{file.name}</span>
                          </div>
                          <button
                            onClick={() => setExpandedFileId(file.id)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors hover:bg-gray-200 text-gray-700 bg-gray-100"
                            aria-label={`Expand ${file.name}`}
                          >
                            <span className="material-symbols-outlined text-[18px]">open_in_full</span>
                            Expand
                          </button>
                        </div>
                        <div className="w-full h-[70vh] min-h-[600px] overflow-auto relative">
                          {isPdf ? (
                            <iframe
                              src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                              className="w-full h-full border-0"
                              title={file.name}
                            >
                              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center" style={{ backgroundColor: 'var(--color-gray-50)' }}>
                                <FileText className="mx-auto w-12 h-12 mb-4" style={{ color: 'var(--color-gray-400)' }} />
                                <p className="mb-4" style={{ color: 'var(--color-gray-600)' }}>Your browser doesn't support inline PDFs.</p>
                                <a 
                                  href={fileUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="inline-flex items-center gap-2 px-4 py-2 font-semibold rounded-lg transition-colors"
                                  style={{ backgroundColor: 'var(--color-navy)', color: 'var(--color-white)' }}
                                >
                                  Open PDF in New Tab
                                </a>
                              </div>
                            </iframe>
                          ) : isImage ? (
                            <div className="w-full h-full flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-gray-50)' }}>
                              <img src={fileUrl} alt={file.name} className="max-w-full max-h-full object-contain rounded shadow" />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center p-8 text-center">
                              <div>
                                <FileText className="mx-auto w-12 h-12 mb-4" style={{ color: 'var(--color-gray-400)' }} />
                                <p style={{ color: 'var(--color-gray-600)' }}>This file type cannot be previewed inline.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Viewer Modal */}
      {expandedFileId && (() => {
        const file = allFiles.find(f => f.id === expandedFileId);
        if (!file) return null;
        const fileUrl = getFileUrl(file.file);
        
        const treeFile: TreeNodeData = {
          id: String(file.id),
          name: file.name,
          path: fileUrl,
          type: fileUrl.toLowerCase().endsWith('.pdf') ? 'pdf' : fileUrl.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/) ? 'image' : 'file',
        };

        const fileList: TreeNodeData[] = allFiles.map(f => {
          const fUrl = getFileUrl(f.file);
          return {
            id: String(f.id),
            name: f.name,
            path: fUrl,
            type: fUrl.toLowerCase().endsWith('.pdf') ? 'pdf' : fUrl.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/) ? 'image' : 'file',
          };
        });

        return (
          <FileViewerModal
            file={treeFile}
            fileList={fileList}
            onClose={() => setExpandedFileId(null)}
            onNavigate={(newFile) => setExpandedFileId(Number(newFile.id))}
          />
        );
      })()}
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
