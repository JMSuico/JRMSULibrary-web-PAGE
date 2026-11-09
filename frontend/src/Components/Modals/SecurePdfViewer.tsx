import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker with bundled asset fallback
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
} catch {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '6.4.299'}/pdf.worker.min.mjs`;
}

interface SecurePdfViewerProps {
  url: string;
  title: string;
  onSecurityWarning?: (warning: string) => void;
}

export const SecurePdfViewer: React.FC<SecurePdfViewerProps> = ({ 
  url, 
  title,
  onSecurityWarning 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.15);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [rendering, setRendering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load PDF Document in memory
  const loadPdf = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const loadingTask = pdfjsLib.getDocument({
        url,
        withCredentials: true,
      });

      try {
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setCurrentPage(1);
      } catch (docErr: any) {
        // If demo collection path is missing on disk, fallback to sample.pdf for preview
        if (url.includes('/assets/eBooks/')) {
          console.warn(`File ${url} not found on disk; falling back to sample preview.`);
          const fallbackTask = pdfjsLib.getDocument({
            url: '/assets/sample.pdf',
            withCredentials: true,
          });
          const fallbackDoc = await fallbackTask.promise;
          setPdfDoc(fallbackDoc);
          setNumPages(fallbackDoc.numPages);
          setCurrentPage(1);
        } else {
          throw docErr;
        }
      }
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Failed to load PDF document:', err);
        setError('Unable to load document preview. The file may be protected or unreachable.');
      }
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    loadPdf();
  }, [loadPdf]);

  // Render current page onto HTML5 Canvas with institutional watermark
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      setRendering(true);

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale, rotation });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { alpha: false });

      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      await renderTask.promise;

      // Draw Institutional Watermark directly onto canvas pixels
      context.save();
      context.translate(viewport.width / 2, viewport.height / 2);
      context.rotate((-35 * Math.PI) / 180);
      context.textAlign = 'center';
      context.font = 'bold 24px sans-serif';
      context.fillStyle = 'rgba(0, 43, 127, 0.08)';
      context.fillText('KATIPUNAN CAMPUS LIBRARY', 0, -25);
      context.fillText('READ-ONLY PATRON COPY - DO NOT REPRODUCE', 0, 25);
      context.restore();

    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Error rendering page onto canvas:', err);
      }
    } finally {
      setRendering(false);
    }
  }, [pdfDoc, currentPage, scale, rotation]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Anti-download keyboard shortcut suppression
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isSave = (e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S');
      const isPrint = (e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P');
      const isViewSource = (e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U');
      const isInspect = e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'C', 'c', 'J', 'j'].includes(e.key));

      if (isSave || isPrint || isViewSource || isInspect) {
        e.preventDefault();
        e.stopPropagation();
        onSecurityWarning?.(
          'Downloading, printing, and inspecting this document are restricted to protect library collection materials.'
        );
      }

      if (e.key === 'PageDown' || e.key === 'ArrowRight') {
        setCurrentPage((prev) => Math.min(prev + 1, numPages));
      } else if (e.key === 'PageUp' || e.key === 'ArrowLeft') {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
      } else if (e.key === '+' || e.key === '=') {
        setScale((prev) => Math.min(prev + 0.15, 2.5));
      } else if (e.key === '-' || e.key === '_') {
        setScale((prev) => Math.max(prev - 0.15, 0.6));
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [numPages, onSecurityWarning]);

  const goToPage = (page: number) => {
    const target = Math.max(1, Math.min(page, numPages));
    setCurrentPage(target);
  };

  return (
    <div 
      ref={containerRef}
      className="flex flex-col items-center justify-center w-full h-full select-none relative"
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSecurityWarning?.('Right-click is disabled to protect JRMSU Library collection materials.');
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
          <span className="material-symbols-outlined text-4xl text-blue-900 animate-spin">
            progress_activity
          </span>
          <p className="text-sm font-semibold text-blue-950">Loading document...</p>
          <p className="text-xs text-gray-400">Rendering secure patron view</p>
        </div>
      ) : error ? (
        <div className="max-w-md p-8 bg-white border border-gray-200 rounded-2xl text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-red-500 mb-3">
            error_outline
          </span>
          <h4 className="text-base font-bold text-gray-900 mb-1">Preview Unavailable</h4>
          <p className="text-xs text-gray-600 mb-5">{error}</p>
          <button
            onClick={loadPdf}
            className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Retry Document
          </button>
        </div>
      ) : (
        <div className="relative inline-block shadow-lg rounded-xl overflow-hidden bg-white border border-gray-200 transition-all duration-150 my-auto">
          {/* Pure HTML5 Canvas Rendering */}
          <canvas 
            ref={canvasRef} 
            className="block max-w-full" 
            style={{
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          />

          {/* Shimmer loading overlay during page flip */}
          {rendering && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-blue-900 animate-spin">
                progress_activity
              </span>
            </div>
          )}

          {/* Transparent Click Shield & Context-Menu Interceptor */}
          <div 
            className="absolute inset-0 pointer-events-auto cursor-default z-10"
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSecurityWarning?.('Right-click is disabled to protect JRMSU Library collection materials.');
            }}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
      )}

      {/* Elegant Floating Toolbar (JRMSU Brand Colors) */}
      {!loading && !error && numPages > 0 && (
        <div className="sticky bottom-3 mt-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 shadow-xl flex items-center gap-3 z-20 text-xs font-medium text-gray-700 animate-fade-in">
          {/* Page Navigation */}
          <div className="flex items-center gap-1.5 border-r border-gray-200 pr-3">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1 rounded-full hover:bg-blue-50 text-blue-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Previous Page (PageUp / Left Arrow)"
            >
              <span className="material-symbols-outlined text-lg leading-none">chevron_left</span>
            </button>
            <span className="font-mono font-bold text-blue-950 px-1">
              {currentPage} / {numPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= numPages}
              className="p-1 rounded-full hover:bg-blue-50 text-blue-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Next Page (PageDown / Right Arrow)"
            >
              <span className="material-symbols-outlined text-lg leading-none">chevron_right</span>
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1.5 border-r border-gray-200 pr-3">
            <button
              onClick={() => setScale((s) => Math.max(s - 0.15, 0.6))}
              disabled={scale <= 0.6}
              className="p-1 rounded-full hover:bg-blue-50 text-blue-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Zoom Out (-)"
            >
              <span className="material-symbols-outlined text-base leading-none">zoom_out</span>
            </button>
            <span className="font-mono text-[11px] text-gray-600 w-10 text-center font-bold">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(s + 0.15, 2.5))}
              disabled={scale >= 2.5}
              className="p-1 rounded-full hover:bg-blue-50 text-blue-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Zoom In (+)"
            >
              <span className="material-symbols-outlined text-base leading-none">zoom_in</span>
            </button>
            <button
              onClick={() => setScale(1.15)}
              className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-900 hover:bg-blue-100 transition-colors cursor-pointer"
              title="Reset Zoom"
            >
              Reset
            </button>
          </div>

          {/* Rotate Control */}
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-1 rounded-full hover:bg-blue-50 text-blue-900 cursor-pointer transition-colors"
            title="Rotate Page"
          >
            <span className="material-symbols-outlined text-base leading-none">rotate_right</span>
          </button>
        </div>
      )}
    </div>
  );
};
