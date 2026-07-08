import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, FileText, CheckCircle } from 'lucide-react';

export const PrivacyConsentModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasConsented = localStorage.getItem('jrmsu_privacy_consent');
    if (!hasConsented) {
      // Short delay after the initial loader completes
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleUnderstand = () => {
    localStorage.setItem('jrmsu_privacy_consent', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    setIsVisible(false);
  };

  if (!mounted || !isVisible) return null;

  const modalContent = (
    <div className="fixed inset-0 ] flex items-center justify-center p-4 animate-modal-overlay z-[9999]">
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
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-50 border-b border-gray-200 shrink-0">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'privacy' 
                ? 'text-navy border-b-2 border-navy bg-blue-50/50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Data Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'terms' 
                ? 'text-navy border-b-2 border-navy bg-blue-50/50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Terms & Conditions
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 font-inter text-gray-700 space-y-4 text-sm leading-relaxed custom-scrollbar">
          {activeTab === 'privacy' ? (
            <div className="space-y-4 animate-fade-in">
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
          ) : (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-bold text-navy text-base mb-2">1. Acceptance of Terms</h3>
              <p>
                By accessing and using the Jose Rizal Memorial State University (JRMSU) Library Landing Page and associated Digital Services, you agree to comply with and be bound by the following Terms and Conditions. If you do not agree, please decline and refrain from using the system.
              </p>

              <h3 className="font-bold text-navy text-base mb-2">2. Acceptable Use of E-Resources</h3>
              <p>
                The library's electronic resources (E-Resources), catalogs, and digital archives are provided exclusively for the academic, research, and educational purposes of JRMSU bona fide students, faculty, and staff. Unauthorized distribution, commercialization, or systematic scraping of library materials is strictly prohibited and subject to university disciplinary action.
              </p>

              <h3 className="font-bold text-navy text-base mb-2">3. User Conduct</h3>
              <p>
                Users are expected to conduct themselves appropriately while using the library's physical and digital spaces. Abusive language in feedback forms, spamming the contact systems, or attempting to compromise the security of the web platform will result in the immediate restriction of access.
              </p>

              <h3 className="font-bold text-navy text-base mb-2">4. Accuracy of Information</h3>
              <p>
                While the JRMSU Katipunan Campus Library strives to keep the catalog, OPAC status, and event schedules accurate and up-to-date, the University does not guarantee absolute real-time accuracy. Users are encouraged to physically verify critical book availability with the front desk personnel.
              </p>

              <h3 className="font-bold text-navy text-base mb-2">5. Amendments</h3>
              <p>
                JRMSU reserves the right to amend, update, or revise these Terms and Conditions at any time without prior notice. Continued use of the system following any changes constitutes your acceptance of the revised Terms.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 md:p-6 flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
          <button
            onClick={handleDecline}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-gray-500 border-2 border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleUnderstand}
            className="w-full sm:w-auto px-8 py-2.5 text-sm font-bold uppercase tracking-wider text-navy bg-gold border-2 border-gold rounded-lg hover:bg-[#b8973b] hover:border-[#b8973b] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <CheckCircle className="w-4 h-4" />
            I Understand & Agree
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

