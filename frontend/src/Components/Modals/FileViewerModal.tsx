import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { TreeNodeData } from '@/src/Libs/Assets/treeData';

interface FileViewerModalProps {
  file: TreeNodeData;
  fileList: TreeNodeData[];
  onClose: () => void;
  onNavigate: (file: TreeNodeData) => void;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({ file, fileList, onClose, onNavigate }) => {
  // Robust matcher to ensure index is always accurate across relative or prefixed paths
  const currentIdx = fileList.findIndex((f) => 
    f.path === file.path || 
    f.name === file.name || 
    (Boolean(f.path) && Boolean(file.path) && f.path.split('/').pop() === file.path.split('/').pop())
  );
  const safeIdx = currentIdx >= 0 ? currentIdx : 0;

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const activeBlobRef = useRef<string | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Intercept and disable saving, printing, and inspecting shortcuts
    const isSave = (e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S');
    const isPrint = (e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P');
    const isViewSource = (e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U');
    const isInspect = e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'C', 'c', 'J', 'j'].includes(e.key));

    if (isSave || isPrint || isViewSource || isInspect) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && safeIdx > 0) onNavigate(fileList[safeIdx - 1]);
    if (e.key === 'ArrowRight' && safeIdx < fileList.length - 1) onNavigate(fileList[safeIdx + 1]);
  }, [onClose, onNavigate, safeIdx, fileList]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  if (!file.path) return null;

  const isPdf = file.path.toLowerCase().endsWith('.pdf');
  const isLink = file.path.startsWith('http://') || file.path.startsWith('https://');

  // Anti-download URL protection: fetch file and render via ephemeral blob URL
  // so the direct file path is never visible or downloadable via inspect element.
  useEffect(() => {
    if (!isPdf || !file.path) {
      setBlobUrl(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    // Revoke previous blob if any
    if (activeBlobRef.current) {
      URL.revokeObjectURL(activeBlobRef.current);
      activeBlobRef.current = null;
    }

    fetch(file.path)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (!isMounted) return;
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);
        activeBlobRef.current = url;
        setBlobUrl(url);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        // Graceful fallback to file path with hidden toolbar if fetch fails
        setBlobUrl(file.path || null);
        setLoading(false);
      });

    return () => {
      isMounted = false;
      if (activeBlobRef.current) {
        URL.revokeObjectURL(activeBlobRef.current);
        activeBlobRef.current = null;
      }
    };
  }, [file.path, isPdf]);

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-modal-overlay z-[9999] select-none"
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl max-h-[90vh] flex flex-col animate-modal-card"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
        role="dialog"
        aria-modal="true"
        aria-label={`Viewing: ${file.name}`}
      >
        {/* Header - Authentic JRMSU Blue Gradient */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-600 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="material-symbols-outlined">{isLink ? 'link' : 'description'}</span>
            <span className="font-medium truncate text-sm">{file.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-blue-200">
              {fileList.length > 0 ? `${safeIdx + 1} / ${fileList.length}` : '1 / 1'}
            </span>
            <button
              onClick={onClose}
              className="text-white hover:text-white/70 transition-colors cursor-pointer"
              aria-label="Close viewer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Navigation + Viewer */}
        <div className="flex items-stretch flex-1 min-h-0 relative">
          {safeIdx > 0 && (
            <button
              onClick={() => onNavigate(fileList[safeIdx - 1])}
              className="carousel-nav-btn absolute left-6 top-1/2 -translate-y-1/2 z-20 cursor-pointer"
              aria-label="Previous file"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
          )}

          <div 
            className="flex-1 bg-gray-100 p-4 flex items-center justify-center overflow-auto min-h-[60vh] relative"
            onContextMenu={(e) => e.preventDefault()}
          >
            {isPdf ? (
              loading ? (
                <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                  <span className="material-symbols-outlined animate-spin text-3xl text-blue-600">progress_activity</span>
                  <span className="text-sm font-medium">Opening document for reading...</span>
                </div>
              ) : blobUrl ? (
                <div className="w-full h-full relative flex items-center justify-center" style={{ minHeight: '60vh' }}>
                  <iframe
                    src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full rounded-lg shadow-inner bg-white border-0"
                    style={{ minHeight: '60vh' }}
                    title={file.name}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  {/* Transparent top overlay to block browser toolbar click-through/saving */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-10 pointer-events-auto bg-transparent"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <span className="material-symbols-outlined text-5xl mb-2 text-gray-400">description</span>
                  <p className="font-medium">Unable to load document preview.</p>
                  <p className="text-xs text-gray-400 mt-1">File: {file.name}</p>
                </div>
              )
            ) : isLink ? (
              <div className="text-center bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-gray-200 max-w-xl mx-auto w-full animate-modal-card">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-4xl">public</span>
                </div>
                <h3 className="font-headline-md font-bold text-2xl text-navy-dark mb-3">External Link</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  You are about to navigate away from the JRMSU Library website to access <span className="font-semibold text-navy-dark">{file.name}</span>.
                </p>
                <a 
                  href={file.path} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold shadow-lg hover:-translate-y-1 transition-all"
                  onClick={onClose}
                >
                  Proceed to Website
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </a>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <span className="material-symbols-outlined text-6xl mb-4 text-gray-400">description</span>
                <p className="font-medium">Preview not available for this file type.</p>
                <p className="text-sm mt-2">File: {file.name}</p>
              </div>
            )}
          </div>

          {safeIdx < fileList.length - 1 && (
            <button
              onClick={() => onNavigate(fileList[safeIdx + 1])}
              className="carousel-nav-btn absolute right-6 top-1/2 -translate-y-1/2 z-20 cursor-pointer"
              aria-label="Next file"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
