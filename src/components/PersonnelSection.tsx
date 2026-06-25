import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { assets } from '../assets/data';

export const PersonnelSection: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section id="staff" className={`py-section-py-desktop reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div id="personnel" className="max-w-max-width mx-auto px-4 md:px-gutter">

        {/* ========== PART 1: Library Personnel Org Chart ========== */}
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-4xl text-primary mb-4 font-bold">Library Personnel</h2>
          <p className="text-on-surface-variant max-w-3xl mx-auto">
            Meet the dedicated library professionals committed to supporting learning, research, and academic excellence at JRMSU.
          </p>
        </div>

        <div className="bg-primary/95 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl border border-gold-light/20 mb-16">
          <div className="flex flex-col items-center">
            {/* Chief Librarian */}
            <div className="fade-down-entrance mb-2 w-full max-w-sm">
              <div className="p-6 rounded-2xl text-center flex flex-col items-center bg-primary text-white shadow-lg">
                <div className="w-32 h-32 rounded-full border-4 border-gold-light/40 overflow-hidden shadow-xl mb-4">
                  <img
                    alt="Kiara Keren M. Alavanza"
                    className="w-full h-full rounded-full object-cover"
                    src={assets.images.chiefLibrarian}
                  />
                </div>
                <h3 className="font-headline-md font-bold text-xl mb-1">Kiara Keren M. Alavanza</h3>
                <p className="text-gold-light font-bold tracking-widest text-xs uppercase">Campus Librarian</p>
              </div>
            </div>

            {/* Vertical Connector */}
            <div className="w-0.5 h-8 bg-gold-light"></div>

            {/* Horizontal Bar */}
            <div className="hidden md:block w-3/4 max-w-3xl h-0.5 bg-gold-light mb-2"></div>

            {/* Staff Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-2">
              {[
                { initials: 'MP', name: 'Marquita P. Morata', title: 'Staff, Library', delay: '0.2s' },
                { initials: 'BP', name: 'Bernie Rey L. Palon', title: 'Staff, Library', delay: '0.4s' },
                { initials: 'RR', name: 'Reizel C. Rosauro', title: 'Staff, Library', delay: '0.6s' },
              ].map((person, idx) => (
                <div key={idx} className="fade-up-entrance flex flex-col items-center" style={{ transitionDelay: person.delay }}>
                  <div className="hidden md:block w-0.5 h-6 bg-gold-light"></div>
                  <div className="bg-primary/90 border-2 border-gold-light/30 rounded-2xl p-6 text-center w-full shadow-md hover:shadow-lg transition-shadow">
                    <div className="w-20 h-20 rounded-full bg-navy-dark text-gold-light flex items-center justify-center text-xl font-bold mx-auto mb-3 shadow-lg">
                      {person.initials}
                    </div>
                    <h3 className="font-headline-md font-bold text-gold-light mb-1 text-lg leading-tight uppercase">
                      {person.name}
                    </h3>
                    <p className="font-label-caps text-white/80 font-semibold text-xs">{person.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========== PART 2: Librarian's Corner — Blue Modal Card ========== */}
        <div
          className="bg-primary/95 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-gold-light/20"
        >
          <div className="flex flex-col md:flex-row gap-10 items-center">
            {/* Left Side — Text Content */}
            <div className="flex-1 text-left text-white">
              <h3 className="text-3xl font-bold font-headline-lg mb-4 text-gold-light">Librarian's Corner</h3>

              <p className="italic text-white/80 mb-4">
                From pages to possibilities—the JRMSU Library fosters knowledge, research, and lifelong learning in pursuit of excellence.
              </p>

              <p className="text-sm text-white/80 leading-relaxed mb-4">
                The Library of Jose Rizal Memorial State University Katipunan Campus is committed to supporting the University's Vision, Mission, Goals, and Objectives by providing relevant, up-to-date, and accessible information resources and services. In adherence to the standards, the library continuously enhances its collections, facilities, and technological services to meet the evolving needs of its academic community. It also promotes information literacy, strengthens research support, and fosters collaborative linkages to contribute to institutional development. The library remains dedicated to delivering quality services and nurturing a culture of lifelong learning among its users.
              </p>

              <p className="text-sm text-gold-light italic">
                Thank you for making the library part of your journey. We are always here to support your learning, research, and growth—Padayon, JRMSUans!
              </p>
            </div>

            {/* Right Side — Photo Card matching org chart style */}
            <div className="w-72 flex-shrink-0">
              <div className="p-6 rounded-2xl text-center flex flex-col items-center bg-primary text-white shadow-lg border border-gold-light/20">
                <div className="w-32 h-32 rounded-full border-4 border-gold-light/40 overflow-hidden shadow-xl mb-4">
                  <img
                    alt="Kiara Keren M. Alavanza"
                    className="w-full h-full rounded-full object-cover"
                    src={assets.images.chiefLibrarian}
                  />
                </div>
                <h3 className="font-headline-md font-bold text-xl mb-1">Kiara Keren M. Alavanza</h3>
                <p className="text-gold-light font-bold tracking-widest text-xs uppercase">Campus Librarian</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
