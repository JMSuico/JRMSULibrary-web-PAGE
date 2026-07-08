import React, { useState } from 'react';
import { useIntersectionObserver } from '@/src/Hooks/useIntersectionObserver';
import { X } from 'lucide-react';
import { assets } from '@/src/Libs/Assets/data';

export const Footer: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [settings, setSettings] = useState<any>({
    library_name: 'JRMSU Katipunan Campus Library',
    contact_email: 'katipunan.library@jrmsu.edu.ph',
    address: 'Katipunan, Zamboanga del Norte'
  });

  React.useEffect(() => {
    fetch('/api/settings/')
      .then(res => res.json())
      .then(data => {
        if (data && data.library_name) {
          setSettings(data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <>
    <footer className={`bg-navy-dark text-gold-pale border-t-2 border-gold-light/30 pt-16 pb-8 reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="max-w-max-width mx-auto px-4 md:px-gutter grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* Left column: Logo + tagline */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <img
              alt="JRMSU Logo"
              className="h-12 w-auto"
              src={assets.logos.jrmsu}
            />
            <div>
              <span className="font-headline-md font-bold text-2xl text-gold-light block leading-tight">
                {settings.library_name.replace(/ Library$/i, '')} Library
              </span>
              <span className="text-[10px] text-gold-light/60 uppercase tracking-[0.1em]">
                {settings.address}
              </span>
            </div>
          </div>
          <p className="text-on-primary-container max-w-sm leading-relaxed opacity-80 text-sm">
            The University Library is the intellectual commons of Jose Rizal Memorial State University, where research, learning, and collaboration come together.
          </p>
        </div>

        {/* Center column: Quick Links */}
        <div>
          <h4 className="text-gold-light font-label-caps mb-6 uppercase tracking-wider text-xs">Quick Links</h4>
          <ul className="space-y-3 font-body-md text-sm">
            <li><a className="text-on-primary-container hover:text-gold-pale transition-colors" href="#">Library Policies</a></li>
            <li><a className="text-on-primary-container hover:text-gold-pale transition-colors" href="#contact">Contact Support</a></li>
            <li><a className="text-on-primary-container hover:text-gold-pale transition-colors" href="#">Privacy Policy</a></li>
            <li><a className="text-on-primary-container hover:text-gold-pale transition-colors" href="https://www.facebook.com/JRMSUkatipunanlibrary" target="_blank" rel="noopener noreferrer">Facebook Page</a></li>
          </ul>
        </div>

        {/* Right column: Contact Us */}
        <div>
          <h4 className="text-gold-light font-label-caps mb-6 uppercase tracking-wider text-xs">Contact Us</h4>
          <ul className="space-y-3 font-body-md text-sm">
            <li>
              <span className="block text-gold-light/60 text-[10px] uppercase tracking-wider">Email</span>
              <a href={`mailto:${settings.contact_email}`} className="text-on-primary-container hover:text-gold-pale transition-colors">
                {settings.contact_email}
              </a>
            </li>
            <li>
              <span className="block text-gold-light/60 text-[10px] uppercase tracking-wider">Alternate Email</span>
              <a href="mailto:jrmsukclibrary@gmail.com" className="text-on-primary-container hover:text-gold-pale transition-colors">
                jrmsukclibrary@gmail.com
              </a>
            </li>
            <li>
              <span className="block text-gold-light/60 text-[10px] uppercase tracking-wider">Social</span>
              <a href="https://www.facebook.com/JRMSUkatipunanlibrary" target="_blank" rel="noopener noreferrer" className="text-on-primary-container hover:text-gold-pale transition-colors">
                Facebook: JRMSU Katipunan Library
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-max-width mx-auto px-4 md:px-gutter pt-8 border-t border-gold-light/10 flex flex-col md:flex-row justify-between items-center gap-4 opacity-70">
        <p className="text-sm text-center md:text-left">© {new Date().getFullYear()} JRMSU-Katipunan Campus Library. All Rights Reserved.</p>
        
        <p className="text-sm font-semibold text-gold-light text-center tracking-wider">Developed by JM Suico CS - A</p>

        <div className="flex gap-4 sm:gap-6 text-sm flex-wrap justify-center">
          <a className="hover:text-gold-light transition-colors" href="https://jrmsu.edu.ph/" target="_blank" rel="noopener noreferrer">JRMSU Main</a>
          <a className="hover:text-gold-light transition-colors" href="https://www.gov.ph/" target="_blank" rel="noopener noreferrer">GOV.PH</a>
          <button onClick={() => setIsTermsOpen(true)} className="hover:text-gold-light transition-colors cursor-pointer text-left">Data Privacy & Terms</button>
        </div>
      </div>
    </footer>

    {/* Terms & Conditions Modal */}
    {isTermsOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-modal-overlay" onClick={() => setIsTermsOpen(false)}>
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden animate-modal-card"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="text-xl font-headline-lg font-bold text-navy-dark">Data Privacy & Terms of Conditions</h3>
            <button onClick={() => setIsTermsOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 cursor-pointer">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto font-body-md text-sm text-gray-700 space-y-4">
            <p><strong>1. Introduction</strong><br/>Welcome to the JRMSU Katipunan Campus Library online portal. By accessing this website, you agree to comply with the terms and conditions outlined below. These terms are designed to ensure a safe, secure, and respectful environment for all users.</p>
            
            <p><strong>2. Data Privacy (Republic Act No. 10173)</strong><br/>In compliance with the Data Privacy Act of 2012 of the Philippines, any personal data collected through this portal (such as email addresses, student IDs, or names via the Contact and Chatbot features) is strictly confidential. We only use this data for providing library support, account verification, and processing reservations. Your data will never be sold or shared with unauthorized third parties.</p>
            
            <p><strong>3. Acceptable Use Policy</strong><br/>Users are strictly prohibited from attempting to compromise the security of the portal. This includes attempting brute-force logins, attempting to bypass file-upload malware scanners, or sending malicious payloads via the AI Chatbot or Contact Forms.</p>
            
            <p><strong>4. E-Resources & Copyright</strong><br/>Access to the E-Resources catalog is for educational and non-commercial purposes only. Users must respect intellectual property rights. Unauthorized distribution, printing, or replication of digital materials obtained from this portal may result in academic disciplinary action or legal consequences.</p>
            
            <p><strong>5. Analytics & Cookies</strong><br/>We use essential cookies to maintain secure sessions and prevent Cross-Site Request Forgery (CSRF). Non-intrusive local storage is used to cache chatbot histories. By continuing to use the portal, you consent to this standard technical practice.</p>
            
            <p className="pt-4 border-t border-gray-100 text-xs text-gray-400 italic">Last updated: July 2026. For questions, please contact the Library Administrator.</p>
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button 
              onClick={() => setIsTermsOpen(false)} 
              className="px-6 py-2 bg-navy-mid text-white rounded-lg hover:bg-navy-dark font-medium transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
