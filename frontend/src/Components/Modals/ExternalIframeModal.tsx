import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Loader2, RefreshCw } from 'lucide-react';

interface ExternalIframeModalProps {
  title: string;
  url: string;
  proxyUrl?: string;
  onClose: () => void;
}

export const ExternalIframeModal: React.FC<ExternalIframeModalProps> = ({
  title,
  url,
  proxyUrl,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  // If iframe fails to load after timeout, show fallback
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setLoadError(true);
        setIsLoading(false);
      }
    }, 20000);
    return () => clearTimeout(timeout);
  }, [isLoading, iframeKey]);

  const handleReconnect = () => {
    setIsLoading(true);
    setLoadError(false);
    setIframeKey((prev) => prev + 1);
  };

  // Use the proxy URL if provided, otherwise fall back to direct URL
  const iframeSrc = proxyUrl || url;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} viewer`}
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-6xl h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-navy to-navy-dark">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
              <ExternalLink size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">{title}</h2>
              <p className="text-white/60 text-xs truncate max-w-md">{url}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Reconnect Button */}
            <button
              onClick={handleReconnect}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 text-white text-xs font-medium hover:bg-white/25 transition-colors cursor-pointer"
              title="Reconnect / Refresh session"
            >
              <RefreshCw size={12} /> Reconnect
            </button>
            {/* Open in New Tab */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 text-white text-xs font-medium hover:bg-white/25 transition-colors cursor-pointer"
            >
              <ExternalLink size={12} /> Open in New Tab
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative bg-gray-50">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
              <Loader2 className="animate-spin text-navy mb-3" size={32} />
              <p className="text-gray-600 text-sm font-medium">
                Connecting to {title}...
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Authenticating your session securely
              </p>
            </div>
          )}

          {loadError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 px-8 text-center">
              <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mb-4">
                <ExternalLink size={28} className="text-navy" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Unable to Load in Preview
              </h3>
              <p className="text-gray-500 text-sm max-w-md mb-6">
                This website requires authentication or does not allow embedded viewing.
                Please open it in a new browser tab to access the content.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy text-white font-bold text-sm hover:bg-navy-dark transition-colors cursor-pointer shadow-lg"
                >
                  <ExternalLink size={16} /> Open {title} in New Tab
                </a>
                <button
                  onClick={handleReconnect}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-navy text-navy font-bold text-sm hover:bg-navy/5 transition-colors cursor-pointer"
                >
                  <RefreshCw size={16} /> Retry Connection
                </button>
              </div>
            </div>
          ) : (
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={iframeSrc}
              title={title}
              className="w-full h-full border-0"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setLoadError(true);
                setIsLoading(false);
              }}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
