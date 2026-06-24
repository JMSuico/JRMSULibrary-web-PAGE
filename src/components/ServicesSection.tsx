import React, { useState, useRef } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const TOTAL_SLIDES = 3;

export const ServicesSection: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + TOTAL_SLIDES) % TOTAL_SLIDES);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    if (touchStartX.current - touchEndX.current > 50) nextSlide();
    if (touchEndX.current - touchStartX.current > 50) prevSlide();
  };

  return (
    <section id="services" className={`py-section-py-desktop max-w-max-width mx-auto px-4 md:px-gutter reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl border border-outline-variant relative overflow-hidden">
        
        <div className="text-center mb-12">
          <h2 className="font-headline-lg font-bold text-4xl text-primary mb-4">Library Services Guide</h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto">
            Explore our streamlined processes for borrowing, research, and campus-wide clearances.
          </p>
        </div>

        {/* Slider Controls */}
        <div className="flex justify-between items-center mb-8">
          <button 
            className="p-3 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-all interactive-hover" 
            onClick={prevSlide}
          >
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          
          <div className="flex gap-2" id="slider-dots">
            {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => (
              <span 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-primary scale-125' : 'bg-outline-variant'}`}
              ></span>
            ))}
          </div>
          
          <button 
            className="p-3 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-all interactive-hover" 
            onClick={nextSlide}
          >
            <span className="material-symbols-outlined">arrow_forward_ios</span>
          </button>
        </div>

        <div 
          className="service-slider-container"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="service-track" 
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {/* Slide 1: External Services */}
            <div className="service-slide px-2">
              <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="bg-success text-white px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase">EXTERNAL</span>
                  <h3 className="font-headline-lg font-bold text-2xl text-primary">Borrowing of Library Books</h3>
                </div>
                <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-primary text-gold-light text-left">
                        <th className="p-4">Step</th>
                        <th className="p-4">Action</th>
                        <th className="p-4">Details / Requirements</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      <tr>
                        <td className="p-4 font-bold">01</td>
                        <td className="p-4">Search & Select</td>
                        <td className="p-4">Locate book via OPAC or Shelf Browsing.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold">02</td>
                        <td className="p-4">Verification</td>
                        <td className="p-4">Present valid School ID and Borrower's Card.</td>
                      </tr>
                      <tr className="bg-secondary-fixed/20">
                        <td className="p-4 font-bold">Fines</td>
                        <td className="p-4">Overdue Rate</td>
                        <td className="p-4">Php 2.00 per book per day (excluding holidays).</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Slide 2: Returning */}
            <div className="service-slide px-2">
              <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="bg-primary text-white px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase">INTERNAL/EXTERNAL</span>
                  <h3 className="font-headline-lg font-bold text-2xl text-primary">Returning of Library Books</h3>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border-l-4 border-gold-light">
                  <p className="text-on-surface mb-4">Books must be returned on or before the due date at the circulation desk.</p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-success">check_circle</span> Present the book and borrower's card.
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-success">check_circle</span> Staff verifies condition and clears the record.
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-success">check_circle</span> Any fines accrued must be settled at the Cashier.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Slide 3: E-Library */}
            <div className="service-slide px-2">
              <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="bg-navy-mid text-white px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase">DIGITAL</span>
                  <h3 className="font-headline-lg font-bold text-2xl text-primary">E-Library Access & Research</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-bold text-primary mb-3">Online Databases</h4>
                    <p className="text-sm text-on-surface-variant">Access to DOAJ, Project Gutenberg, and National E-Lib repository from any campus workstation.</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-bold text-primary mb-3">Requirements</h4>
                    <p className="text-sm text-on-surface-variant">Valid student/faculty portal login credentials and registration with the campus ICT office.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
