import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { apiClient } from '@/src/Libs/apiClient';

// We dynamically import pdfjs to avoid bloating the main bundle
import * as pdfjsLib from 'pdfjs-dist';
// Define worker source for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface ReferenceFileViewerModalProps {
  referenceId: number;
  fileName: string;
  onClose: () => void;
}

export function ReferenceFileViewerModal({ referenceId, fileName, onClose }: ReferenceFileViewerModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  
  // PDF state
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const isPdf = fileName.toLowerCase().endsWith('.pdf');

  useEffect(() => {
    const fetchPreview = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiClient(`/research-references/${referenceId}/preview/`);
        
        if (result.redirect) {
          // It's a PDF, we need to fetch the blob manually if it requires auth, 
          // or just load the URL via PDF.js if it's public.
          // Media URLs are public in this app.
          loadPdf(result.redirect);
        } else if (result.html) {
          // It's a Docx converted to HTML
          setHtmlContent(result.html);
          setLoading(false);
        } else {
          setError('Preview not supported for this file type.');
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load document preview.');
        setLoading(false);
      }
    };

    fetchPreview();
  }, [referenceId]);

  const loadPdf = async (url: string) => {
    try {
      const loadingTask = pdfjsLib.getDocument({ url });
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      setPageNumber(1);
      setLoading(false);
    } catch (err: any) {
      setError('Failed to load PDF document.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pdfDoc && canvasRef.current) {
      renderPage(pageNumber);
    }
  }, [pdfDoc, pageNumber]);

  const renderPage = async (num: number) => {
    if (!pdfDoc || !canvasRef.current) return;
    
    try {
      const page = await pdfDoc.getPage(num);
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
        canvasContext: ctx,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
    } catch (err) {
      console.error('Error rendering page:', err);
    }
  };

  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages));

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-[9999] animate-modal-overlay" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-modal-card" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-[#002B7F] text-white p-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold truncate pr-4">{fileName}</h2>
            <p className="text-blue-200 text-xs mt-0.5 uppercase tracking-wider font-medium">Read-Only Preview</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0">
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 flex flex-col relative">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 z-10">
              <Loader2 className="animate-spin text-[#002B7F] mb-4" size={40} />
              <p className="text-gray-600 font-medium animate-pulse">Loading document...</p>
            </div>
          )}
          
          {error && (
            <div className="m-auto text-center p-8 bg-red-50 rounded-xl border border-red-200 max-w-md">
              <p className="text-red-700 font-bold mb-2">Unable to Preview</p>
              <p className="text-sm text-red-600 mb-6">{error}</p>
              <button onClick={onClose} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                Close Viewer
              </button>
            </div>
          )}

          {/* HTML Preview (DOCX / PPTX generated by backend) */}
          {htmlContent && !loading && !error && (
            <div 
              className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 prose max-w-none w-full mx-auto"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}

          {/* PDF Preview */}
          {pdfDoc && !loading && !error && (
            <div className="flex flex-col items-center w-full">
              {/* PDF Toolbar */}
              <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 mb-4 sticky top-0 z-10">
                <button 
                  onClick={goToPrevPage} 
                  disabled={pageNumber <= 1}
                  className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-bold text-gray-700 min-w-[80px] text-center">
                  Page {pageNumber} of {numPages}
                </span>
                <button 
                  onClick={goToNextPage} 
                  disabled={pageNumber >= numPages}
                  className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Canvas Container */}
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 inline-block">
                <canvas ref={canvasRef} className="max-w-full" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
