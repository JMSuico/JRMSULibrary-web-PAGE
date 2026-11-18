import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getImageUrl } from '@/src/Libs/apiClient';
import { useIntersectionObserver } from '@/src/Hooks/useIntersectionObserver';
import { publicApi, cmsApi } from '@/src/Endpoints/cmsApi';
import { settingsApi, type SiteSettings } from '@/src/Endpoints/settingsApi';
import { useCmsUpdated } from '@/src/Hooks/useCmsUpdated';

interface OpenHoursState {
  openH: number;
  openM: number;
  closeH: number;
  closeM: number;
  satOpen: boolean;
  sunOpen: boolean;
}

interface CachedHeroSettings {
  opening_hours_mon_fri: string;
  opening_hours_sat: string;
  opening_hours_sun: string;
  ts: number;
}

const HERO_CACHE_TTL_MS = 5 * 60 * 1000;
const HERO_EXCELLENCE_KEY = 'cached_hero_excellence';
const HERO_EXCELLENCE_TS_KEY = 'cached_hero_excellence_ts';
const HERO_SETTINGS_KEY = 'cached_hero_settings';

const parseOpeningHours = (
  monFri: string,
  sat: string,
  sun: string
): OpenHoursState | null => {
  const match = monFri.match(/(\d+):(\d+)\s*(AM|PM)\s*-\s*(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return null;
  let openH = parseInt(match[1], 10);
  const openM = parseInt(match[2], 10);
  const openAmpm = match[3].toUpperCase();
  let closeH = parseInt(match[4], 10);
  const closeM = parseInt(match[5], 10);
  const closeAmpm = match[6].toUpperCase();
  if (openAmpm === 'PM' && openH !== 12) openH += 12;
  if (openAmpm === 'AM' && openH === 12) openH = 0;
  if (closeAmpm === 'PM' && closeH !== 12) closeH += 12;
  if (closeAmpm === 'AM' && closeH === 12) closeH = 0;
  return {
    openH,
    openM,
    closeH,
    closeM,
    satOpen: sat === 'Open',
    sunOpen: sun === 'Open',
  };
};

const readCachedHeroSettings = (): CachedHeroSettings | null => {
  try {
    const raw = localStorage.getItem(HERO_SETTINGS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CachedHeroSettings>;
    if (
      typeof parsed.opening_hours_mon_fri === 'string' &&
      typeof parsed.ts === 'number'
    ) {
      return {
        opening_hours_mon_fri: parsed.opening_hours_mon_fri,
        opening_hours_sat: parsed.opening_hours_sat ?? '',
        opening_hours_sun: parsed.opening_hours_sun ?? '',
        ts: parsed.ts,
      };
    }
  } catch {
    // ignore corrupted cache
  }
  return null;
};

export const HeroSection: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver();
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [timeState, setTimeState] = useState(() => ({
    hh: '--',
    mm: '--',
    ss: '--',
    ampm: '--',
    dateStr: 'Loading...',
    isOpen: false,
  }));

  const initialSettings = readCachedHeroSettings();
  const [openHours, setOpenHours] = useState<OpenHoursState | null>(() =>
    initialSettings
      ? parseOpeningHours(
          initialSettings.opening_hours_mon_fri,
          initialSettings.opening_hours_sat,
          initialSettings.opening_hours_sun
        )
      : null
  );
  const [rawOpenHours, setRawOpenHours] = useState<string>(() =>
    initialSettings?.opening_hours_mon_fri
      ? `Working days MONDAY TO FRIDAY | ${initialSettings.opening_hours_mon_fri}`
      : 'Working days MONDAY TO FRIDAY | 7AM TO 7PM'
  );

  const [excellenceImage, setExcellenceImage] = useState<string | null>(() => {
    try {
      return localStorage.getItem(HERO_EXCELLENCE_KEY) || null;
    } catch {
      return null;
    }
  });
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);
  const heroImgRef = useRef<HTMLImageElement | null>(null);

  const loadData = useCallback((forceRefresh = false) => {
    publicApi.getVisitorCount()
      .then((data) => setVisitorCount(data.total_visits))
      .catch(() => setVisitorCount(null));

    const now = Date.now();
    const cachedSettings = readCachedHeroSettings();
    const hasFreshSettings =
      !forceRefresh && cachedSettings !== null && now - cachedSettings.ts < HERO_CACHE_TTL_MS;

    if (!hasFreshSettings) {
      settingsApi.getSettings()
        .then((s: SiteSettings) => {
          const monFri = s?.opening_hours_mon_fri || '7:00 AM - 7:00 PM';
          const sat = s?.opening_hours_sat || '';
          const sun = s?.opening_hours_sun || '';
          setRawOpenHours(`Working days MONDAY TO FRIDAY | ${monFri}`);
          const parsed = parseOpeningHours(monFri, sat, sun);
          if (parsed) {
            setOpenHours(parsed);
          }
          try {
            const payload: CachedHeroSettings = {
              opening_hours_mon_fri: monFri,
              opening_hours_sat: sat,
              opening_hours_sun: sun,
              ts: Date.now(),
            };
            localStorage.setItem(HERO_SETTINGS_KEY, JSON.stringify(payload));
          } catch {
            // ignore storage quota errors
          }
        })
        .catch(() => null);
    }

    let hasFreshExcellence = false;
    if (!forceRefresh) {
      try {
        const cachedFile = localStorage.getItem(HERO_EXCELLENCE_KEY);
        const cachedTs = Number(localStorage.getItem(HERO_EXCELLENCE_TS_KEY) || '0');
        if (cachedFile && cachedTs > 0 && now - cachedTs < HERO_CACHE_TTL_MS) {
          hasFreshExcellence = true;
        }
      } catch {
        hasFreshExcellence = false;
      }
    }

    if (!hasFreshExcellence) {
      cmsApi.getAllFiles()
        .then((files) => {
          const excellenceFile = files.find((f) => f.category === 'Excellence' && f.is_active);
          if (excellenceFile && excellenceFile.file) {
            try {
              localStorage.setItem(HERO_EXCELLENCE_KEY, excellenceFile.file);
              localStorage.setItem(HERO_EXCELLENCE_TS_KEY, String(Date.now()));
            } catch {
              // ignore storage quota errors
            }
            setExcellenceImage((prev) => {
              if (prev !== excellenceFile.file) {
                setIsImageLoaded(false);
              }
              return excellenceFile.file;
            });
          } else {
            try {
              localStorage.removeItem(HERO_EXCELLENCE_KEY);
              localStorage.removeItem(HERO_EXCELLENCE_TS_KEY);
            } catch {
              // ignore
            }
            setExcellenceImage(null);
            setIsImageLoaded(false);
          }
        })
        .catch(() => null);
    }
  }, []);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  useEffect(() => {
    const img = heroImgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setIsImageLoaded(true);
    }
  }, [excellenceImage]);

  const handleCmsUpdate = useCallback(() => {
    loadData(true);
  }, [loadData]);

  useCmsUpdated(handleCmsUpdate);

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
      const minute = now.getMinutes();
      
      let isOpen: boolean;
      if (openHours) {
        const nowMins = hour * 60 + minute;
        const openMins = openHours.openH * 60 + openHours.openM;
        const closeMins = openHours.closeH * 60 + openHours.closeM;
        
        const isDayOpen = (day >= 1 && day <= 5) || (day === 6 && openHours.satOpen) || (day === 0 && openHours.sunOpen);
        isOpen = isDayOpen && nowMins >= openMins && nowMins < closeMins;
      } else {
        // Fallback: Mon-Fri 7AM-7PM
        isOpen = (day >= 1 && day <= 5) && (hour >= 7 && hour < 19);
      }

      setTimeState({ hh, mm, ss, ampm, dateStr, isOpen });
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [openHours]);

  return (
    <section
      id="home"
      ref={(el) => { ref.current = el; }}
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
              className="text-primary font-black text-3xl sm:text-4xl lg:text-5xl leading-tight"
              style={{ textShadow: '2px 2px 4px var(--color-black-alpha-25)' }}
            >
              JOSE RIZAL MEMORIAL STATE UNIVERSITY
            </h1>
            <p className="text-navy font-bold text-xl md:text-2xl mt-1">
              KATIPUNAN CAMPUS
            </p>
            <p className="text-navy font-medium text-sm md:text-base mt-1">
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
            <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[300px] md:min-h-[380px] bg-primary">
              {/* Layer 1: Navy Shimmer Skeleton (active while image decodes/loads) */}
              {!isImageLoaded && (
                <div
                  className="absolute inset-0 skeleton-shimmer-navy"
                  aria-hidden="true"
                />
              )}

              {/* Layer 2: Real Database Image (Smooth cross-fade) */}
              {excellenceImage && (
                <img
                  ref={heroImgRef}
                  src={getImageUrl(excellenceImage)}
                  alt="JRMSU Library Excellence"
                  className={`w-full h-full object-cover block absolute inset-0 transition-opacity duration-500 ease-out ${
                    isImageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  onLoad={() => setIsImageLoaded(true)}
                  onError={() => {
                    setIsImageLoaded(false);
                  }}
                />
              )}

              {/* Layer 3: High-contrast gradient scrim (WCAG 2.1 AA >= 4.5:1) */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-transparent pointer-events-none"></div>

              {/* Layer 4: Typography Overlay — ALWAYS 100% VISIBLE ON FIRST PAINT */}
              {/* Excellence in Information — upper left */}
              <div className="absolute top-0 left-0 p-5 md:p-8 z-10">
                <span className="text-gold-light font-bold text-base md:text-lg tracking-wider uppercase drop-shadow-lg">
                  Excellence in Information
                </span>
              </div>
              {/* Bottom text */}
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 text-left z-10">
                <h2 className="text-gold-light font-bold text-2xl md:text-3xl font-headline-lg mb-2 drop-shadow-lg leading-tight">
                  The Gateway to Academic Excellence
                </h2>
                <p className="text-white/90 text-sm max-w-lg leading-relaxed">
                  Empowering the JRMSU Katipunan Campus community through accessible resources, expert guidance, and a modern digital research environment.
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

              <div className="text-xs text-gold-pale/70 font-label-caps tracking-wider text-center uppercase">
                {rawOpenHours}
              </div>
            </div>
          </div>

          {/* RIGHT: Visitors Card */}
          <div 
            className="rounded-2xl p-5 md:p-6 text-center hover-3d-tilt shadow-2xl flex flex-col items-center justify-center border border-gold-light/20 w-full md:w-72 flex-shrink-0"
            style={{ background: 'var(--color-navy-alpha-80)', backdropFilter: 'blur(12px)' }}
          >
            <span className="material-symbols-outlined text-gold-light text-3xl mb-2 drop-shadow-md">
              visibility
            </span>
            <div className="text-gold-light font-bold text-xs md:text-sm tracking-wider uppercase mb-1">
              Website Visitors
            </div>
            <div className="font-status-clock text-4xl md:text-5xl text-white font-bold tracking-wider drop-shadow-lg my-1">
              {visitorCount !== null ? visitorCount.toLocaleString() : '--'}
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
        <span className="material-symbols-outlined text-navy text-4xl drop-shadow-md">
          keyboard_arrow_down
        </span>
      </div>
    </section>
  );
};
