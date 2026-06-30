import React, { useEffect, useState } from 'react';
import { useIntersectionObserver } from '@/src/Hooks/useIntersectionObserver';

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
      const isOpen = (day >= 1 && day <= 5) && (hour >= 7 && hour < 19);

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
      className="relative min-h-screen flex flex-col justify-center overflow-hidden py-24"
    >
      <div className="absolute inset-0 grid-overlay"></div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col gap-12 lg:gap-16">
        
        {/* TOP ROW: Text (Left) & Image Card (Right) */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
          
          {/* LEFT SIDE: Main Headers */}
          <div 
            className={`w-full lg:w-1/2 flex flex-col text-left hero-stagger ${isVisible ? 'visible' : ''}`} 
            style={{ transitionDelay: '0ms' }}
          >
            <p className="text-black font-bold text-sm md:text-base tracking-wider uppercase mb-1">
              Republic of the Philippines
            </p>
            <h1
              className="text-[#001851] font-black text-3xl sm:text-4xl lg:text-5xl leading-tight"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.25)' }}
            >
              JOSE RIZAL MEMORIAL STATE UNIVERSITY
            </h1>
            <p className="text-[#002B7F] font-bold text-xl md:text-2xl mt-1">
              KATIPUNAN CAMPUS
            </p>
            <p className="text-[#002B7F] font-medium text-sm md:text-base mt-1">
              Katipunan, Zamboanga del Norte
            </p>
            <p className="text-red-600 text-lg md:text-xl mt-4 tracking-wide" style={{ fontFamily: "'Brush Script MT', cursive", fontWeight: 400 }}>
              The Premier University in the Province of Zamboanga del Norte
            </p>
          </div>

          {/* RIGHT SIDE: Library Picture with Excellence overlay */}
          <div 
            className={`w-full lg:w-1/2 max-w-xl hero-stagger ${isVisible ? 'visible' : ''}`}
            style={{ transitionDelay: '160ms' }}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[300px] md:min-h-[380px]">
              <img
                src="/assets/JRMSU library lib.jpg"
                alt="JRMSU Library Building"
                className="w-full h-full object-cover block absolute inset-0"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001851] via-[#001851]/60 to-transparent"></div>
              {/* Excellence in Information — upper left */}
              <div className="absolute top-0 left-0 p-5 md:p-8">
                <span className="text-gold-light font-bold text-base md:text-lg tracking-wider uppercase drop-shadow-lg">
                  Excellence in Information
                </span>
              </div>
              {/* Bottom text */}
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 text-left">
                <h2 className="text-gold-light font-bold text-2xl md:text-3xl font-headline-lg mb-2 drop-shadow-lg leading-tight">
                  The Gateway to Academic Excellence
                </h2>
                <p className="text-white/90 text-sm max-w-lg leading-relaxed">
                  Empowering the JRMSU Katipunan community through accessible resources, expert guidance, and a modern digital research environment.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM ROW: Horizontal stack — Clock (left) + Visitors (right) */}
        <div 
          className={`w-full flex flex-col md:flex-row justify-center items-center gap-6 md:gap-8 hero-stagger ${isVisible ? 'visible' : ''}`}
          style={{ transitionDelay: '320ms' }}
        >
          {/* LEFT: Clock Card */}
          <div className="bg-primary rounded-2xl px-6 sm:px-10 py-5 md:py-6 shadow-2xl border border-gold-light/20 hover-3d-tilt w-full md:w-auto flex-1 max-w-lg">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-3 h-3 rounded-full pulse-status ${timeState.isOpen ? 'bg-success' : 'bg-danger'}`}
                ></div>
                <span className="font-label-caps text-gold-light font-bold tracking-wider text-sm">
                  {timeState.isOpen ? 'LIBRARY IS OPEN' : 'LIBRARY IS CLOSED'}
                </span>
              </div>

              <div className="font-status-clock text-[2.5rem] md:text-[3.2rem] tracking-tighter text-gold-light tabular-nums mb-2 leading-none drop-shadow-md">
                {timeState.hh}
                <span className="blinking-colon">:</span>
                {timeState.mm}
                <span className="blinking-colon">:</span>
                {timeState.ss}{' '}
                <span className="text-xl md:text-2xl ml-1">{timeState.ampm}</span>
              </div>

              <div className="font-label-caps text-gold-pale tracking-widest uppercase opacity-80 mb-1 text-xs md:text-sm">
                {timeState.dateStr}
              </div>

              <div className="text-xs text-gold-pale/70 font-label-caps tracking-wider text-center">
                Working days MONDAY TO FRIDAY &nbsp;|&nbsp; 7AM TO 7PM
              </div>
            </div>
          </div>

          {/* RIGHT: Visitors Card */}
          <div 
            className="rounded-2xl p-5 md:p-6 text-center hover-3d-tilt shadow-2xl flex flex-col items-center justify-center border border-gold-light/20 w-full md:w-72 flex-shrink-0"
            style={{ background: 'rgba(0, 24, 81, 0.80)', backdropFilter: 'blur(12px)' }}
          >
            <span className="material-symbols-outlined text-gold-light text-3xl mb-2 drop-shadow-md">
              visibility
            </span>
            <div className="text-gold-light font-bold text-xs md:text-sm tracking-wider uppercase mb-1">
              Website Visitors
            </div>
            <div className="font-status-clock text-4xl md:text-5xl text-white font-bold tracking-wider drop-shadow-lg my-1">
              12,482
            </div>
            <div className="text-white/70 text-xs uppercase tracking-widest mt-1">
              Total Count
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM: Bounce arrow indicator */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce hero-stagger ${isVisible ? 'visible' : ''}`}
        style={{ transitionDelay: '480ms' }}
      >
        <span className="material-symbols-outlined text-[#002B7F] text-4xl drop-shadow-md">
          keyboard_arrow_down
        </span>
      </div>
    </section>
  );
};
