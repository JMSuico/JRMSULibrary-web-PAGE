import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Loader2, RefreshCw, Copy, Check, AlertTriangle } from 'lucide-react';

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
  
  // States for Scholaar Chrome SSL bypass simulation
  const [scholaarBypass, setScholaarBypass] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isScholaar = title.toLowerCase() === 'scholaar';

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
    // Only run timeout if we are actually loading the iframe (i.e., not waiting for Scholaar bypass)
    if (isScholaar && !scholaarBypass) return;

    const timeout = setTimeout(() => {
      if (isLoading) {
        setLoadError(true);
        setIsLoading(false);
      }
    }, 8000);
    return () => clearTimeout(timeout);
  }, [isLoading, iframeKey, isScholaar, scholaarBypass]);

  const handleReconnect = () => {
    setIsLoading(true);
    setLoadError(false);
    setIframeKey((prev) => prev + 1);
  };

  // If a proxyUrl is provided (like our new manual-login bridge pages), use it.
  // However, for Scholaar, we bypass the proxy bridge page and load the HTTP url directly
  // so the user can login seamlessly within the iframe.
  const iframeSrc = isScholaar ? url : (proxyUrl || url);

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
          
          {/* Main Area */}
          <div className="flex-1 relative flex flex-col">
            
            {/* Scholaar Chrome SSL Bypass Simulation */}
            {isScholaar && !scholaarBypass ? (
              <div className="absolute inset-0 z-50 bg-[#202124] text-[#e8eaed] overflow-y-auto">
                {/* Reminder in Top Left */}
                <div className="absolute top-4 left-4 max-w-sm bg-red-900/40 border border-red-500/50 p-3 rounded-lg shadow-xl backdrop-blur-md z-10">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-200 leading-relaxed font-medium">
                      <strong>Note about security warning:</strong> Scholaar's security certificate has expired. When you open the link below, you may see a "Your connection is not private" error. To access the site, click "Advanced" and then click "Proceed to scholaar.com (unsafe)".
                    </p>
                  </div>
                </div>

                {/* Fake Chrome SSL Content */}
                <div className="flex flex-col items-center justify-center min-h-full p-8 pt-24 text-left max-w-2xl mx-auto">
                  <div className="w-full">
                    {/* Red Triangle Icon */}
                    <svg className="w-16 h-16 mb-6" viewBox="0 0 48 48">
                      <path fill="#ea4335" d="M24 4L4 40h40L24 4z"/>
                      <path fill="#fff" d="M22 32h4v4h-4zm0-16h4v12h-4z"/>
                    </svg>
                    
                    <h1 className="text-3xl font-medium mb-4 tracking-wide text-white">
                      Your connection is not private
                    </h1>
                    
                    <p className="text-base text-[#9aa0a6] mb-4 leading-relaxed">
                      Attackers might be trying to steal your information from <strong className="text-white font-medium">scholaar.com</strong> (for example, passwords, messages, or credit cards). <a href="#" className="text-[#8ab4f8] hover:underline" onClick={(e) => e.preventDefault()}>Learn more about this warning</a>
                    </p>
                    
                    <p className="text-xs text-[#9aa0a6] uppercase tracking-wider mb-8 font-mono">
                      NET::ERR_CERT_DATE_INVALID
                    </p>
                    
                    {/* Buttons Row */}
                    <div className="flex flex-row items-center justify-between mt-8 w-full">
                      <button 
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="px-5 py-2 rounded-full border border-[#5f6368] text-[#8ab4f8] hover:bg-[#303134] text-sm font-medium transition-colors"
                      >
                        Advanced
                      </button>
                      <button 
                        onClick={onClose}
                        className="px-5 py-2 rounded-full bg-[#8ab4f8] text-[#202124] hover:bg-[#9bbef9] text-sm font-medium transition-colors"
                      >
                        Back to safety
                      </button>
                    </div>

                    {/* Advanced Expanded Area */}
                    {showAdvanced && (
                      <div className="mt-8 pt-6 border-t border-[#3c4043] animate-fade-in text-sm text-[#9aa0a6] leading-relaxed">
                        <p className="mb-4">
                          This server could not prove that it is <strong>scholaar.com</strong>; its security certificate expired. This may be caused by a misconfiguration or an attacker intercepting your connection.
                        </p>
                        <button
                          onClick={() => {
                            setScholaarBypass(true);
                            setIsLoading(true);
                          }}
                          className="text-[#8ab4f8] hover:underline font-medium focus:outline-none"
                        >
                          Proceed to scholaar.com (unsafe)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Real Iframe Render */
              <>
                {/* Only show the credentials banner when looking at the real iframe (or while it loads) */}
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/30 p-3 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 relative z-10 shrink-0">
                  <div className="flex items-center gap-3 text-amber-100">
                    <div className="bg-amber-500/20 p-2 rounded-full flex shrink-0 border border-amber-500/30">
                      <span className="material-symbols-outlined text-amber-400 text-xl">key</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">Need access to {title}?</p>
                      <p className="text-xs text-gray-600">Request login credentials from the librarian.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRequestCredentials}
                    className="btn bg-amber-500 hover:bg-amber-600 text-black border-none shadow-lg shadow-amber-500/20 whitespace-nowrap px-4 py-2 font-bold text-sm flex items-center gap-2 rounded-xl transition-all hover:scale-105 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    Request Credentials
                  </button>
                </div>

                <div className="flex-1 relative">
                  {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                      <Loader2 className="animate-spin text-navy mb-3" size={32} />
                      <p className="text-gray-600 text-sm font-medium">
                        Loading {title}...
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
                      <p className="text-gray-500 text-sm max-w-md mb-2">
                        <strong>{title}</strong> may be temporarily unavailable, or blocks embedded viewing
                        due to browser security policies (X-Frame-Options / Content Security Policy).
                      </p>
                      <p className="text-gray-400 text-xs max-w-md mb-6">
                        Click the button below to open it directly in a new browser tab. If the site is down,
                        please try again later or contact the librarian.
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
                      className="w-full h-full border-0 bg-white"
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

