import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

export const FileServicesSection: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section id="file-services" className={`py-section-py-desktop text-on-primary reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="max-w-max-width mx-auto px-4 md:px-gutter">
        <div className="mb-12 text-center">
          <h2 className="font-headline-lg font-bold text-4xl text-gold-light">File Services & Downloads</h2>
          <div className="w-24 h-1 bg-gold-light mx-auto mt-4"></div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-md border border-gold-light/20 p-8 rounded-2xl hover:bg-white/20 transition-all group interactive-hover">
            <span className="material-symbols-outlined text-gold-light text-4xl mb-6">description</span>
            <h3 className="font-headline-md font-bold text-2xl text-on-primary mb-4">Library Forms</h3>
            <p className="text-on-primary/70 mb-8 text-sm">Download Borrower's Cards, Lost Book Affidavits, and Request Forms.</p>
            <a className="inline-flex items-center gap-2 text-gold-light font-label-caps uppercase group-hover:gap-4 transition-all" href="#">
              VIEW FOLDER <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-gold-light/20 p-8 rounded-2xl hover:bg-white/20 transition-all group interactive-hover">
            <span className="material-symbols-outlined text-gold-light text-4xl mb-6">feedback</span>
            <h3 className="font-headline-md font-bold text-2xl text-on-primary mb-4">CSM Feedback</h3>
            <p className="text-on-primary/70 mb-8 text-sm">Access the Client Satisfaction Measurement forms for library services.</p>
            <a className="inline-flex items-center gap-2 text-gold-light font-label-caps uppercase group-hover:gap-4 transition-all" href="#">
              SUBMIT FORM <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-gold-light/20 p-8 rounded-2xl hover:bg-white/20 transition-all group interactive-hover">
            <span className="material-symbols-outlined text-gold-light text-4xl mb-6">task_alt</span>
            <h3 className="font-headline-md font-bold text-2xl text-on-primary mb-4">Online Clearance</h3>
            <p className="text-on-primary/70 mb-8 text-sm">Guides and requirements for digital clearance processing.</p>
            <a className="inline-flex items-center gap-2 text-gold-light font-label-caps uppercase group-hover:gap-4 transition-all" href="#">
              CHECK STATUS <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
