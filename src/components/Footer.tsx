import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { assets } from '../assets/data';

export const Footer: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <footer className={`text-gold-pale border-t border-gold-light/20 pt-20 pb-10 reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="max-w-max-width mx-auto px-4 md:px-gutter grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <img
              alt="JRMSU Logo"
              className="h-12 w-auto"
              src={assets.logos.jrmsu}
            />
            <span className="font-headline-md font-bold text-2xl text-gold-light">
              JRMSU Library
            </span>
          </div>
          <p className="text-on-primary-container max-w-sm leading-relaxed opacity-80">
            The University Library is the intellectual commons of Jose Rizal Memorial State University, where research, learning, and collaboration come together.
          </p>
        </div>
        
        <div>
          <h4 className="text-gold-light font-label-caps mb-6 uppercase">RESOURCES</h4>
          <ul className="space-y-3 font-body-md text-sm">
            <li><a className="text-on-primary-container hover:text-gold-pale transition-colors" href="#">E-Books & Journals</a></li>
            <li><a className="text-on-primary-container hover:text-gold-pale transition-colors" href="#">Digital Archive</a></li>
            <li><a className="text-on-primary-container hover:text-gold-pale transition-colors" href="#">Online OPAC</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-gold-light font-label-caps mb-6 uppercase">QUICK LINKS</h4>
          <ul className="space-y-3 font-body-md text-sm">
            <li><a className="text-on-primary-container hover:text-gold-pale transition-colors" href="#">Library Policies</a></li>
            <li><a className="text-on-primary-container hover:text-gold-pale transition-colors" href="#">Contact Support</a></li>
            <li><a className="text-on-primary-container hover:text-gold-pale transition-colors" href="#">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-max-width mx-auto px-4 md:px-gutter pt-10 border-t border-gold-light/10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 opacity-70">
        <p className="text-sm">© {new Date().getFullYear()} JRMSU Katipunan Campus Library. All Rights Reserved.</p>
        <div className="flex gap-6 text-sm">
          <a className="hover:text-gold-light" href="#">Campus Map</a>
          <a className="hover:text-gold-light" href="#">University Directory</a>
        </div>
      </div>
    </footer>
  );
};
