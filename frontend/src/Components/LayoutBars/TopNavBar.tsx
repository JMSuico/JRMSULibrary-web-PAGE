import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { assets } from '@/src/Libs/Assets/data';

export const TopNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Settings state
  const [libraryName, setLibraryName] = useState('JRMSU Katipunan Campus Library');

  // State for dropdowns
  const [aboutOpen, setAboutOpen] = useState(false);
  const [administrationOpen, setAdministrationOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Fetch settings
    fetch('/api/settings/')
      .then(res => res.json())
      .then(data => {
        if (data && data.library_name) {
          setLibraryName(data.library_name);
        }
      })
      .catch(err => console.error(err));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
    setAboutOpen(false);
    setAdministrationOpen(false);
    setCollectionOpen(false);
  }, [location.pathname]);

  type DropdownItem = { label: string; path: string };
  type NavLink = { label: string; path: string; dropdown?: DropdownItem[] };

  const aboutItems: DropdownItem[] = [
    { label: 'History of JRMSU Katipunan Campus', path: '/about#history' },
    { label: 'Quality Objectives', path: '/about#objectives' },
  ];

  const administrationItems: DropdownItem[] = [
    { label: 'Administration', path: '/administration#administration' },
    { label: 'Manual', path: '/administration#manual' },
  ];

  const collectionItems: DropdownItem[] = [
    { label: 'Newly Acquired Books', path: '/collection/newly-acquired' },
    { label: 'Local Books', path: '/collection/local-books' },
    { label: 'Online Access', path: '/collection/online' },
    { label: 'External Libraries', path: '/collection/external-libraries' },
  ];

  const navLinks: NavLink[] = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about', dropdown: aboutItems },
    { label: 'Services', path: '/services' },
    { label: 'Administration', path: '/administration', dropdown: administrationItems },
    { label: 'Personnel', path: '/personnel' },
    { label: 'Collection', path: '/collection', dropdown: collectionItems },
    { label: 'Physical Setup', path: '/physical-setup' },
  ];

  const handleNavClick = (path: string) => {
    setSidebarOpen(false);
    setAboutOpen(false);
    setAdministrationOpen(false);
    setCollectionOpen(false);
    navigate(path);
  };

  const isActive = (path: string) => location.pathname === path;

  const closeAllDropdowns = () => {
    setAboutOpen(false);
    setAdministrationOpen(false);
    setCollectionOpen(false);
  };

  return (
    <nav
      className="fixed top-0 w-full z-50 h-20 transition-all duration-300 bg-white shadow-sm border-b border-gray-200"
      style={{ background: 'linear-gradient(to right, #ffffff, #001851)' }}
    >
      <div className="flex justify-between items-center max-w-max-width mx-auto px-4 md:px-gutter h-full">
        {/* Left side: Hamburger + Logo + Text */}
        <div className="flex items-center gap-3">
          {/* Hamburger icon — visible only on mobile/tablet (left of logo) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1 text-primary/90 hover:text-primary transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center"
            aria-label="Open navigation menu"
          >
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>

          {/* Logo — links to home on desktop, also triggers sidebar on mobile via parent div */}
          <button
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-3 cursor-pointer bg-transparent border-none p-0"
            aria-label="Go to Home"
          >
            <img
              alt="JRMSU Logo"
              className="h-12 w-auto object-contain"
              src={assets.logos.jrmsu}
            />
            <div className="text-left max-w-[200px] sm:max-w-[250px]">
              <span className="font-headline-md font-bold text-primary block leading-tight text-[13px] sm:text-base truncate">
                {libraryName.replace(/ Library$/i, '')}
              </span>
              <span className="font-label-caps text-primary/70 tracking-[0.1em] uppercase text-[10px] sm:text-[11px]">
                Library
              </span>
            </div>
          </button>
        </div>

        {/* Desktop nav */}
        <div className="hidden lg:flex gap-4 xl:gap-8 items-center font-ui-nav text-[10px] xl:text-xs uppercase tracking-wider">
          {navLinks.map((link) => (
            <div 
              key={link.path} 
              className="relative"
              onMouseEnter={() => {
                if (link.label === 'About') setAboutOpen(true);
                if (link.label === 'Administration') setAdministrationOpen(true);
                if (link.label === 'Collection') setCollectionOpen(true);
              }}
              onMouseLeave={() => {
                if (link.label === 'About') setAboutOpen(false);
                if (link.label === 'Administration') setAdministrationOpen(false);
                if (link.label === 'Collection') setCollectionOpen(false);
              }}
            >
              {link.dropdown ? (
                <>
                  <button
                    className={`transition-colors relative nav-underline cursor-pointer bg-transparent border-none p-0 flex items-center ${
                      isActive(link.path) ? 'text-gold-light' : 'text-white/80 hover:text-gold-light'
                    }`}
                    onClick={() => {
                      closeAllDropdowns();
                      if (link.label === 'About') { setAboutOpen(!aboutOpen); handleNavClick(link.path); }
                      if (link.label === 'Administration') { setAdministrationOpen(!administrationOpen); handleNavClick(link.path); }
                      if (link.label === 'Collection') { setCollectionOpen(!collectionOpen); handleNavClick(link.path); }
                    }}
                    aria-expanded={
                      link.label === 'About' ? aboutOpen :
                      link.label === 'Administration' ? administrationOpen :
                      link.label === 'Collection' ? collectionOpen : false
                    }
                  >
                    {link.label}
                    <span className={`material-symbols-outlined text-sm ml-1 align-middle transition-transform ${
                      (link.label === 'About' && aboutOpen) ||
                      (link.label === 'Administration' && administrationOpen) ||
                      (link.label === 'Collection' && collectionOpen) ? 'rotate-180' : ''
                    }`}>
                      expand_more
                    </span>
                  </button>
                  {(link.label === 'About' && aboutOpen) ||
                   (link.label === 'Administration' && administrationOpen) ||
                   (link.label === 'Collection' && collectionOpen) ? (
                    <div
                      className="absolute top-full left-0 pt-2 w-64 z-50"
                    >
                      <div className="bg-white rounded-xl shadow-2xl border border-outline-variant overflow-hidden">
                        {link.dropdown.map((item) => (
                          <button
                            key={item.label}
                            className="w-full text-left px-5 py-3 text-sm text-on-surface hover:bg-primary/5 hover:text-primary transition-colors border-b border-outline-variant/50 last:border-b-0 cursor-pointer bg-transparent"
                            onClick={() => handleNavClick(item.path)}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <button
                  className={`transition-colors relative nav-underline cursor-pointer bg-transparent border-none p-0 flex items-center ${
                    isActive(link.path) ? 'text-gold-light' : 'text-white/80 hover:text-gold-light'
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-modal-overlay"
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
              <span className="font-headline-md font-bold text-gold-light block leading-tight text-sm">
                JRMSU Katipunan Campus
              </span>
              <span className="font-label-caps text-gold-light/70 tracking-[0.1em] uppercase text-[10px]">
                Library
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
                      if (link.label === 'Administration') setAdministrationOpen(!administrationOpen);
                      if (link.label === 'Collection') setCollectionOpen(!collectionOpen);
                    }}
                    aria-expanded={
                      link.label === 'About' ? aboutOpen :
                      link.label === 'Administration' ? administrationOpen :
                      link.label === 'Collection' ? collectionOpen : false
                    }
                  >
                    {link.label}
                    <span className={`material-symbols-outlined text-sm transition-transform ml-auto ${
                      (link.label === 'About' && aboutOpen) ||
                      (link.label === 'Administration' && administrationOpen) ||
                      (link.label === 'Collection' && collectionOpen) ? 'rotate-180' : ''
                    }`}>
                      expand_more
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-max-height duration-300 ${
                    (link.label === 'About' && aboutOpen) ||
                    (link.label === 'Administration' && administrationOpen) ||
                    (link.label === 'Collection' && collectionOpen)
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
