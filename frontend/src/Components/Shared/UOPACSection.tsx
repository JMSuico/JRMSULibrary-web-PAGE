import React from 'react';
import { useIntersectionObserver } from '@/src/Hooks/useIntersectionObserver';

export const UOPACSection: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section id="uopac" className={`py-section-py-desktop reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="max-w-max-width mx-auto px-4 md:px-gutter">
        <div
          className="p-12 bg-transparent"
        >
          <div className="flex flex-col items-center text-center gap-6">
            {/* Header */}
            <p className="text-sm uppercase tracking-widest text-primary font-bold">University Libraries</p>
            <h2 className="text-5xl font-bold font-headline-lg text-primary drop-shadow-sm">UOPAC</h2>
            <p className="text-lg text-primary/90 font-medium">Union Online Public Access Catalog</p>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <img
                src="/assets/uopac qr code.png"
                alt="UOPAC QR Code"
                className="w-48 h-48 mx-auto object-contain"
              />
            </div>
            <p className="text-primary font-bold uppercase tracking-wider">Scan QR to Register</p>

            {/* Divider with OR */}
            <div className="flex items-center gap-4 w-full max-w-xs">
              <div className="flex-1 h-px bg-primary/30"></div>
              <span className="text-primary/70 font-bold text-sm">OR</span>
              <div className="flex-1 h-px bg-primary/30"></div>
            </div>

            {/* Registration Link */}
            <a
              href="https://library.jrmsu.edu.ph/opac/registration"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gold-light text-primary px-8 py-3 rounded-full font-bold hover:bg-gold-pale transition inline-block"
            >
              CLICK THIS LINK TO REGISTER
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
