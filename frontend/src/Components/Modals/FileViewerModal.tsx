import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { TreeNodeData } from '@/src/Libs/Assets/treeData';
import { SecurePdfViewer } from './SecurePdfViewer';
import { ShieldAlert, AlertTriangle, ExternalLink, X, ChevronLeft, ChevronRight, FileText, Globe } from 'lucide-react';

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

  const [securityWarning, setSecurityWarning] = useState<string | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && safeIdx > 0) onNavigate(fileList[safeIdx - 1]);
    if (e.key === 'ArrowRight' && safeIdx < fileList.length - 1) onNavigate(fileList[safeIdx + 1]);
  }, [onClose, onNavigate, safeIdx, fileList]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  // Auto-dismiss security warnings after 3.5 seconds
  useEffect(() => {
    if (securityWarning) {
      const timer = setTimeout(() => setSecurityWarning(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [securityWarning]);

  if (!file.path) return null;

  const isPdf = file.path.toLowerCase().endsWith('.pdf');
  const isLink = file.path.startsWith('http://') || file.path.startsWith('https://');

  return createPortal(
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-modal-overlay z-[9999] select-none"
      onClick={onClose}
      onDragStart={(e) => e.preventDefault()}
      onContextMenu={(e) => {
        e.preventDefault();
        setSecurityWarning('Right-click is disabled to protect JRMSU Library collection materials.');
      }}
    >
      {/* Real-Time Floating Security Warning Toast */}
      {securityWarning && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-amber-950/95 text-amber-200 border border-amber-400/50 px-5 py-3 rounded-2xl shadow-2xl z-[10001] text-xs font-semibold flex items-center gap-2.5 animate-bounce max-w-md text-center pointer-events-none backdrop-blur-md">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{securityWarning}</span>
        </div>
      )}

      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl max-h-[92vh] flex flex-col animate-modal-card text-white relative"
        onClick={(e) => e.stopPropagation()}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setSecurityWarning('Right-click is disabled to protect JRMSU Library collection materials.');
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`Viewing: ${file.name}`}
      >
        {/* Header - Authentic JRMSU Navy Palette with Document Details */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-slate-700/70">
          <div className="flex items-center gap-3 min-w-0">
            {isLink ? (
              <Globe className="w-5 h-5 text-blue-400 shrink-0" />
            ) : (
              <FileText className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-semibold truncate text-sm text-slate-100">{file.name}</span>
              <span className="text-[11px] text-amber-300/80 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Protected Local Collection • Read-Only
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300 font-mono bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700 shadow-inner">
              {fileList.length > 0 ? `${safeIdx + 1} / ${fileList.length}` : '1 / 1'}
            </span>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation + Content Viewer */}
        <div className="flex items-stretch flex-1 min-h-0 relative bg-slate-950">
          {/* Previous File Carousel Button */}
          {safeIdx > 0 && (
            <button
              onClick={() => onNavigate(fileList[safeIdx - 1])}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-800/80 hover:bg-blue-600 text-white shadow-xl backdrop-blur transition-all hover:scale-105 cursor-pointer border border-slate-600"
              aria-label="Previous file"
              title="Previous File"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Main Viewer Body */}
          <div className="flex-1 flex items-center justify-center overflow-hidden min-h-[62vh] relative">
            {isPdf ? (
              <SecurePdfViewer 
                url={file.path} 
                title={file.name} 
                onSecurityWarning={(msg) => setSecurityWarning(msg)} 
              />
            ) : isLink ? (
              <div className="text-center bg-slate-900 p-8 md:p-14 rounded-2xl shadow-xl border border-slate-800 max-w-xl mx-auto w-full animate-modal-card m-4">
                <div className="w-20 h-20 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                  <Globe className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-2xl text-slate-100 mb-3">External Academic Resource</h3>
                <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                  You are about to navigate to an external university database or academic partner repository to access <span className="font-semibold text-amber-300">{file.name}</span>.
                </p>
                <a 
                  href={file.path} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold shadow-lg bg-blue-600 hover:bg-blue-500 text-white hover:-translate-y-0.5 transition-all text-sm cursor-pointer"
                  onClick={onClose}
                >
                  <span>Proceed to External Website</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <div className="text-center text-slate-400 p-8">
                <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <p className="font-semibold text-slate-200">Preview not available for this file format.</p>
                <p className="text-xs text-slate-500 mt-2 font-mono">File: {file.name}</p>
                <p className="text-xs text-amber-400/80 mt-4">Protected by JRMSU Library collection policy.</p>
              </div>
            )}
          </div>

          {/* Next File Carousel Button */}
          {safeIdx < fileList.length - 1 && (
            <button
              onClick={() => onNavigate(fileList[safeIdx + 1])}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-800/80 hover:bg-blue-600 text-white shadow-xl backdrop-blur transition-all hover:scale-105 cursor-pointer border border-slate-600"
              aria-label="Next file"
              title="Next File"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
