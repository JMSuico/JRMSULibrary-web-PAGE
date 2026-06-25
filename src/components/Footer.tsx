import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { assets } from '../assets/data';

export const Footer: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
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
                JRMSU Library
              </span>
              <span className="text-[10px] text-gold-light/60 uppercase tracking-[0.1em]">
                Katipunan Campus
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
              <a href="mailto:katipunan.library@jrmsu.edu.ph" className="text-on-primary-container hover:text-gold-pale transition-colors">
                katipunan.library@jrmsu.edu.ph
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
        <p className="text-sm">© {new Date().getFullYear()} JRMSU-Katipunan Campus Library. All Rights Reserved.</p>
        <div className="flex gap-6 text-sm">
          <a className="hover:text-gold-light transition-colors" href="https://jrmsu.edu.ph/" target="_blank" rel="noopener noreferrer">JRMSU Main</a>
          <a className="hover:text-gold-light transition-colors" href="https://www.gov.ph/" target="_blank" rel="noopener noreferrer">GOV.PH</a>
          <a className="hover:text-gold-light transition-colors" href="#">Data Privacy</a>
        </div>
      </div>
    </footer>
  );
};
