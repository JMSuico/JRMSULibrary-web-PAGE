import React, { useEffect, useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

export const HeroSection: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver();
  const [timeState, setTimeState] = useState(() => {
    const now = new Date();
    return {
      hh: '--',
      mm: '--',
      ss: '--',
      ampm: '--',
      dateStr: 'Loading...',
      isOpen: false,
    };
  });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeOptions: Intl.DateTimeFormatOptions = { 
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
      };
      const timeString = now.toLocaleTimeString('en-US', timeOptions);
      
      const [time, ampm] = timeString.split(' ');
      const [hh, mm, ss] = time.split(':');
      
      const dateStr = now.toLocaleDateString('en-US', { 
        month: 'long', day: 'numeric', year: 'numeric' 
      });

      const day = now.getDay();
      const hour = now.getHours();
      const isOpen = (day >= 1 && day <= 5) && (hour >= 8 && hour < 17);
      
      setTimeState({ hh, mm, ss, ampm, dateStr, isOpen });
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      id="home" 
      ref={ref as any}
      className="relative h-[100vh] flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 grid-overlay"></div>
      
      <div className="relative z-10 text-center max-w-4xl px-4">
        <div 
          className={`hero-stagger inline-block bg-gold-light/10 text-gold-light px-4 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-6 ${isVisible ? 'visible' : ''}`}
          style={{ transitionDelay: '0ms' }}
        >
          Excellence in Information
        </div>
        
        <h1 
          className={`font-display-hero text-[4rem] text-gold-light mb-8 hero-stagger ${isVisible ? 'visible' : ''}`}
          style={{ transitionDelay: '80ms', lineHeight: '1.1' }}
        >
          The Gateway to Academic Excellence
        </h1>
        
        <p 
          className={`font-body-lg text-lg text-gold-pale/80 mb-12 max-w-2xl mx-auto hero-stagger ${isVisible ? 'visible' : ''}`}
          style={{ transitionDelay: '160ms' }}
        >
          Empowering the JRMSU Katipunan community through accessible resources, expert guidance, and a modern digital research environment.
        </p>

        {/* Clock Widget */}
        <div 
          className={`glass-card p-8 rounded-xl inline-block shadow-2xl hero-stagger ${isVisible ? 'visible' : ''}`}
          style={{ transitionDelay: '240ms' }}
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className={`w-3 h-3 rounded-full pulse-status ${timeState.isOpen ? 'bg-success' : 'bg-danger'}`}
              ></div>
              <span className="font-label-caps text-on-primary">
                {timeState.isOpen ? 'LIBRARY IS OPEN' : 'LIBRARY IS CLOSED'}
              </span>
            </div>
            
            <div className="font-status-clock text-[3.5rem] tracking-tighter text-gold-light tabular-nums mb-2 leading-none">
              {timeState.hh}
              <span className="blinking-colon">:</span>
              {timeState.mm}
              <span className="blinking-colon">:</span>
              {timeState.ss}{' '}
              <span className="text-3xl">{timeState.ampm}</span>
            </div>
            
            <div className="font-label-caps text-gold-pale tracking-widest uppercase opacity-70">
              {timeState.dateStr}
            </div>
          </div>
        </div>
      </div>
      
      <div 
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce hero-stagger ${isVisible ? 'visible' : ''}`}
        style={{ transitionDelay: '320ms' }}
      >
        <span className="material-symbols-outlined text-gold-light text-4xl">
          keyboard_arrow_down
        </span>
      </div>
    </section>
  );
};
