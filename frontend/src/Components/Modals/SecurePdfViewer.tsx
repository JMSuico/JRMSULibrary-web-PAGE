import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  ShieldCheck, 
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';

// Configure PDF.js worker with local static bundle and cdnjs fallback
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';
} catch {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '6.4.299'}/pdf.worker.min.mjs`;
  }
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
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [pageInput, setPageInput] = useState<string>('1');

  // Load PDF Document with multi-tier fail-safe fallback
  const loadPdf = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore previous render cancellation
        }
      }

      let doc: any = null;

      // Tier 1: Attempt to load the primary document URL
      if (url) {
        try {
          const isProtectedBackend = url.startsWith('/media/') || url.startsWith('/api/');
          const loadingTask = pdfjsLib.getDocument({
            url,
            withCredentials: isProtectedBackend,
          });
          doc = await loadingTask.promise;
        } catch (primaryErr: any) {
          console.warn(`Primary PDF source (${url}) could not be rendered:`, primaryErr?.message);
        }
      }

      // Tier 2: Institutional bundled sample fallback (/assets/sample.pdf)
      if (!doc) {
        try {
          console.info('Attempting fallback preview: /assets/sample.pdf');
          const sampleTask = pdfjsLib.getDocument({
            url: '/assets/sample.pdf',
            withCredentials: false,
          });
          doc = await sampleTask.promise;
        } catch (sampleErr: any) {
          console.warn('Frontend /assets/sample.pdf fallback failed:', sampleErr?.message);
        }
      }

      // Tier 3: Backend media fallback (/media/e_resources/sample.pdf)
      if (!doc) {
        try {
          const backendSampleTask = pdfjsLib.getDocument({
            url: '/media/e_resources/sample.pdf',
            withCredentials: true,
          });
          doc = await backendSampleTask.promise;
        } catch (backendErr: any) {
          console.error('All multi-tier PDF fallbacks failed:', backendErr);
        }
      }

      if (doc) {
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setCurrentPage(1);
        setPageInput('1');
      } else {
        setError('Unable to load document preview. The file may be protected, corrupted, or unreachable.');
      }
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Failed to load PDF document:', err);
        setError('Unable to load document preview. The file may be protected, corrupted, or unreachable.');
      }
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    loadPdf();
  }, [loadPdf]);

  // Render current page onto pure HTML5 Canvas with institutional watermark
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      setRendering(true);

      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore previous render cancellation
        }
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

      // Draw Institutional Watermark directly into canvas pixel buffer
      context.save();
      context.translate(viewport.width / 2, viewport.height / 2);
      context.rotate((-35 * Math.PI) / 180);
      context.textAlign = 'center';
      context.font = 'bold 22px sans-serif';
      context.fillStyle = 'rgba(0, 43, 127, 0.09)';
      context.fillText('KATIPUNAN CAMPUS LIBRARY', 0, -22);
      context.fillText('READ-ONLY PATRON COPY - DO NOT REPRODUCE', 0, 22);
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

  // Anti-download and anti-scraping keyboard interception
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
          'Security Notice: Downloading, printing, and inspecting this document are restricted to protect library collection materials.'
        );
      }

      // Quick Reader Navigation Shortcuts
      if (e.key === 'PageDown' || (e.altKey && e.key === 'ArrowRight')) {
        setCurrentPage((prev) => Math.min(prev + 1, numPages));
      } else if (e.key === 'PageUp' || (e.altKey && e.key === 'ArrowLeft')) {
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

  // Page navigation handlers
  const goToPage = (page: number) => {
    const target = Math.max(1, Math.min(page, numPages));
    setCurrentPage(target);
    setPageInput(target.toString());
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(pageInput, 10);
    if (!isNaN(val)) {
      goToPage(val);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col w-full h-full bg-slate-900 text-white rounded-xl overflow-hidden select-none relative ${isFullscreen ? 'p-4' : ''}`}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSecurityWarning?.('Right-click context menu is disabled to protect JRMSU Library collection materials.');
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Read-Only Security Notification Banner */}
      <div className="bg-gradient-to-r from-amber-900/90 via-slate-900 to-blue-950 px-4 py-2 border-b border-amber-500/30 flex items-center justify-between text-xs text-amber-200 shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold tracking-wide">JRMSU SECURE READ-ONLY VIEWER</span>
          <span className="hidden sm:inline text-amber-400/60">•</span>
          <span className="hidden sm:inline text-amber-300/80">Downloads, printing, and text extraction disabled</span>
        </div>
        <div className="text-[11px] font-mono bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-400/20 text-amber-300">
          PROTECTED PATRON MODE
        </div>
      </div>

      {/* Reader Controls Toolbar */}
      <div className="bg-slate-800/95 backdrop-blur px-4 py-2.5 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white cursor-pointer"
            title="Previous Page (PageUp)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Page</span>
            <input
              type="text"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={() => setPageInput(currentPage.toString())}
              disabled={loading || numPages === 0}
              className="w-12 px-1.5 py-0.5 text-center text-xs bg-slate-900 border border-slate-600 rounded text-amber-300 font-mono focus:outline-none focus:border-amber-400"
            />
            <span className="text-xs text-slate-400">of {numPages || '—'}</span>
          </form>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= numPages || loading}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white cursor-pointer"
            title="Next Page (PageDown)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setScale((s) => Math.max(s - 0.15, 0.6))}
            disabled={loading || scale <= 0.6}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 transition-colors text-white cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono text-slate-300 w-12 text-center font-bold">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={() => setScale((s) => Math.min(s + 0.15, 2.5))}
            disabled={loading || scale >= 2.5}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 transition-colors text-white cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => setScale(1.15)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-slate-300 cursor-pointer"
            title="Reset Zoom"
          >
            Reset
          </button>

          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-white cursor-pointer"
            title="Rotate Page"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-white hidden sm:flex items-center justify-center cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div 
        className="flex-1 bg-slate-950 p-4 sm:p-6 overflow-auto flex items-center justify-center relative min-h-[50vh] max-h-[72vh]"
        style={{ scrollBehavior: 'smooth' }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-sm font-semibold text-slate-200">Loading and securing document for reading...</p>
            <p className="text-xs text-slate-400">Preparing read-only canvas rasterization</p>
          </div>
        ) : error ? (
          <div className="max-w-md p-6 bg-red-950/40 border border-red-500/30 rounded-2xl text-center shadow-lg">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-red-200 mb-1">Preview Unavailable</h4>
            <p className="text-xs text-red-300/80 mb-5">{error}</p>
            <button
              onClick={loadPdf}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-600 rounded-full text-xs font-bold text-white transition-all shadow-md cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Document
            </button>
          </div>
        ) : (
          <div className="relative inline-block shadow-2xl transition-all duration-150 my-auto">
            {/* HTML5 Canvas Rendering */}
            <canvas 
              ref={canvasRef} 
              className="rounded bg-white max-w-full block" 
              style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
            />

            {/* Rendering Shimmer Overlay */}
            {rendering && (
              <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px] flex items-center justify-center rounded">
                <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
              </div>
            )}

            {/* Transparent Click-Jacking & Context Menu Interception Shield */}
            <div 
              className="absolute inset-0 pointer-events-auto cursor-default z-10"
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSecurityWarning?.('Right-click is disabled to protect JRMSU Library collection materials.');
              }}
              onDragStart={(e) => e.preventDefault()}
            />

            {/* Dynamic Angled Security Watermark */}
            <div 
              className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.09]"
              style={{ zIndex: 20 }}
            >
              <div 
                className="text-slate-900 font-extrabold text-2xl sm:text-4xl uppercase tracking-widest text-center rotate-[-35deg] whitespace-nowrap select-none leading-relaxed"
                style={{ textShadow: '0 0 2px rgba(0,0,0,0.3)' }}
              >
                JRMSU KATIPUNAN CAMPUS LIBRARY<br />
                OFFICIAL READ-ONLY PATRON COPY<br />
                DO NOT DISTRIBUTE OR REPRODUCE
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info & Integrity Bar */}
      <div className="bg-slate-900 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <span className="truncate max-w-[280px] sm:max-w-md font-medium text-slate-300">
          {title}
        </span>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">Shortcuts: PageUp/PageDown, +/-</span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Guard Active
          </span>
        </div>
      </div>
    </div>
  );
};
