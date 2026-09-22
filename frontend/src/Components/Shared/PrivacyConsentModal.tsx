import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, FileText, CheckCircle, ChevronDown } from 'lucide-react';

interface PrivacyConsentModalProps {
  isLoaderDone: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

export const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({ isLoaderDone, onVisibilityChange }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<'privacy' | 'terms'>('privacy');
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [mounted, setMounted] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const privacyRef = useRef<HTMLDivElement>(null);
  const termsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only start the timer AFTER the InitialLoader has fully finished.
  useEffect(() => {
    if (!isLoaderDone) return;
    const today = new Date().toDateString();
    const consentDate = localStorage.getItem('jrmsu_privacy_consent_date');
    if (consentDate !== today) {
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoaderDone]);

  // Notify parent whenever our visibility changes so it can hide floating bubbles.
  useEffect(() => {
    onVisibilityChange?.(isVisible);
  }, [isVisible, onVisibilityChange]);

  // Scrollspy and Bottom Reach Detector
  const handleScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;

    // Detect if user has reached bottom (or within 40px)
    if (scrollHeight - scrollTop - clientHeight <= 45) {
      setHasScrolledToBottom(true);
    }

    // Scrollspy calculation
    if (termsRef.current) {
      const termsOffsetTop = termsRef.current.offsetTop;
      if (scrollTop >= termsOffsetTop - 120) {
        setActiveSection('terms');
      } else {
        setActiveSection('privacy');
      }
    }
  };

  const scrollToSection = (section: 'privacy' | 'terms') => {
    if (section === 'privacy' && privacyRef.current) {
      privacyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection('privacy');
    } else if (section === 'terms' && termsRef.current) {
      termsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection('terms');
    }
  };

  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: 'smooth'
      });
      // Directly mark as viewed and switch spy
      setHasScrolledToBottom(true);
      setActiveSection('terms');
    }
  };

  const handleUnderstand = () => {
    if (!hasScrolledToBottom) return;
    const today = new Date().toDateString();
    localStorage.setItem('jrmsu_privacy_consent_date', today);
    localStorage.setItem('jrmsu_privacy_consent', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    setIsVisible(false);
  };

  if (!mounted || !isVisible) return null;

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center p-4 animate-modal-overlay z-[9999]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-modal-card">
        
        {/* Header */}
        <div className="bg-navy px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-gold" />
            <h2 className="text-white text-lg font-bold uppercase tracking-wider">
              Legal & Privacy Agreements
            </h2>
          </div>
          <button 
            onClick={handleDecline}
            className="text-white/60 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollspy Radio / Tab Navigation (Single page control) */}
        <div className="flex bg-gray-50 border-b border-gray-200 shrink-0">
          <button
            type="button"
            onClick={() => scrollToSection('privacy')}
            className={`flex-1 py-3.5 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSection === 'privacy' 
                ? 'text-navy border-b-2 border-navy bg-blue-50/70' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <input
              type="radio"
              name="agreement-section"
              checked={activeSection === 'privacy'}
              onChange={() => scrollToSection('privacy')}
              className="accent-navy cursor-pointer"
            />
            <ShieldCheck className="w-4 h-4 text-navy" />
            Data Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('terms')}
            className={`flex-1 py-3.5 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSection === 'terms' 
                ? 'text-navy border-b-2 border-navy bg-blue-50/70' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <input
              type="radio"
              name="agreement-section"
              checked={activeSection === 'terms'}
              onChange={() => scrollToSection('terms')}
              className="accent-navy cursor-pointer"
            />
            <FileText className="w-4 h-4 text-navy" />
            Terms & Conditions
          </button>
        </div>

        {/* Scrollable Content Container (Both Sections on ONE page) */}
        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className="p-6 md:p-8 overflow-y-auto flex-1 font-inter text-gray-700 space-y-8 text-sm leading-relaxed custom-scrollbar relative"
        >
          {/* Section 1: Data Privacy Policy */}
          <div ref={privacyRef} id="privacy-section" className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <ShieldCheck className="w-5 h-5 text-navy" />
              <h3 className="font-bold text-navy text-base uppercase tracking-wider">
                Data Privacy Policy
              </h3>
            </div>
            <p>
              Jose Rizal Memorial State University (JRMSU) is committed to protecting the privacy and personal information of its students, employees, alumni, partners, and website users in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173) and other applicable Philippine laws.
            </p>
            <p>
              The University collects personal, academic, employment, contact, and website usage information to support admissions, enrollment, academic and employment administration, research activities, official communications, legal compliance, and website security and improvement.
            </p>
            <p>
              JRMSU processes personal data based on lawful grounds such as consent, contractual obligations, legal requirements, and the legitimate interests of the University. Personal information may be shared only with authorized government agencies, partner institutions, and accredited service providers that comply with data privacy and confidentiality regulations.
            </p>
            <p>
              To ensure data security, the University implements appropriate organizational, technical, and physical safeguards against unauthorized access, disclosure, alteration, or loss of personal information. Personal data is retained only for the period necessary to fulfill its intended purpose or as required by law, after which it is securely disposed of.
            </p>
            <p>
              In accordance with the Data Privacy Act, data subjects have the right to be informed, access and correct their personal information, object to processing, request data deletion or blocking, and file complaints with the National Privacy Commission.
            </p>
            <p>
              The JRMSU website may also use cookies to improve user experience and monitor website performance. Users may manage cookie preferences through their browser settings. The University reserves the right to update this policy as necessary, with all revisions to be posted on the official website.
            </p>
          </div>

          {/* Section 2: Terms & Conditions */}
          <div ref={termsRef} id="terms-section" className="space-y-4 pt-4 border-t-2 border-gray-200">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <FileText className="w-5 h-5 text-navy" />
              <h3 className="font-bold text-navy text-base uppercase tracking-wider">
                Terms & Conditions
              </h3>
            </div>
            
            <h4 className="font-bold text-navy text-base mb-1">1. Acceptance of Terms</h4>
            <p>
              By accessing and using the Jose Rizal Memorial State University (JRMSU) Library Landing Page and associated Digital Services, you agree to comply with and be bound by the following Terms and Conditions. If you do not agree, please decline and refrain from using the system.
            </p>

            <h4 className="font-bold text-navy text-base mb-1">2. Acceptable Use of E-Resources</h4>
            <p>
              The library's electronic resources (E-Resources), catalogs, and digital archives are provided exclusively for the academic, research, and educational purposes of JRMSU bona fide students, faculty, and staff. Unauthorized distribution, commercialization, or systematic scraping of library materials is strictly prohibited and subject to university disciplinary action.
            </p>

            <h4 className="font-bold text-navy text-base mb-1">3. User Conduct</h4>
            <p>
              Users are expected to conduct themselves appropriately while using the library's physical and digital spaces. Abusive language in feedback forms, spamming the contact systems, or attempting to compromise the security of the web platform will result in the immediate restriction of access.
            </p>

            <h4 className="font-bold text-navy text-base mb-1">4. Accuracy of Information</h4>
            <p>
              While the JRMSU Katipunan Campus Library strives to keep the catalog, OPAC status, and event schedules accurate and up-to-date, the University does not guarantee absolute real-time accuracy. Users are encouraged to physically verify critical book availability with the front desk personnel.
            </p>

            <h4 className="font-bold text-navy text-base mb-1">5. Amendments</h4>
            <p>
              JRMSU reserves the right to amend, update, or revise these Terms and Conditions at any time without prior notice. Continued use of the system following any changes constitutes your acceptance of the revised Terms.
            </p>
          </div>
        </div>

        {/* Floating Animated Down Arrow Indicator (Arrow down only indication) */}
        {!hasScrolledToBottom && (
          <div className="absolute bottom-24 right-6 z-20">
            <button
              type="button"
              onClick={scrollToBottom}
              className="w-11 h-11 rounded-full bg-navy text-gold flex items-center justify-center shadow-2xl border-2 border-gold hover:bg-navy-dark hover:scale-110 active:scale-95 transition-all animate-bounce cursor-pointer group"
              title="Scroll down to Terms & Conditions"
              aria-label="Scroll down to Terms & Conditions"
            >
              <ChevronDown className="w-6 h-6 text-gold group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-gray-500 italic">
            {!hasScrolledToBottom ? (
              <span className="text-amber-700 font-medium flex items-center gap-1.5">
                <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
                Please scroll to the end of Terms & Conditions to enable the agreement.
              </span>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                You have reviewed both policies. You may now proceed.
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleDecline}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-gray-500 border-2 border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={handleUnderstand}
              disabled={!hasScrolledToBottom}
              className={`w-full sm:w-auto px-8 py-2.5 text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shadow-md ${
                hasScrolledToBottom
                  ? 'text-navy bg-gold border-2 border-gold hover:bg-gold-hover hover:border-gold-hover hover:shadow-lg cursor-pointer active:scale-95'
                  : 'text-gray-400 bg-gray-200 border-2 border-gray-300 opacity-40 cursor-not-allowed pointer-events-none'
              }`}
              title={hasScrolledToBottom ? "I Understand & Agree" : "Please scroll and read all terms to enable"}
            >
              <CheckCircle className="w-4 h-4" />
              I Understand & Agree
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
