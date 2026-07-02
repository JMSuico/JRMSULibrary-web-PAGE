import React, { useEffect, useCallback } from 'react';
import type { TreeNodeData } from '@/src/Libs/Assets/treeData';

interface FileViewerModalProps {
  file: TreeNodeData;
  fileList: TreeNodeData[];
  onClose: () => void;
  onNavigate: (file: TreeNodeData) => void;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({ file, fileList, onClose, onNavigate }) => {
  const currentIdx = fileList.findIndex((f) => f.path === file.path);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && currentIdx > 0) onNavigate(fileList[currentIdx - 1]);
    if (e.key === 'ArrowRight' && currentIdx < fileList.length - 1) onNavigate(fileList[currentIdx + 1]);
  }, [onClose, onNavigate, currentIdx, fileList]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  if (!file.path) return null;

  const isPdf = file.path.toLowerCase().endsWith('.pdf');
  const isLink = file.path.startsWith('http://') || file.path.startsWith('https://');

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Viewing: ${file.name}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="material-symbols-outlined">{isLink ? 'link' : 'description'}</span>
            <span className="font-medium truncate text-sm">{file.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-blue-200">
              {currentIdx + 1} / {fileList.length}
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
        <div className="flex items-stretch flex-1 min-h-0">
          {currentIdx > 0 && (
            <button
              onClick={() => onNavigate(fileList[currentIdx - 1])}
              className="carousel-nav-btn absolute left-6 top-1/2 -translate-y-1/2 z-10 cursor-pointer"
              aria-label="Previous file"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
          )}

          <div className="flex-1 bg-gray-100 p-4 flex items-center justify-center overflow-auto min-h-[60vh] relative">
            {isPdf ? (
              <iframe
                src={`${file.path}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full rounded-lg shadow-inner"
                style={{ minHeight: '60vh' }}
                title={file.name}
              />
            ) : isLink ? (
              <div className="text-center bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-gray-200 max-w-xl mx-auto w-full">
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
              <div className="text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-6xl mb-4">description</span>
                <p className="font-medium">Preview not available for this file type.</p>
                <p className="text-sm mt-2">File: {file.name}</p>
              </div>
            )}
          </div>

          {currentIdx < fileList.length - 1 && (
            <button
              onClick={() => onNavigate(fileList[currentIdx + 1])}
              className="carousel-nav-btn absolute right-6 top-1/2 -translate-y-1/2 z-10 cursor-pointer"
              aria-label="Next file"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};