import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { assets } from '../assets/data';

export const PersonnelSection: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section id="staff" className={`py-section-py-desktop max-w-max-width mx-auto px-4 md:px-gutter reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="text-center mb-16">
        <h2 className="font-headline-lg text-4xl text-primary mb-4 font-bold">Library Personnel</h2>
        <p className="text-on-surface-variant max-w-3xl mx-auto">
          Meet the dedicated library professionals committed to supporting learning, research, and academic excellence at JRMSU.
        </p>
      </div>

      {/* Hierarchy Layout */}
      <div className="relative flex flex-col items-center">
        {/* Level 1: Chief */}
        <div className="fade-down-entrance mb-4 w-full max-w-sm">
          <div className="personnel-card p-8 rounded-2xl text-center flex flex-col items-center">
            <div className="w-40 h-40 rounded-full border-4 border-primary p-1 mb-6 bg-navy-dark overflow-hidden shadow-xl">
              <img
                alt="Kiara Keren M. Alavanza"
                className="w-full h-full rounded-full object-cover"
                src={assets.images.chiefLibrarian}
              />
            </div>
            <h3 className="font-headline-md font-bold text-primary mb-1 text-xl">Kiara Keren M. Alavanza</h3>
            <p className="font-label-caps text-secondary font-bold tracking-widest">Chief Librarian</p>
            <div className="mt-4 pt-4 border-t border-gold-light/30 text-sm italic text-on-surface-variant">
              "Driving the vision of information literacy and campus-wide discovery."
            </div>
          </div>
        </div>

        {/* Vertical Stem from Chief */}
        <div className="hidden md:block flow-connector-v"></div>

        {/* Horizontal Connectors Container */}
        <div className="hidden md:block w-3/4 max-w-4xl relative mb-10">
          <div className="flow-connector-h"></div>
          <div className="flex justify-between absolute top-0 left-0 w-full">
            <div className="flow-connector-v h-10"></div>
            <div className="flow-connector-v h-10"></div>
            <div className="flow-connector-v h-10"></div>
          </div>
        </div>

        {/* Level 2: Staff */}
        <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl relative z-10">
          {/* Marquita */}
          <div className="fade-up-entrance personnel-card p-6 rounded-2xl text-center flex flex-col items-center" style={{ transitionDelay: '0.2s' }}>
            <div className="w-28 h-28 rounded-full border-4 border-gold-light/40 flex items-center justify-center bg-navy-dark text-gold-light text-2xl font-bold mb-4 shadow-lg">MP</div>
            <h3 className="font-headline-md font-bold text-primary mb-1 text-lg leading-tight uppercase">Marquita P. Morata</h3>
            <p className="font-label-caps text-secondary font-semibold">Staff, Library</p>
            <button className="mt-6 text-primary font-bold border-b border-primary hover:border-gold-light transition-all text-[10px] uppercase tracking-[0.2em]">Connect</button>
          </div>

          {/* Bernie */}
          <div className="fade-up-entrance personnel-card p-6 rounded-2xl text-center flex flex-col items-center" style={{ transitionDelay: '0.4s' }}>
            <div className="w-28 h-28 rounded-full border-4 border-gold-light/40 flex items-center justify-center bg-navy-dark text-gold-light text-2xl font-bold mb-4 shadow-lg">BP</div>
            <h3 className="font-headline-md font-bold text-primary mb-1 text-lg leading-tight uppercase">Bernie Rey L. Palon</h3>
            <p className="font-label-caps text-secondary font-semibold">Staff, Library</p>
            <button className="mt-6 text-primary font-bold border-b border-primary hover:border-gold-light transition-all text-[10px] uppercase tracking-[0.2em]">Connect</button>
          </div>

          {/* Reizel */}
          <div className="fade-up-entrance personnel-card p-6 rounded-2xl text-center flex flex-col items-center" style={{ transitionDelay: '0.6s' }}>
            <div className="w-28 h-28 rounded-full border-4 border-gold-light/40 flex items-center justify-center bg-navy-dark text-gold-light text-2xl font-bold mb-4 shadow-lg">RR</div>
            <h3 className="font-headline-md font-bold text-primary mb-1 text-lg leading-tight uppercase">Reizel C. Rosauro</h3>
            <p className="font-label-caps text-secondary font-semibold">Staff, Library</p>
            <button className="mt-6 text-primary font-bold border-b border-primary hover:border-gold-light transition-all text-[10px] uppercase tracking-[0.2em]">Connect</button>
          </div>
        </div>
      </div>
    </section>
  );
};
