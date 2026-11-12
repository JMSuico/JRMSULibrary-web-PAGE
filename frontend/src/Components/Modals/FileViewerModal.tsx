import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { TreeNodeData } from '@/src/Libs/Assets/treeData';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

interface FileViewerModalProps {
  file: TreeNodeData;
  fileList: TreeNodeData[];
  onClose: () => void;
  onNavigate: (file: TreeNodeData) => void;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({ file, fileList, onClose, onNavigate }) => {
  // Robust index locator matching path, name, or filename basename
  const currentIdx = fileList.findIndex((f) => 
    f.path === file.path || 
    f.name === file.name || 
    (Boolean(f.path) && Boolean(file.path) && f.path.split('/').pop() === file.path.split('/').pop())
  );
  const safeIdx = currentIdx >= 0 ? currentIdx : 0;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Suppress save, print, view-source, and inspect devtools shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
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
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore cancellation
        }
      }
    };
  }, [handleKeyDown]);

  if (!file.path) return null;

  const isPdf = file.path.toLowerCase().endsWith('.pdf');
  const isLink = file.path.startsWith('http://') || file.path.startsWith('https://');

  // Load PDF in memory buffer to bypass all iframe restrictions and hide downloadable URLs from inspect
  useEffect(() => {
    if (!isPdf || !file.path) {
      setPdfDoc(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadDocument = async () => {
      try {
        let pdfData: Uint8Array | null = null;

        // Fetch document bytes into memory buffer
        try {
          const res = await fetch(file.path);
          if (res.ok) {
            const buf = await res.arrayBuffer();
            pdfData = new Uint8Array(buf);
          }
        } catch {
          // fetch failed, fallback to url direct load
        }

        const loadParams = pdfData ? { data: pdfData } : { url: file.path };
        const loadingTask = pdfjsLib.getDocument(loadParams);
        const doc = await loadingTask.promise;

        if (isMounted) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setPageNumber(1);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Failed to load PDF into canvas:', err);
        if (isMounted) {
          setError('Unable to load document. The file may be unavailable.');
          setLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      isMounted = false;
    };
  }, [file.path, isPdf]);

  // Render current page onto HTML5 Canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isCancelled = false;

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // ignore
          }
        }

        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Scale page to fit cleanly within modal container
        const containerWidth = Math.min(window.innerWidth * 0.9, 920) - 48;
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const scale = containerWidth / unscaledViewport.width;
        const viewport = page.getViewport({ scale: Math.min(scale, 1.4) });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;

        // Subtle institutional security watermark rendered onto canvas pixels
        ctx.save();
        ctx.translate(viewport.width / 2, viewport.height / 2);
        ctx.rotate((-35 * Math.PI) / 180);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const fontSize = Math.max(13, Math.floor(viewport.width / 36));
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = 'rgba(0, 43, 127, 0.08)';
        ctx.fillText('JRMSU KATIPUNAN CAMPUS LIBRARY • READ-ONLY PATRON COPY', 0, 0);
        ctx.restore();
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Canvas render error:', err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, pageNumber]);

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
            className="flex-1 bg-gray-100 p-4 flex flex-col items-center justify-center overflow-auto min-h-[60vh] relative"
            onContextMenu={(e) => e.preventDefault()}
          >
            {isPdf ? (
              loading ? (
                <div className="flex flex-col items-center justify-center gap-2 text-gray-500 py-12">
                  <span className="material-symbols-outlined animate-spin text-3xl text-blue-600">progress_activity</span>
                  <span className="text-sm font-medium">Opening document for reading...</span>
                </div>
              ) : error ? (
                <div className="text-center text-gray-500 py-12">
                  <span className="material-symbols-outlined text-5xl mb-2 text-gray-400">description</span>
                  <p className="font-medium">{error}</p>
                  <p className="text-xs text-gray-400 mt-1">File: {file.name}</p>
                </div>
              ) : (
                <div className="relative flex flex-col items-center justify-center w-full my-auto">
                  {/* Clean Canvas Paper Container */}
                  <div className="relative inline-block shadow-lg rounded bg-white overflow-hidden my-2">
                    <canvas 
                      ref={canvasRef} 
                      className="block max-w-full rounded" 
                      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                    />
                    {/* Invisible Shield Over Canvas to block inspect or click interactions */}
                    <div 
                      className="absolute inset-0 z-10 cursor-default" 
                      onContextMenu={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  </div>

                  {/* Clean Floating Reader Controls */}
                  {numPages > 1 && (
                    <div className="sticky bottom-2 mt-2 bg-white/95 backdrop-blur border border-gray-200 shadow-md px-4 py-1.5 rounded-full flex items-center gap-3 z-20 text-xs text-gray-700 font-medium">
                      <button 
                        onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                        disabled={pageNumber <= 1}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 cursor-pointer transition-colors"
                        title="Previous Page"
                      >
                        <span className="material-symbols-outlined text-base align-middle">chevron_left</span>
                      </button>
                      <span className="font-mono">Page {pageNumber} of {numPages}</span>
                      <button 
                        onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                        disabled={pageNumber >= numPages}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 cursor-pointer transition-colors"
                        title="Next Page"
                      >
                        <span className="material-symbols-outlined text-base align-middle">chevron_right</span>
                      </button>
                    </div>
                  )}
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
              <div className="text-center text-gray-500 py-12">
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
