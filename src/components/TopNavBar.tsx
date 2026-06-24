import React from 'react';
import { assets } from '../assets/data';

export const TopNavBar: React.FC = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-primary/95 backdrop-blur-md border-b border-gold-light/20 shadow-md h-20">
      <div className="flex justify-between items-center max-w-max-width mx-auto px-4 md:px-gutter h-full">
        <div className="flex items-center gap-4">
          <img
            alt="JRMSU Logo"
            className="h-14 w-auto object-contain"
            src={assets.logos.jrmsu}
          />
          <span className="font-headline-md text-headline-md font-bold text-gold-light">
            JRMSU Library
          </span>
        </div>
        <div className="hidden lg:flex gap-8 items-center font-ui-nav text-ui-nav uppercase tracking-wider">
          <a className="text-gold-light border-b-2 border-gold-light pb-1" href="#home">
            Home
          </a>
          <a className="text-on-primary/80 hover:text-gold-light transition-colors relative nav-underline" href="#about">
            About
          </a>
          <a className="text-on-primary/80 hover:text-gold-light transition-colors relative nav-underline" href="#services">
            Services
          </a>
          <a className="text-on-primary/80 hover:text-gold-light transition-colors relative nav-underline" href="#staff">
            Staff
          </a>
          <a className="text-on-primary/80 hover:text-gold-light transition-colors relative nav-underline" href="#file-services">
            File Services
          </a>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-gold-light text-primary px-6 py-2 rounded font-label-caps hover:bg-gold-pale transition-all interactive-hover">
            Feedback
          </button>
        </div>
      </div>
    </nav>
  );
};
