import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { TreeNodeData } from '@/src/Libs/Assets/treeData';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface FileViewerModalProps {
  file: TreeNodeData;
  fileList: TreeNodeData[];
  onClose: () => void;
  onNavigate: (file: TreeNodeData) => void;
}

const PDF_RANGE_CHUNK_BYTES = 524288; // 512 KB range chunks for sub-2s first-page load
const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2.2;
const ZOOM_STEP = 0.2;

const normalizeSafePdfUrl = (rawPath: string): string | null => {
  const trimmed = rawPath.trim();
  if (!trimmed || trimmed.startsWith('//')) {
    return null;
  }
  try {
    const resolved = new URL(trimmed, window.location.origin);
    if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') {
      return null;
    }
    return resolved.href;
  } catch {
    return null;
  }
};

const isBlockedViewerShortcut = (e: KeyboardEvent): boolean => {
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

export const FileViewerModal: React.FC<FileViewerModalProps> = ({ file, fileList, onClose, onNavigate }) => {
  const currentIdx = fileList.findIndex((f) =>
    f.path === file.path ||
    f.name === file.name ||
    (Boolean(f.path) && Boolean(file.path) && f.path.split('/').pop() === file.path.split('/').pop())
  );
  const safeIdx = currentIdx >= 0 ? currentIdx : 0;

  const isPdf = Boolean(file.path && file.path.toLowerCase().endsWith('.pdf'));
  const isLink = Boolean(file.path && (file.path.startsWith('http://') || file.path.startsWith('https://')));
  const safeDirectUrl = isPdf && file.path ? normalizeSafePdfUrl(file.path) : null;

  const [loading, setLoading] = useState<boolean>(Boolean(safeDirectUrl));
  const [loadProgress, setLoadProgress] = useState<number>(15);
  const [renderingPage, setRenderingPage] = useState<boolean>(false);
  const [useIframeFallback, setUseIframeFallback] = useState<boolean>(false);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>('1');
  const [zoom, setZoom] = useState<number>(1.0);

  const viewportContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadingTaskRef = useRef<pdfjsLib.PDFDocumentLoadingTask | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  // Defense-in-depth read-only keyboard guard: block Inspect, View-Source, Save, and Print shortcuts.
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isBlockedViewerShortcut(e)) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    const activeTag = (document.activeElement as HTMLElement | null)?.tagName?.toLowerCase();
    if (activeTag === 'input' || activeTag === 'textarea') {
      if (e.key === 'Escape') onClose();
      return;
    }

    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && safeIdx > 0) onNavigate(fileList[safeIdx - 1]);
    if (e.key === 'ArrowRight' && safeIdx < fileList.length - 1) onNavigate(fileList[safeIdx + 1]);
    if (e.key === 'PageDown' && numPages > 0) setPageNumber((p) => Math.min(p + 1, numPages));
    if (e.key === 'PageUp' && numPages > 0) setPageNumber((p) => Math.max(p - 1, 1));
  }, [onClose, onNavigate, safeIdx, fileList, numPages]);

  useEffect(() => {
    if (!file.path) return;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('readonly-viewer-active');
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('readonly-viewer-active');
    };
  }, [file.path]);

  useEffect(() => {
    if (!file.path) return;
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [file.path, handleKeyDown]);

  // Progressive HTTP 206 Range PDF loader (fetches only required page bytes instead of full PDF).
  useEffect(() => {
    let isMounted = true;
    setUseIframeFallback(false);
    setPdfDoc(null);
    setNumPages(0);
    setPageNumber(1);
    setPageInput('1');
    setZoom(1.0);

    if (!safeDirectUrl) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadProgress(18);

    const progressInterval = window.setInterval(() => {
      setLoadProgress((prev) => (prev < 88 ? prev + 12 : prev));
    }, 220);

    let fallbackRevealTimer: number | null = null;

    if (loadingTaskRef.current) {
      try {
        Promise.resolve(loadingTaskRef.current.destroy()).catch(() => {});
      } catch {
        // ignore cleanup error
      }
      loadingTaskRef.current = null;
    }

    const loadingTask = pdfjsLib.getDocument({
      url: safeDirectUrl,
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

    loadingTask.promise
      .then((doc) => {
        window.clearInterval(progressInterval);
        if (!isMounted) {
          Promise.resolve(loadingTask.destroy()).catch(() => {});
          return;
        }
        setLoadProgress(95);
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setPageNumber(1);
        setPageInput('1');
      })
      .catch(() => {
        window.clearInterval(progressInterval);
        if (!isMounted) return;
        // Graceful fallback with native PDF toolbar hidden — keep loading state visible until ready
        setUseIframeFallback(true);
        setLoadProgress(85);
        fallbackRevealTimer = window.setTimeout(() => {
          if (isMounted) {
            setLoadProgress(100);
            setLoading(false);
          }
        }, 1600);
      });

    return () => {
      isMounted = false;
      window.clearInterval(progressInterval);
      if (fallbackRevealTimer !== null) {
        window.clearTimeout(fallbackRevealTimer);
      }
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
          Promise.resolve(loadingTaskRef.current.destroy()).catch(() => {});
        } catch {
          // ignore
        }
        loadingTaskRef.current = null;
      }
    };
  }, [safeDirectUrl]);

  // Render active page onto read-only canvas and prefetch next page silently.
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let cancelled = false;

    const renderActivePage = async () => {
      setRenderingPage(true);
      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // ignore
          }
          renderTaskRef.current = null;
        }

        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const containerClientWidth = viewportContainerRef.current ? viewportContainerRef.current.clientWidth : 0;
        const hostWidth = containerClientWidth > 64
          ? Math.max(320, containerClientWidth - 48)
          : Math.min(window.innerWidth * 0.85, 860);
        const targetWidth = Math.min(hostWidth, 880) * zoom;
        const baseViewport = page.getViewport({ scale: 1.0 });
        const cssScale = targetWidth / baseViewport.width;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

        const cssViewport = page.getViewport({ scale: cssScale });
        const renderViewport = page.getViewport({ scale: cssScale * dpr });

        canvas.width = Math.floor(renderViewport.width);
        canvas.height = Math.floor(renderViewport.height);
        canvas.style.width = `${Math.floor(cssViewport.width)}px`;
        canvas.style.height = `${Math.floor(cssViewport.height)}px`;

        const renderTask = page.render({
          canvas,
          canvasContext: ctx,
          viewport: renderViewport,
        });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        if (cancelled) return;

        setLoadProgress(100);
        setLoading(false);
        setRenderingPage(false);

        if (viewportContainerRef.current) {
          viewportContainerRef.current.scrollTop = 0;
        }

        // Prefetch next page metadata/bytes in background for snappy page turns
        if (pageNumber < pdfDoc.numPages) {
          pdfDoc.getPage(pageNumber + 1).catch(() => {});
        }
      } catch (err: unknown) {
        if (!cancelled && !isRenderingCancelled(err)) {
          setUseIframeFallback(true);
          setLoading(false);
          setRenderingPage(false);
        }
      }
    };

    renderActivePage();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, pageNumber, zoom]);

  const goToPage = (target: number) => {
    if (numPages <= 0) return;
    const clamped = Math.max(1, Math.min(target, numPages));
    setPageNumber(clamped);
    setPageInput(String(clamped));
  };

  const handlePageJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!Number.isNaN(parsed)) {
      goToPage(parsed);
    } else {
      setPageInput(String(pageNumber));
    }
  };

  if (!file.path) return null;

  const fallbackIframeUrl = safeDirectUrl ? `${safeDirectUrl}#toolbar=0&navpanes=0&scrollbar=1` : null;

  return createPortal(
    <div
      data-readonly-viewer="true"
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-modal-overlay z-[9999] readonly-viewer-surface select-none"
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl max-h-[92vh] flex flex-col animate-modal-card select-none"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
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
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold tracking-wide text-blue-100">
              <span className="material-symbols-outlined text-[13px]">lock</span>
              Read-Only
            </span>
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

        {/* Read-Only PDF Controls Toolbar (no Download or Print buttons) */}
        {isPdf && safeDirectUrl && !useIframeFallback && numPages > 0 && (
          <div className="bg-slate-800 text-slate-100 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-700 shrink-0 select-none">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => goToPage(pageNumber - 1)}
                disabled={pageNumber <= 1}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Previous page (PageUp)"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
                Prev
              </button>
              <form onSubmit={handlePageJumpSubmit} className="flex items-center gap-1.5 px-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onBlur={() => setPageInput(String(pageNumber))}
                  aria-label="Current page number"
                  className="w-12 text-center bg-slate-900 border border-slate-600 rounded px-1.5 py-0.5 text-white focus:outline-none focus:border-blue-400"
                />
                <span className="text-slate-300">/ {numPages}</span>
              </form>
              <button
                type="button"
                onClick={() => goToPage(pageNumber + 1)}
                disabled={pageNumber >= numPages}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Next page (PageDown)"
              >
                Next
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)))}
                disabled={zoom <= MIN_ZOOM}
                className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 cursor-pointer"
                aria-label="Zoom out"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => setZoom(1.0)}
                className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 font-mono min-w-[54px] text-center cursor-pointer"
                title="Reset zoom to 100%"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)))}
                disabled={zoom >= MAX_ZOOM}
                className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 cursor-pointer"
                aria-label="Zoom in"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Navigation + Viewer */}
        <div className="flex items-stretch flex-1 min-h-0 relative">
          {safeIdx > 0 && (
            <button
              onClick={() => onNavigate(fileList[safeIdx - 1])}
              className="carousel-nav-btn absolute left-4 top-1/2 -translate-y-1/2 z-20 cursor-pointer"
              aria-label="Previous file"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
          )}

          <div
            ref={viewportContainerRef}
            className="flex-1 bg-slate-200 p-4 sm:p-6 flex flex-col items-center overflow-auto min-h-[60vh] relative select-none"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          >
            {isPdf && safeDirectUrl ? (
              <div className="relative w-full h-full flex-1 self-stretch flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
                {useIframeFallback && fallbackIframeUrl ? (
                  <iframe
                    key={fallbackIframeUrl}
                    src={fallbackIframeUrl}
                    onLoad={() => {
                      setLoadProgress(100);
                      setLoading(false);
                    }}
                    className={`w-full h-full flex-1 rounded-lg shadow-inner bg-white transition-opacity duration-200 ${
                      loading ? 'opacity-0' : 'opacity-100'
                    }`}
                    style={{ minHeight: '60vh' }}
                    title={file.name}
                  />
                ) : (
                  <div className="relative flex flex-col items-center w-full my-auto">
                    <canvas
                      ref={canvasRef}
                      className={`rounded-lg shadow-lg bg-white max-w-full transition-opacity duration-150 ${
                        loading ? 'opacity-0' : 'opacity-100'
                      }`}
                    />
                    {renderingPage && !loading && (
                      <div className="fixed bottom-8 bg-slate-900/85 text-white text-xs px-3.5 py-1.5 rounded-full flex items-center gap-2 pointer-events-none shadow-lg">
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        Rendering page {pageNumber}...
                      </div>
                    )}
                  </div>
                )}

                {loading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100/95 backdrop-blur-xs rounded-xl p-6">
                    <div className="bg-white border border-blue-100 shadow-xl rounded-2xl px-8 py-7 max-w-md w-full flex flex-col items-center text-center">
                      <div className="relative w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-blue-700 text-2xl">menu_book</span>
                        <span className="absolute inset-0 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
                      </div>
                      <p className="text-sm font-bold text-slate-800 mb-1">
                        Opening Document for Reading...
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 px-2">
                        {file.name}
                      </p>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                        <div
                          className="bg-gradient-to-r from-blue-700 to-blue-500 h-full rounded-full transition-all duration-200"
                          style={{ width: `${Math.min(100, Math.max(15, loadProgress))}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-blue-700">
                        Streaming first page ({Math.min(100, Math.max(15, loadProgress))}%) — Please wait a moment
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : isLink ? (
              <div className="text-center bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-gray-200 max-w-xl mx-auto w-full my-auto animate-modal-card">
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
              <div className="text-center text-gray-500 py-12 my-auto">
                <span className="material-symbols-outlined text-6xl mb-4 text-gray-400">description</span>
                <p className="font-medium">Preview not available for this file type.</p>
                <p className="text-sm mt-2">File: {file.name}</p>
              </div>
            )}
          </div>

          {safeIdx < fileList.length - 1 && (
            <button
              onClick={() => onNavigate(fileList[safeIdx + 1])}
              className="carousel-nav-btn absolute right-4 top-1/2 -translate-y-1/2 z-20 cursor-pointer"
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
