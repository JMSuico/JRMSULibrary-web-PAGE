import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { assets } from '../assets/data';

export const TopNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [eresourcesOpen, setEresourcesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
    setAboutOpen(false);
    setServicesOpen(false);
    setEresourcesOpen(false);
  }, [location.pathname]);

  const aboutItems = [
    { label: 'Organizational Structure', path: '/about' },
    { label: 'History of JRMSU', path: '/about' },
    { label: 'Library Quality Objectives', path: '/about' },
  ];

  const servicesItems = [
    { label: 'Library Services', path: '/services' },
    { label: 'Feedback & Complaints', path: '/services' },
    { label: 'External Services', path: '/services' },
  ];

  const eresourcesItems = [
    { label: 'File Services', path: '/e-resources' },
    { label: 'Online Access', path: '/e-resources' },
  ];

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about', dropdown: aboutItems },
    { label: 'Services', path: '/services', dropdown: servicesItems },
    { label: 'E-Resources', path: '/e-resources', dropdown: eresourcesItems },
  ];

  const handleNavClick = (path: string) => {
    setSidebarOpen(false);
    setAboutOpen(false);
    setServicesOpen(false);
    setEresourcesOpen(false);
    navigate(path);
  };

  const isActive = (path: string) => location.pathname === path;

  const closeAllDropdowns = () => {
    setAboutOpen(false);
    setServicesOpen(false);
    setEresourcesOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 h-20 transition-all duration-300 bg-white shadow-sm border-b border-gray-200`}
    >
      <div className="flex justify-between items-center max-w-max-width mx-auto px-4 md:px-gutter h-full">
        {/* Logo — also serves as hamburger toggle on mobile */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-4 lg:cursor-pointer cursor-pointer bg-transparent border-none p-0"
          aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={sidebarOpen}
        >
          <img
            alt="JRMSU Logo"
            className="h-14 w-auto object-contain"
            src={assets.logos.jrmsu}
          />
          <div className="hidden sm:block text-left">
            <span className="font-headline-md text-headline-md font-bold text-primary block leading-tight">
              JRMSU Library
            </span>
            <span className="font-label-caps text-primary/70 tracking-[0.1em] uppercase text-[10px]">
              Katipunan Campus
            </span>
          </div>
        </button>

        {/* Desktop nav */}
        <div className="hidden lg:flex gap-8 items-center font-ui-nav text-ui-nav uppercase tracking-wider">
          {navLinks.map((link) => (
            <div key={link.path} className="relative">
              {link.dropdown ? (
                <>
                  <button
                    className={`transition-colors relative nav-underline cursor-pointer ${
                      isActive(link.path) ? 'text-primary' : 'text-primary/70 hover:text-primary'
                    }`}
                    onClick={() => {
                      closeAllDropdowns();
                      if (link.label === 'About') setAboutOpen(!aboutOpen);
                      if (link.label === 'Services') setServicesOpen(!servicesOpen);
                      if (link.label === 'E-Resources') setEresourcesOpen(!eresourcesOpen);
                    }}
                    onMouseEnter={() => {
                      if (link.label === 'About') setAboutOpen(true);
                      if (link.label === 'Services') setServicesOpen(true);
                      if (link.label === 'E-Resources') setEresourcesOpen(true);
                    }}
                    aria-expanded={
                      link.label === 'About' ? aboutOpen :
                      link.label === 'Services' ? servicesOpen :
                      eresourcesOpen
                    }
                  >
                    {link.label}
                    <span className={`material-symbols-outlined text-sm ml-1 align-middle transition-transform ${
                      (link.label === 'About' && aboutOpen) ||
                      (link.label === 'Services' && servicesOpen) ||
                      (link.label === 'E-Resources' && eresourcesOpen) ? 'rotate-180' : ''
                    }`}>
                      expand_more
                    </span>
                  </button>
                  {(link.label === 'About' && aboutOpen) ||
                   (link.label === 'Services' && servicesOpen) ||
                   (link.label === 'E-Resources' && eresourcesOpen) ? (
                    <div
                      className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-outline-variant overflow-hidden"
                      onMouseLeave={() => {
                        if (link.label === 'About') setAboutOpen(false);
                        if (link.label === 'Services') setServicesOpen(false);
                        if (link.label === 'E-Resources') setEresourcesOpen(false);
                      }}
                    >
                      {link.dropdown.map((item) => (
                        <button
                          key={item.label}
                          className="w-full text-left px-5 py-3 text-sm text-on-surface hover:bg-primary/5 hover:text-primary transition-colors border-b border-outline-variant/50 last:border-b-0 cursor-pointer"
                          onClick={() => handleNavClick(item.path)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <button
                  className={`transition-colors relative nav-underline cursor-pointer bg-transparent border-none ${
                    isActive(link.path) ? 'text-primary' : 'text-primary/70 hover:text-primary'
                  }`}
                  onClick={() => handleNavClick(link.path)}
                >
                  {link.label}
                </button>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-navy-dark z-50 transform transition-transform duration-300 ease-out lg:hidden overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gold-light/20">
          <div className="flex items-center gap-3">
            <img
              alt="JRMSU Logo"
              className="h-10 w-auto object-contain"
              src={assets.logos.jrmsu}
            />
            <div>
              <span className="font-headline-md text-headline-md font-bold text-gold-light block leading-tight text-sm">
                JRMSU Library
              </span>
              <span className="font-label-caps text-gold-light/70 tracking-[0.1em] uppercase text-[8px]">
                Katipunan Campus
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gold-light p-2 cursor-pointer bg-transparent border-none"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div className="flex flex-col p-4 gap-1">
          {navLinks.map((link) => (
            <div key={link.path}>
              {link.dropdown ? (
                <>
                  <button
                    className="w-full text-left text-on-primary/80 text-sm uppercase tracking-wider font-medium py-3 inline-flex items-center gap-1 border-b border-gold-light/10 cursor-pointer bg-transparent border-none"
                    onClick={() => {
                      if (link.label === 'About') setAboutOpen(!aboutOpen);
                      if (link.label === 'Services') setServicesOpen(!servicesOpen);
                      if (link.label === 'E-Resources') setEresourcesOpen(!eresourcesOpen);
                    }}
                    aria-expanded={
                      link.label === 'About' ? aboutOpen :
                      link.label === 'Services' ? servicesOpen :
                      eresourcesOpen
                    }
                  >
                    {link.label}
                    <span className={`material-symbols-outlined text-sm transition-transform ${
                      (link.label === 'About' && aboutOpen) ||
                      (link.label === 'Services' && servicesOpen) ||
                      (link.label === 'E-Resources' && eresourcesOpen) ? 'rotate-180' : ''
                    }`}>
                      expand_more
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-max-height duration-300 ${
                    (link.label === 'About' && aboutOpen) ||
                    (link.label === 'Services' && servicesOpen) ||
                    (link.label === 'E-Resources' && eresourcesOpen)
                    ? 'max-h-96' : 'max-h-0'
                  }`}>
                    <div className="pl-4 flex flex-col border-b border-gold-light/10">
                      {link.dropdown.map((item) => (
                        <button
                          key={item.label}
                          className="w-full text-left text-on-primary/60 hover:text-gold-light transition-colors py-2.5 text-xs uppercase tracking-wider cursor-pointer bg-transparent border-none"
                          onClick={() => handleNavClick(item.path)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <button
                  className={`w-full text-left py-3 border-b border-gold-light/10 text-sm uppercase tracking-wider font-medium cursor-pointer bg-transparent border-none ${
                    isActive(link.path) ? 'text-gold-light' : 'text-on-primary/80 hover:text-gold-light'
                  }`}
                  onClick={() => handleNavClick(link.path)}
                >
                  {link.label}
                </button>
              )}
            </div>
          ))}

        </div>
      </div>
    </nav>
  );
};
