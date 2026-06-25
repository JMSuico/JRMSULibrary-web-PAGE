import React, { useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const tabs = [
  { id: 'org', label: 'Organizational Structure' },
  { id: 'history', label: 'History of JRMSU' },
  { id: 'objectives', label: 'Quality Objectives' },
];

export default function AboutPage() {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [activeTab, setActiveTab] = useState('org');
  const [orgImageOpen, setOrgImageOpen] = useState(false);

  return (
    <section id="about" className={`pt-28 pb-20 reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="max-w-max-width mx-auto px-4 md:px-gutter">
        <div className="text-center mb-10">
          <h2 className="font-headline-lg font-bold text-4xl mb-4" style={{ color: '#001851', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>About the Library</h2>
          <p className="max-w-2xl mx-auto" style={{ color: '#001851', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            Discover the JRMSU Katipunan Campus Library — its commitment to quality service and academic excellence.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-pill ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-3xl p-8 md:p-12 shadow-2xl border border-gold-light/20" style={{ background: 'rgba(0,24,81,0.15)', backdropFilter: 'blur(4px)' }}>
          {activeTab === 'org' && (
            <div>
              <h3 className="font-headline-md font-bold text-2xl text-gold-light mb-8 text-center">
                Library Organizational Structure
              </h3>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setOrgImageOpen(true)}
                  className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl border-2 border-gold-light/30 cursor-pointer hover:opacity-95 transition-opacity group"
                  aria-label="View organizational structure image"
                >
                  <img
                    src="/assets/organizational structure library.png"
                    alt="JRMSU Library Organizational Structure Chart"
                    className="w-full h-auto object-contain"
                  />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-5xl opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">
                      zoom_in
                    </span>
                  </div>
                </button>
                <p className="text-sm text-white/60 mt-4">Click image to enlarge</p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-3xl mx-auto">
              <h3 className="font-headline-md font-bold text-2xl text-gold-light mb-6">History of JRMSU</h3>
              <div className="space-y-4 text-white/80 leading-relaxed">
                <p>
                  Jose Rizal Memorial State University was established by virtue of RA 9852 with Congresswoman Cecilia G. Jalosjos-Carreon as principal author, Congressman Cesar Jalosjos as co-author. It was approved by President Gloria Macapagal-Arroyo on December 15, 2009. It was formerly the Jose Rizal Memorial State College by virtue of RA 8193 sponsored by Congressman Romeo G. Jalosjos of the 1st District of Zamboanga del Norte which was approved on June 11, 1996 by the President of the Republic, Fidel V. Ramos. It was a consolidation of the Rizal Memorial Vocational School (RMNVS) in Dapitan City, the Zamboanga del Norte School of Arts and Trades (ZNSAT) in Dipolog City, and the Siocon National Vocational School (SNVS) in the Municipality of Siocon. In 2002, two higher education institutions (HEIs) within Zamboanga del Norte, namely the Katipunan National Agricultural School (KNAS) in the municipality of Katipunan and the Zamboanga del Norte Agricultural College (ZNAC) in the Municipality of Tampilisan, were integrated into then JRMSC pursuant to CHED Memorandum Order No. 27 series of 2000 thus comprising the fourth and fifth campuses, respectively of JRMSU.
                </p>
                <p>
                  The first President was Dr. Felipe O. Ligan who was appointed in 1997. On June 7, 2002 CHED Special Order No. 35, s. 2002 appointed Dr. Henry A. Sojor as the OIC President of the Jose Rizal Memorial State College in concurrent capacity as President of Central Visayas Polytechnic College in Dumaguete City now Negros Oriental State University.
                </p>
                <p>
                  In the span of two years and eight months, the Board of Trustee then deemed it best for the College to have its permanent leader. Thus, on March 1, 2005, Dr. Edgar S. Balbuena assumed office as second President of JRMSC pursuant to BOT Resolution No. 04, series of 2005 Chairmaned by Fr. Rolando V. Rosa, OP.
                </p>
                <p>
                  With the appointment of Dr. Balbuena, the College charted a new course. With his extraordinary leadership it took only four years and nine months for the College to be elevated to the status of a University. Indeed the growth of the University means a continuing and growing commitment for academic excellence and quality, research, and productivity, community involvement and partnership for national development and global competitiveness. Evidently, he emerged as a dynamo, leading the people of Zamboanga del Norte and adjacent provinces towards improved quality life.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'objectives' && (
            <div className="max-w-3xl mx-auto">
              <h3 className="font-headline-md font-bold text-2xl text-gold-light mb-6">JRMSU Library Quality Objectives</h3>
              <p className="text-white/80 mb-6">The JRMSU Library commits to:</p>
              <div className="space-y-4">
                {[
                  'Increase the acquisition of print, digital, and multimedia resources by 10% annually to ensure modern, relevant, and accessible materials that support instruction, research, extension, and production.',
                  'Increase library user engagement by 10% and ensure the 100% provision of adaptive, inclusive, and transformative library facilities that foster creativity, critical thinking, and lifelong learning.',
                  'Forge at least one (1) local and one (1) international formal partnership or collaboration each year, and implement at least one (1) joint program or activity with academic institutions, government agencies, or library networks to strengthen resource sharing, collaboration, and service innovation.',
                  'Ensure that 100% of library personnel participate in at least two (2) capacity-building or professional development activities per year, strengthening their skills in technology, research support, customer service, and library management.',
                  'Achieve a minimum of 90% overall user satisfaction rating in the annual library survey by continuously delivering equitable, technology-driven, and user-centered services.',
                ].map((obj, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-navy-mid/60 rounded-xl border border-gold-light/20">
                    <span className="w-8 h-8 rounded-full bg-primary text-gold-light flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-white/80">{obj}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {orgImageOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setOrgImageOpen(false)}
        >
          <button
            className="absolute top-6 right-6 text-white text-3xl hover:text-gold-light transition-colors cursor-pointer z-10"
            onClick={() => setOrgImageOpen(false)}
            aria-label="Close image"
          >
            <span className="material-symbols-outlined text-4xl">close</span>
          </button>
          <img
            src="/assets/organizational structure library.png"
            alt="JRMSU Library Organizational Structure Chart"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
