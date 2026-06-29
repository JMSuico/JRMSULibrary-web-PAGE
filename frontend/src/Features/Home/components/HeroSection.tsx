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
      className="relative min-h-screen flex items-center overflow-hidden py-24"
    >
      <div className="absolute inset-0 grid-overlay"></div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6">
        {/* Desktop: Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">

          {/* LEFT COLUMN: Republic Header + Premier University */}
          <div className={`text-center md:text-left mb-10 md:mb-0 hero-stagger ${isVisible ? 'visible' : ''}`} style={{ transitionDelay: '0ms' }}>
            <p className="text-black font-bold text-sm md:text-base tracking-wider uppercase">
              Republic of the Philippines
            </p>
            <h1
              className="text-[#001851] font-black text-xl sm:text-2xl md:text-4xl lg:text-5xl leading-tight mt-1"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
            >
              JOSE RIZAL MEMORIAL STATE UNIVERSITY
            </h1>
            <p className="text-[#002B7F] font-bold text-lg md:text-2xl mt-1">
              KATIPUNAN CAMPUS
            </p>
            <p className="text-[#002B7F] text-sm md:text-base mt-1">
              Katipunan, Zamboanga del Norte
            </p>
            <p className="text-red-600 text-sm md:text-base mt-3" style={{ fontFamily: "'Brush Script MT', cursive", fontWeight: 400 }}>
              The Premier University in the Province of Zamboanga del Norte
            </p>
          </div>

          {/* RIGHT COLUMN: Image Card with overlays */}
          <div className="flex flex-col items-center md:items-end">
            <div className={`hero-stagger ${isVisible ? 'visible' : ''}`} style={{ transitionDelay: '160ms' }}>
              <div className="max-w-lg mx-auto md:mx-0 relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/assets/JRMSU library lib.jpg"
                  alt="JRMSU Library Building"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001851] via-[#001851]/70 to-transparent"></div>
                {/* "Excellence in Information" — upper left */}
                <div className="absolute top-0 left-0 p-6 md:p-8">
                  <span className="text-gold-light font-bold text-lg md:text-2xl tracking-wider uppercase drop-shadow-lg">
                    Excellence in Information
                  </span>
                </div>
                {/* Bottom text — left aligned */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-left">
                  <h2 className="text-gold-light font-bold text-2xl md:text-3xl font-headline-lg mb-2 drop-shadow-lg">
                    The Gateway to Academic Excellence
                  </h2>
                  <p className="text-white/90 text-xs md:text-sm max-w-lg">
                    Empowering the JRMSU Katipunan community through accessible resources, expert guidance, and a modern digital research environment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width: Navy Clock Card */}
        <div
          className={`flex justify-center mt-12 hero-stagger ${isVisible ? 'visible' : ''}`}
          style={{ transitionDelay: '240ms' }}
        >
          <div className="bg-primary rounded-xl px-4 sm:px-8 md:px-10 py-6 md:py-8 shadow-2xl inline-block border border-gold-light/20 hover-3d-tilt w-full md:w-auto">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-3 h-3 rounded-full pulse-status ${timeState.isOpen ? 'bg-success' : 'bg-danger'}`}
                ></div>
                <span className="font-label-caps text-gold-light font-bold">
                  {timeState.isOpen ? 'LIBRARY IS OPEN' : 'LIBRARY IS CLOSED'}
                </span>
              </div>

              <div className="font-status-clock text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] tracking-tighter text-gold-light tabular-nums mb-2 leading-none">
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

              <div className="mt-3 text-xs text-gold-pale/60 font-label-caps tracking-wider">
                Working days MONDAY TO FRIDAY &nbsp;|&nbsp; 7AM TO 7PM
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce hero-stagger ${isVisible ? 'visible' : ''}`}
        style={{ transitionDelay: '320ms' }}
      >
        <span className="material-symbols-outlined text-[#002B7F] text-4xl">
          keyboard_arrow_down
        </span>
      </div>
    </section>
  );
};
