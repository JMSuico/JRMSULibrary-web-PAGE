import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, ChevronLeft, ChevronRight, ShieldAlert, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/src/Libs/apiClient';

// We dynamically import pdfjs to avoid bloating the main bundle
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const PDF_RANGE_CHUNK_BYTES = 524288; // 512 KB range chunks for fast sub-2s first-page display

interface ReferenceFileViewerModalProps {
  referenceId: number;
  fileName: string;
  onClose: () => void;
}

const isBlockedReferenceShortcut = (e: KeyboardEvent): boolean => {
  const key = e.key.toLowerCase();
  const hasPrimaryModifier = e.ctrlKey || e.metaKey;
  return (
    e.key === 'F12' ||
    key === 'f12' ||
    (hasPrimaryModifier && e.shiftKey && (key === 'i' || key === 'c' || key === 'j')) ||
    (e.metaKey && e.altKey && (key === 'i' || key === 'c' || key === 'j')) ||
    (hasPrimaryModifier && (key === 'u' || key === 's' || key === 'p'))
  );
};

const isRenderingCancelled = (err: unknown): boolean =>
  typeof err === 'object' &&
  err !== null &&
  'name' in err &&
  (err as { name: unknown }).name === 'RenderingCancelledException';

export function ReferenceFileViewerModal({ referenceId, fileName, onClose }: ReferenceFileViewerModalProps) {
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState<number>(18);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);

  // PDF state
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const loadingTaskRef = useRef<pdfjsLib.PDFDocumentLoadingTask | null>(null);

  const isPdf = fileName.toLowerCase().endsWith('.pdf');

  // Auto-dismiss security warnings after 3.5 seconds
  useEffect(() => {
    if (securityWarning) {
      const timer = setTimeout(() => setSecurityWarning(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [securityWarning]);

  // Body scroll lock & print suppression marker class while modal is mounted
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.classList.add('readonly-viewer-active');
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('readonly-viewer-active');
    };
  }, []);

  // Defense-in-depth keyboard shortcut suppression for read-only viewer (Inspect, View-Source, Save, Print)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isBlockedReferenceShortcut(e)) {
        e.preventDefault();
        e.stopPropagation();
        setSecurityWarning('Inspect, save, and print shortcuts are disabled to protect JRMSU Library collection materials.');
        return;
      }

      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onClose]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setHtmlContent(null);
    setPdfDoc(null);

    const loadPdf = async (url: string) => {
      const progressTimer = window.setInterval(() => {
        setLoadProgress((prev) => (prev < 88 ? prev + 12 : prev));
      }, 220);
      try {
        if (loadingTaskRef.current) {
          try {
            Promise.resolve(loadingTaskRef.current.destroy()).catch(() => {});
          } catch {
            // ignore
          }
          loadingTaskRef.current = null;
        }
        const loadingTask = pdfjsLib.getDocument({
          url,
          disableAutoFetch: true,
          disableStream: false,
          disableRange: false,
          rangeChunkSize: PDF_RANGE_CHUNK_BYTES,
        });
        loadingTask.onProgress = (progressData: { loaded: number; total?: number }) => {
          if (!isMounted) return;
          if (progressData.total && progressData.total > 0) {
            const pct = Math.min(92, Math.max(20, Math.round((progressData.loaded / progressData.total) * 100)));
            setLoadProgress((prev) => Math.max(prev, pct));
          } else if (progressData.loaded > 0) {
            setLoadProgress((prev) => Math.min(90, prev + 10));
          }
        };
        loadingTaskRef.current = loadingTask;
        const pdf = await loadingTask.promise;
        window.clearInterval(progressTimer);
        if (!isMounted) {
          try {
            Promise.resolve(loadingTask.destroy()).catch(() => {});
          } catch {
            // ignore
          }
          return;
        }
        setLoadProgress(95);
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setPageNumber(1);
      } catch {
        window.clearInterval(progressTimer);
        if (!isMounted) return;
        setError('Failed to load PDF document.');
        setLoading(false);
      }
    };

    const fetchPreview = async () => {
      try {
        const result = await apiClient(`/research-references/${referenceId}/preview/`);
        if (!isMounted) return;

        if (result.redirect) {
          // It's a PDF, load the URL via PDF.js
          await loadPdf(result.redirect);
        } else if (result.html) {
          // It's a Docx converted to HTML
          setHtmlContent(result.html);
          setLoading(false);
        } else {
          setError('Preview not supported for this file type.');
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : 'Failed to load document preview.';
        setError(message);
        setLoading(false);
      }
    };

    fetchPreview();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
        renderTaskRef.current = null;
      }
      if (loadingTaskRef.current) {
        try {
          Promise.resolve(loadingTaskRef.current?.destroy()).catch(() => {});
        } catch {
          // ignore
        }
        loadingTaskRef.current = null;
      }
    };
  }, [referenceId]);

  useEffect(() => {
    let isCancelled = false;
    if (pdfDoc && canvasRef.current) {
      renderPage(pageNumber, () => isCancelled);
    }
    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, pageNumber]);

  const renderPage = async (num: number, isCancelled: () => boolean = () => false) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Ignore cancellation
        }
        renderTaskRef.current = null;
      }

      const page = await pdfDoc.getPage(num);
      if (isCancelled() || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Calculate scale to fit container width (max 800px)
      const containerWidth = Math.min(window.innerWidth * 0.9, 800) - 64; // subtract padding
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      const scale = containerWidth / unscaledViewport.width;

      const viewport = page.getViewport({ scale });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvas,
        canvasContext: ctx,
        viewport: viewport
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      await renderTask.promise;
      if (isCancelled()) return;

      setLoadProgress(100);
      setLoading(false);

      if (num < pdfDoc.numPages) {
        pdfDoc.getPage(num + 1).catch(() => {});
      }

      // Institutional Watermark directly drawn onto Canvas
      ctx.save();
      ctx.translate(viewport.width / 2, viewport.height / 2);
      ctx.rotate((-35 * Math.PI) / 180);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const fontSize = Math.max(14, Math.floor(viewport.width / 32));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = 'rgba(0, 43, 127, 0.15)'; // Primary Navy #002B7F with 15% opacity
      ctx.fillText('JRMSU KATIPUNAN CAMPUS LIBRARY • OFFICIAL READ-ONLY PATRON COPY • DO NOT DISTRIBUTE', 0, 0);
      ctx.restore();
    } catch (err: unknown) {
      if (!isRenderingCancelled(err) && !isCancelled()) {
        console.error('Error rendering page:', err);
      }
    }
  };

  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages));

  return createPortal(
    <div
      data-readonly-viewer="true"
      className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-[9999] animate-modal-overlay readonly-viewer-surface select-none"
      onClick={onClose}
      onDragStart={(e) => e.preventDefault()}
      onContextMenu={(e) => {
        e.preventDefault();
        setSecurityWarning('Right-click is disabled to protect JRMSU Library collection materials.');
      }}
    >
      {/* Real-Time Floating Security Warning Toast */}
      {securityWarning && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-amber-950/95 text-amber-200 border border-amber-400/50 px-5 py-3 rounded-2xl shadow-2xl z-[10001] text-xs font-semibold flex items-center gap-2.5 animate-bounce max-w-md text-center pointer-events-none">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{securityWarning}</span>
        </div>
      )}

      {/* Clean White Modal Card with Subtle Shadow */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-modal-card border border-gray-100 select-none relative"
        onClick={e => e.stopPropagation()}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setSecurityWarning?.('Right-click is disabled to protect JRMSU Library collection materials.');
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`Viewing: ${fileName}`}
      >
        {/* Header - JRMSU Primary Navy #002B7F */}
        <div className="bg-[#002B7F] text-white p-4 sm:px-6 sm:py-4 flex justify-between items-center shrink-0 border-b border-[#002266]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-white/10 rounded-lg shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-200" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold truncate pr-4 text-white">{fileName}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-blue-200 text-xs uppercase tracking-wider font-semibold">
                  JRMSU Katipunan • Read-Only Patron Copy
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0"
            aria-label="Close viewer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 flex flex-col relative"
          onDragStart={(e) => e.preventDefault()}
          onContextMenu={(e) => {
            e.preventDefault();
            setSecurityWarning?.('Right-click is disabled to protect JRMSU Library collection materials.');
          }}
        >
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/95 z-10 p-6">
              <div className="bg-white border border-blue-100 shadow-xl rounded-2xl px-8 py-7 max-w-md w-full flex flex-col items-center text-center">
                <Loader2 className="animate-spin text-[#002B7F] mb-3" size={38} />
                <p className="text-gray-800 text-sm font-bold mb-1">Opening Protected Document...</p>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4 px-2">{fileName}</p>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-gradient-to-r from-[#002B7F] to-blue-500 h-full rounded-full transition-all duration-200"
                    style={{ width: `${Math.min(100, Math.max(15, loadProgress))}%` }}
                  />
                </div>
                <p className="text-[11px] font-semibold text-[#002B7F]">
                  Streaming first page ({Math.min(100, Math.max(15, loadProgress))}%) — Please wait a moment
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="m-auto text-center p-8 bg-red-50 rounded-xl border border-red-200 max-w-md">
              <p className="text-red-700 font-bold mb-2">Unable to Preview</p>
              <p className="text-sm text-red-600 mb-6">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Close Viewer
              </button>
            </div>
          )}

          {/* HTML Preview (DOCX / PPTX generated by backend) */}
          {htmlContent && !loading && !error && (
            <div
              className="relative bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200 prose max-w-none w-full mx-auto select-none"
              onDragStart={(e) => e.preventDefault()}
              onContextMenu={(e) => {
                e.preventDefault();
                setSecurityWarning?.('Right-click is disabled to protect JRMSU Library collection materials.');
              }}
            >
              {/* Dynamic Angled Watermark Overlay for HTML */}
              <div
                className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
                style={{ zIndex: 10 }}
                aria-hidden="true"
              >
                <div className="text-[#002B7F]/10 font-black text-sm sm:text-base md:text-xl uppercase tracking-wider text-center rotate-[-35deg] whitespace-nowrap select-none pointer-events-none px-4">
                  JRMSU KATIPUNAN CAMPUS LIBRARY • OFFICIAL READ-ONLY PATRON COPY • DO NOT DISTRIBUTE
                </div>
              </div>
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
          )}

          {/* PDF Preview */}
          {pdfDoc && !error && (
            <div className="flex flex-col items-center w-full">
              {/* PDF Toolbar */}
              <div className="flex items-center gap-4 bg-white px-5 py-2 rounded-full shadow-sm border border-gray-200 mb-4 sticky top-0 z-20">
                <button
                  onClick={goToPrevPage}
                  disabled={pageNumber <= 1}
                  className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30 transition-colors text-gray-700"
                  title="Previous Page"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-bold text-gray-700 min-w-[80px] text-center font-mono">
                  Page {pageNumber} of {numPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={pageNumber >= numPages}
                  className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30 transition-colors text-gray-700"
                  title="Next Page"
                  aria-label="Next page"
                >
                  <ChevronRight size={20} />
                </button>
                <span className="h-4 w-px bg-gray-200" />
                <div className="flex items-center gap-1.5 text-xs text-blue-900 bg-blue-50 px-2.5 py-1 rounded-full font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#002B7F]" />
                  <span>Read-Only</span>
                </div>
              </div>

              {/* Canvas Container with proper padding and responsive sizing */}
              <div
                className="relative bg-white p-3 sm:p-5 rounded-xl shadow-sm border border-gray-200 inline-block max-w-full overflow-hidden"
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSecurityWarning?.('Right-click is disabled to protect JRMSU Library collection materials.');
                }}
                onDragStart={(e) => e.preventDefault()}
              >
                <canvas
                  ref={canvasRef}
                  className="max-w-full block h-auto rounded"
                  style={{
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                  }}
                />

                {/* Transparent Shield guarding against click-jacking & context menu */}
                <div
                  className="absolute inset-0 pointer-events-auto cursor-default"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSecurityWarning?.('Right-click is disabled to protect JRMSU Library collection materials.');
                  }}
                  onDragStart={(e) => e.preventDefault()}
                />

                {/* Diagonal Institutional Watermark Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
                  style={{ zIndex: 10 }}
                  aria-hidden="true"
                >
                  <div className="text-[#002B7F]/15 font-black text-xs sm:text-sm md:text-base lg:text-lg uppercase tracking-wider text-center rotate-[-35deg] whitespace-nowrap select-none pointer-events-none px-4">
                    JRMSU KATIPUNAN CAMPUS LIBRARY • OFFICIAL READ-ONLY PATRON COPY • DO NOT DISTRIBUTE
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Footer Integrity Bar - No download buttons present */}
        <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <span className="truncate max-w-[280px] sm:max-w-md font-medium text-gray-600">
            {fileName}
          </span>
          <div className="flex items-center gap-2 text-[11px] font-mono text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-gray-600 font-semibold">Anti-Download Policy Active</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
