import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { assets } from '../assets/data';

export const PersonnelSection: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section id="staff" className={`py-section-py-desktop reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div id="personnel" className="max-w-max-width mx-auto px-4 md:px-gutter">

        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-4xl mb-4 font-bold" style={{ color: '#001851', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
            Library Personnel
          </h2>
          <p className="max-w-3xl mx-auto" style={{ color: '#001851', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            Meet the dedicated library professionals committed to supporting learning, research, and academic excellence at JRMSU.
          </p>
        </div>

        <div className="rounded-3xl p-8 md:p-12 shadow-2xl border border-gold-light/20 mb-16" style={{ background: 'rgba(0,24,81,0.9)', backdropFilter: 'blur(8px)' }}>
          <div className="flex flex-col items-center">
            {/* Librarian's Corner + Photo Card merged */}
            <div className="w-full mb-10">
              <div className="p-6 md:p-8 rounded-2xl shadow-lg border border-gold-light/20 hover-3d-tilt" style={{ background: 'rgba(0,24,81,0.5)', backdropFilter: 'blur(8px)' }}>
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-center">
                  <div className="flex-1 text-left">
                    <h3 className="text-3xl font-bold font-headline-lg mb-4 text-gold-light drop-shadow-lg">Librarian's Corner</h3>
                    <p className="italic mb-4 text-white/90">
                      From pages to possibilities—the JRMSU Library fosters knowledge, research, and lifelong learning in pursuit of excellence.
                    </p>
                    <p className="text-sm leading-relaxed mb-4 text-white/85">
                      The Library of Jose Rizal Memorial State University Katipunan Campus is committed to supporting the University's Vision, Mission, Goals, and Objectives by providing relevant, up-to-date, and accessible information resources and services. In adherence to the standards, the library continuously enhances its collections, facilities, and technological services to meet the evolving needs of its academic community. It also promotes information literacy, strengthens research support, and fosters collaborative linkages to contribute to institutional development. The library remains dedicated to delivering quality services and nurturing a culture of lifelong learning among its users.
                    </p>
                    <p className="text-sm text-gold-light italic drop-shadow-lg">
                      Thank you for making the library part of your journey. We are always here to support your learning, research, and growth—Padayon, JRMSUans!
                    </p>
                  </div>
                  
                  {/* Maam Kiara - Middle Right Side */}
                  <div className="w-64 flex-shrink-0 flex flex-col justify-center items-center text-center p-4 border-l-0 md:border-l border-gold-light/20">
                    <div className="w-40 h-40 rounded-full border-4 border-gold-light/40 overflow-hidden shadow-2xl mx-auto mb-4 relative group">
                      <img
                        alt="Kiara Keren M. Alavanza"
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        src={assets.images.chiefLibrarian}
                      />
                    </div>
                    <div className="bg-navy-dark/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-gold-light/10 shadow-lg w-full">
                      <h3 className="font-headline-md font-bold text-lg mb-1" style={{ color: '#F0D97A' }}>Kiara Keren M. Alavanza</h3>
                      <div className="h-0.5 w-12 bg-gold-light/50 mx-auto mb-2"></div>
                      <p className="text-white/90 font-bold tracking-widest text-xs uppercase">Campus Librarian</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Curved Arrow SVG Connector */}
            <div className="relative w-full max-w-4xl mx-auto h-20 hidden md:block">
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 800 80"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <marker id="arrowhead-gold" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#C9A84C" />
                  </marker>
                </defs>
                {/* Vertical trunk from librarian */}
                <path d="M 400 0 Q 400 10, 400 20" stroke="#C9A84C" strokeWidth="2" fill="none" />
                {/* Horizontal spine */}
                <path d="M 130 20 Q 400 20, 670 20" stroke="#C9A84C" strokeWidth="2" fill="none" />
                {/* Curved drops to each staff with arrowheads */}
                <path d="M 130 20 Q 130 30, 130 45" stroke="#C9A84C" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-gold)" />
                <path d="M 400 20 Q 400 30, 400 45" stroke="#C9A84C" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-gold)" />
                <path d="M 670 20 Q 670 30, 670 45" stroke="#C9A84C" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-gold)" />
              </svg>
            </div>

            {/* Mobile simple connector */}
            <div className="w-0.5 h-8 bg-gold-light md:hidden"></div>
            <div className="w-3/4 max-w-3xl h-0.5 bg-gold-light mb-2 md:hidden"></div>

            {/* Staff Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-2">
              {[
                { initials: 'MP', name: 'Marquita P. Morata', title: 'Staff, Library', delay: '0.2s' },
                { initials: 'BP', name: 'Bernie Rey L. Palon', title: 'Staff, Library', delay: '0.4s' },
                { initials: 'RR', name: 'Reizel C. Rosauro', title: 'Staff, Library', delay: '0.6s' },
              ].map((person, idx) => (
                <div key={idx} className="fade-up-entrance flex flex-col items-center" style={{ transitionDelay: person.delay }}>
                  <div className="w-0.5 h-6 bg-gold-light md:hidden"></div>
                  <div
                    className="border-2 border-gold-light/30 rounded-2xl p-6 text-center w-full shadow-md hover-3d-tilt"
                    style={{ background: 'rgba(0,24,81,0.5)', backdropFilter: 'blur(8px)' }}
                  >
                    <div className="w-20 h-20 rounded-full bg-navy-dark text-gold-light flex items-center justify-center text-xl font-bold mx-auto mb-3 shadow-lg">
                      {person.initials}
                    </div>
                    <h3 className="font-headline-md font-bold mb-1 text-lg leading-tight uppercase" style={{ color: '#F0D97A' }}>
                      {person.name}
                    </h3>
                    <p className="font-label-caps font-semibold text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>{person.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
