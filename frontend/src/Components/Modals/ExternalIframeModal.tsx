import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Loader2, RefreshCw, Copy, Check, AlertTriangle, Mail } from 'lucide-react';

interface ExternalIframeModalProps {
  title: string;
  url: string;
  proxyUrl?: string; // Kept for interface compatibility, but we will bypass it
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
  
  const handleRequestCredentials = () => {
    // Dispatch a custom event that RizalAssistant will listen to
    const event = new CustomEvent('open-rizal-chat', {
      detail: { service: title }
    });
    window.dispatchEvent(event);
  };

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
    }, 8000);
    return () => clearTimeout(timeout);
  }, [isLoading, iframeKey]);

  const handleReconnect = () => {
    setIsLoading(true);
    setLoadError(false);
    setIframeKey((prev) => prev + 1);
  };

  // Ignore the proxyUrl entirely as per user request to directly display the actual links
  const iframeSrc = url;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-[9999] animate-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} viewer`}
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-modal-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-7xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-modal-card">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-navy to-navy-dark gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 shrink-0 bg-white/15 rounded-lg flex items-center justify-center">
              <ExternalLink size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-bold text-lg leading-tight truncate">{title}</h2>
              <p className="text-white/60 text-xs truncate max-w-[200px] sm:max-w-md">{url}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Reconnect Button */}
            <button
              onClick={handleReconnect}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 text-white text-xs font-medium hover:bg-white/25 transition-colors cursor-pointer whitespace-nowrap"
              title="Reload frame"
            >
              <RefreshCw size={12} /> <span className="hidden sm:inline">Reload</span>
            </button>
            {/* Open in New Tab */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 text-white text-xs font-medium hover:bg-white/25 transition-colors cursor-pointer whitespace-nowrap"
            >
              <ExternalLink size={12} /> <span className="hidden sm:inline">Open in New Tab</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer ml-auto sm:ml-2"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative flex flex-col bg-gray-50">
          
          {/* Banner for Request Credentials */}
          {(title.includes('Vital') || title.includes('Bookshelf') || title === 'Scholaar') && (
            <div className="bg-[#001655] text-white px-4 py-3 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#002B7F]">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-[#C9A84C] shrink-0" />
                <p className="text-sm">
                  <span className="font-bold text-[#C9A84C]">Note:</span> You need to request a credential to access {title}.
                </p>
              </div>
              <button
                onClick={handleRequestCredentials}
                className="flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 rounded-lg bg-[#C9A84C] text-[#001655] text-sm font-bold hover:bg-[#D5B861] transition-colors cursor-pointer shadow-md"
              >
                <Mail size={16} /> Request
              </button>
            </div>
          )}

          {/* Connection Refused Warning */}
          <div className="bg-yellow-50 text-yellow-800 px-4 py-2 sm:px-6 text-sm border-b border-yellow-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div className="flex items-start sm:items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>"Refused to connect"?</strong> To complete the "I am human" security check, the university server requires you to open this page in a new tab.
              </span>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-yellow-200 hover:bg-yellow-300 text-yellow-900 rounded-lg font-bold transition-colors whitespace-nowrap w-full sm:w-auto shadow-sm"
            >
              <ExternalLink size={14} /> Open to Verify Security
            </a>
          </div>

          {/* Main Area */}
          <div className="flex-1 relative flex flex-col">
            <div className="flex-1 relative">
              {loadError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-20 p-6 text-center">
                  <AlertTriangle className="text-red-500 mb-4" size={48} />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Connection Blocked or Timed Out</h3>
                  <p className="text-gray-600 mb-6 max-w-md text-sm">
                    The browser prevented this page from loading inside the frame for security reasons (e.g., Your connection is not private), or the external server took too long to respond.
                  </p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-navy text-white font-medium hover:bg-navy-dark transition-colors shadow-lg"
                  >
                    <ExternalLink size={18} /> Open {title} in New Tab
                  </a>
                </div>
              )}
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 pointer-events-none">
                  <Loader2 className="animate-spin text-navy mb-3" size={32} />
                  <p className="text-gray-600 text-sm font-medium">
                    Loading {title}...
                  </p>
                </div>
              )}
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={iframeSrc}
                title={title}
                className="w-full h-full border-0 bg-white relative z-0"
                onLoad={() => setIsLoading(false)}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

