import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, ExternalLink, Loader2, RefreshCw, Copy, Check, 
  AlertTriangle, Mail, ShieldCheck, BookOpen, Globe, Lock, Sparkles, ArrowRight
} from 'lucide-react';

interface ExternalIframeModalProps {
  title: string;
  url: string;
  proxyUrl?: string; // Kept for interface compatibility
  onClose: () => void;
}

export const ExternalIframeModal: React.FC<ExternalIframeModalProps> = ({
  title,
  url,
  onClose,
}) => {
  // Detect if the target domain strictly forbids iframe embedding (X-Frame-Options / CSP)
  const isProtectedProvider = 
    url.toLowerCase().includes('vitalsource') ||
    url.toLowerCase().includes('bookshelf') ||
    url.toLowerCase().includes('scholaar') ||
    url.toLowerCase().includes('ebsco') ||
    url.toLowerCase().includes('proquest') ||
    title.toLowerCase().includes('vital') ||
    title.toLowerCase().includes('scholaar');

  // If protected, default to Gateway Hub mode (Zero 'Content Blocked' error screens).
  // Users can still optionally click "Try Embedded View" if they wish.
  const [viewMode, setViewMode] = useState<'gateway' | 'iframe'>(
    isProtectedProvider ? 'gateway' : 'iframe'
  );

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleRequestCredentials = () => {
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

  // If in iframe mode and blocked by external X-Frame-Options/CSP, trigger fallback
  useEffect(() => {
    if (viewMode !== 'iframe') return;
    const timeout = setTimeout(() => {
      if (isLoading) {
        setLoadError(true);
        setIsLoading(false);
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [isLoading, iframeKey, viewMode]);

  const handleReconnect = () => {
    setIsLoading(true);
    setLoadError(false);
    setIframeKey((prev) => prev + 1);
  };

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-3 sm:p-4 z-[9999] animate-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} viewer`}
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-modal-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-5xl h-[92vh] max-h-[850px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-modal-card border border-gray-100">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 sm:px-7 py-4 border-b border-navy-dark/40 bg-gradient-to-r from-navy via-navy to-navy-dark gap-3 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 shrink-0 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center shadow-inner">
              <BookOpen size={20} className="text-gold" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-lg leading-tight truncate">{title}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gold/20 text-gold border border-gold/40">
                  Verified Portal
                </span>
              </div>
              <p className="text-white/60 text-xs truncate max-w-[280px] sm:max-w-md font-mono mt-0.5">
                {url}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Copy Link Button (Always visible and accessible) */}
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-sm border ${
                copied
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
              }`}
              title="Copy verified portal link"
            >
              {copied ? <Check size={14} className="text-white" /> : <Copy size={14} />}
              <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>

            {/* View Mode Switcher (if protected) */}
            {isProtectedProvider && (
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'gateway' ? 'iframe' : 'gateway')}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                title="Switch between Gateway and Embedded View"
              >
                <RefreshCw size={13} />
                <span>{viewMode === 'gateway' ? 'Try Embedded View' : 'Gateway Hub'}</span>
              </button>
            )}

            {/* Direct Open in New Tab Button */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold text-navy text-xs font-extrabold hover:bg-gold-light hover:shadow-lg transition-all cursor-pointer whitespace-nowrap shadow-md active:scale-95"
            >
              <ExternalLink size={14} /> <span>Open Portal ↗</span>
            </a>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors cursor-pointer ml-auto sm:ml-1"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative flex flex-col bg-gray-50 overflow-y-auto">

          {/* ================= MODE 1: INSTITUTIONAL GATEWAY HUB (100% RELIABLE, ZERO BLOCK ERROR) ================= */}
          {viewMode === 'gateway' && (
            <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 max-w-4xl mx-auto w-full">
              
              {/* Top Banner: Verification */}
              <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100/70 border border-blue-200 flex items-center justify-center text-navy shrink-0">
                    <Globe size={24} className="text-navy" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-navy">
                      JRMSU Digital Library Gateway
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Official Electronic Resource Access & Knowledge Center
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <ShieldCheck size={15} className="text-emerald-600" />
                  <span>Verified Secure Publisher</span>
                </div>
              </div>

              {/* Main Information & Prominent Link Box */}
              <div className="my-6 space-y-5">
                
                {/* Visible Link Box (Always visible & interactive) */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-navy/40 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock size={13} className="text-emerald-600" /> Secure Direct Access Link
                    </span>
                    <span className="text-xs text-gray-400 font-mono">HTTPS Encrypted</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <span className="text-sm font-mono text-navy font-semibold break-all select-all">
                      {url}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-navy hover:bg-navy-dark text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-sm active:scale-95"
                    >
                      {copied ? <Check size={14} className="text-gold" /> : <Copy size={14} />}
                      <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>

                {/* Publisher Security & Access Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1: Anti-Framing Explanation */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4.5 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-2 text-navy">
                      <ShieldCheck size={18} className="text-navy" />
                      <h4 className="font-bold text-sm">Protected Publisher Portal</h4>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      To safeguard student accounts, digital copyrights (DRM), and single sign-on sessions, <strong>{title}</strong> requires direct browser launch. Opening directly ensures fast page load times and uninterrupted reader functionality.
                    </p>
                  </div>

                  {/* Card 2: Student Login Credentials */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4.5 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-2 text-navy">
                      <Sparkles size={18} className="text-gold" />
                      <h4 className="font-bold text-sm">Institutional Access</h4>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Log in using your registered <strong>JRMSU Student or Faculty credentials</strong>. If you don't have an active account or institutional access code, use the Request Credentials button below.
                    </p>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gold hover:bg-gold-light text-navy font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl transition-all cursor-pointer group active:scale-98"
                  >
                    <span>Launch {title} in Secure Window</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </a>

                  <button
                    type="button"
                    onClick={handleRequestCredentials}
                    className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-navy hover:bg-navy-dark text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                  >
                    <Mail size={16} className="text-gold" />
                    <span>Request Credentials</span>
                  </button>
                </div>

              </div>

              {/* Footer Note */}
              <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
                <span>Jose Rizal Memorial State University — Katipunan Campus Library</span>
                <button
                  type="button"
                  onClick={() => setViewMode('iframe')}
                  className="text-navy font-medium underline hover:text-navy-dark cursor-pointer"
                >
                  Want to test embedded view? Click here
                </button>
              </div>

            </div>
          )}

          {/* ================= MODE 2: EMBEDDED IFRAME (FOR EMBEDDABLE SITES OR TESTING) ================= */}
          {viewMode === 'iframe' && (
            <div className="flex-1 relative flex flex-col">
              
              {/* Prominent Live Link & Control Bar */}
              <div className="bg-navy-dark text-white px-4 py-3 sm:px-6 border-b border-navy flex flex-col sm:flex-row justify-between sm:items-center gap-3 shrink-0 shadow-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-gold uppercase tracking-wider px-2 py-0.5 rounded bg-gold/20 border border-gold/40 shrink-0">
                    Direct Link
                  </span>
                  <span className="text-xs font-mono text-white/90 truncate max-w-full select-all">
                    {url}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {copied ? <Check size={13} className="text-gold" /> : <Copy size={13} />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gold hover:bg-gold-light text-navy rounded-lg text-xs font-bold transition-all whitespace-nowrap shadow-md"
                  >
                    <ExternalLink size={13} /> Open Portal ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => setViewMode('gateway')}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/90 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    ← Gateway Hub
                  </button>
                </div>
              </div>

              <div className="flex-1 relative">
                {/* Fallback Overlay if Iframe gets blocked by browser policy */}
                {loadError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-20 p-6 text-center animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4 shadow-inner">
                      <ShieldCheck className="text-amber-600" size={36} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      External Publisher Security Policy
                    </h3>
                    <p className="text-gray-600 mb-4 max-w-lg text-sm leading-relaxed">
                      <strong>{title}</strong> protects its login and DRM using strict anti-framing rules (<code>X-Frame-Options: SAMEORIGIN</code>). The full portal is ready to launch directly.
                    </p>
                    
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-3 max-w-md w-full mb-6 flex items-center justify-between gap-3 shadow-sm">
                      <span className="text-xs font-mono text-gray-600 truncate">{url}</span>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="px-3 py-1.5 rounded-lg bg-navy text-white text-xs font-bold hover:bg-navy-dark transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gold text-navy font-bold hover:bg-gold-light transition-all shadow-lg hover:shadow-xl cursor-pointer"
                      >
                        <ExternalLink size={18} /> Open {title} Directly
                      </a>
                      <button
                        type="button"
                        onClick={() => setViewMode('gateway')}
                        className="px-5 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        Back to Gateway Hub
                      </button>
                    </div>
                  </div>
                )}

                {/* Loading Spinner */}
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 pointer-events-none">
                    <Loader2 className="animate-spin text-navy mb-3" size={32} />
                    <p className="text-gray-600 text-sm font-medium">
                      Connecting to {title}...
                    </p>
                  </div>
                )}

                {/* Live Iframe */}
                <iframe
                  key={iframeKey}
                  ref={iframeRef}
                  src={url}
                  title={title}
                  className="w-full h-full border-0 bg-white relative z-0"
                  onLoad={() => setIsLoading(false)}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
                  referrerPolicy="no-referrer"
                />
              </div>

            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
};
