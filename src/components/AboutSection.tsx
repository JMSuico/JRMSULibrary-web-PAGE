import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

export const AboutSection: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section id="about" className={`py-section-py-desktop reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="max-w-max-width mx-auto px-4 md:px-gutter grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-headline-lg font-bold text-4xl text-primary mb-6">
            Fostering Innovation Through Knowledge
          </h2>
          <p className="font-body-md text-base text-on-surface-variant mb-8 leading-relaxed">
            The JRMSU Katipunan Campus Library is dedicated to providing high-quality information services that support the instructional, research, and extension programs of the university.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-outline-variant interactive-hover">
              <span className="material-symbols-outlined text-gold-light">auto_stories</span>
              <span className="font-label-caps text-primary">Extensive Collection</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-outline-variant interactive-hover">
              <span className="material-symbols-outlined text-gold-light">devices</span>
              <span className="font-label-caps text-primary">E-Library Access</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <a className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold hover:bg-primary hover:text-white transition-all interactive-hover" href="#">
              MISSION & VISION
            </a>
            <a className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold hover:bg-primary hover:text-white transition-all interactive-hover" href="#staff">
              STAFF DIRECTORY
            </a>
          </div>
        </div>
        
        <div className="h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
          <iframe 
            allowFullScreen={true}
            className="w-full h-full border-0" 
            loading="lazy" 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3948.7441315538166!2d123.2796123147814!3d8.228519994078832!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3254924c58557999%3A0x633519803b96446e!2sJose%20Rizal%20Memorial%20State%20University%20-%20Katipunan%20Campus!5e0!3m2!1sen!2sph!4v1625000000000!5m2!1sen!2sph">
          </iframe>
        </div>
      </div>
    </section>
  );
};
