import React, { useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { libraryServices } from '../assets/data';

const serviceCategories = ['all', 'borrowing', 'returning', 'e-library', 'clearance'];
const badgeColors: Record<string, string> = {
  external: 'bg-success text-white',
  'internal-ext': 'bg-primary text-white',
  'e-library': 'bg-navy-mid text-white',
  internal: 'bg-secondary text-white',
};

const allServicesList = [
  'Library User Education', 'Informal Reference Service', 'Readers Advisory Services',
  'Technical Services', 'Audio-Visual Services', 'Circulation Services',
  'Ask-a-Librarian / #AskRIZAL', 'Photo/Scan Me Service', 'OPAC Service',
  'Printing Service', 'Property Counter Service', 'Selective Dissemination of Information',
  'Current Awareness Services', 'Referral Information Service (RIS)',
  'File Transfer Service', 'Internet / e-Library / Free Wi-Fi', 'Online Databases Service',
];

export const ServicesSection: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [activeTab, setActiveTab] = useState('all');
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const filteredServices = activeTab === 'all'
    ? libraryServices
    : libraryServices.filter((s) => s.badgeType === activeTab || s.id.includes(activeTab));

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div id="services" className={`py-section-py-desktop max-w-max-width mx-auto px-4 md:px-gutter reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="px-0 sm:p-4 md:p-8 md:p-12 bg-transparent">
        {/* 17 Services List */}
        <div className="mb-12 bg-navy-mid/60 rounded-2xl p-6 md:p-8 border border-gold-light/20">
          <h3 className="font-headline-md font-bold text-xl text-gold-light mb-6">Our 17 Library Services</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {allServicesList.map((service, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-navy-dark/60 rounded-lg shadow-sm border border-gold-light/10 interactive-hover">
                <span className="w-8 h-8 rounded-full bg-gold-light text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <span className="text-sm text-white/90 font-medium">{service}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Citizens Charter - Tab Filters */}
        <div className="mb-8">
          <h3 className="font-headline-md font-bold text-xl text-gold-light mb-4">Citizens Charter</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {serviceCategories.map((cat) => (
              <button
                key={cat}
                className={`tab-pill ${activeTab === cat ? 'active' : ''}`}
                onClick={() => setActiveTab(cat)}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion Cards */}
        <div className="space-y-4">
          {filteredServices.map((service) => {
            const isOpen = openAccordion === service.id;
            return (
              <div key={service.id} className="accordion-card hover-3d-tilt">
                <div
                  className="accordion-header"
                  onClick={() => toggleAccordion(service.id)}
                  aria-expanded={isOpen}
                >
                  <div className="flex items-start sm:items-center gap-3 flex-wrap">
                    <span className={`px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase ${badgeColors[service.badgeType] || 'bg-primary text-white'}`}>
                      {service.badgeType === 'external' ? 'External' :
                       service.badgeType === 'internal-ext' ? 'Internal/External' :
                       service.badgeType === 'e-library' ? 'E-Library' : 'Internal'}
                    </span>
                    <div>
                      <h4 className="font-bold text-white">{service.title}</h4>
                      {service.subtitle && (
                        <p className="text-xs text-white/60">{service.subtitle}</p>
                      )}
                    </div>
                    <span className="text-xs text-white/60 ml-auto">{service.totalTime}</span>
                    <span className="text-xs font-bold text-success">{service.totalFee}</span>
                  </div>
                  <span className={`material-symbols-outlined text-gold-light transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </div>

                <div className={`accordion-panel ${isOpen ? 'open' : ''}`}>
                  <div className="accordion-panel-inner">
                    <p className="text-xs text-white/70 mb-3">
                      <span className="font-bold">Who May Avail:</span> {service.whoMayAvail}
                    </p>

                    {service.requirements.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-bold text-gold-light uppercase mb-2">Requirements</p>
                        <ul className="space-y-1">
                          {service.requirements.map((req, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-white/70">
                              <span className="material-symbols-outlined text-success text-sm">check_circle</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="overflow-x-auto bg-navy-dark/80 rounded-xl shadow-sm border border-gold-light/20">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-navy-dark text-gold-light text-left">
                            <th className="p-3">Step</th>
                            <th className="p-3">Client Step</th>
                            <th className="p-3">Agency Action</th>
                            <th className="p-3">Fees</th>
                            <th className="p-3">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gold-light/10">
                          {service.steps.map((step, i) => (
                            <tr
                              key={i}
                              className={
                                (step as any).isOverdue
                                  ? 'bg-amber-900/30 border-l-4 border-l-amber-500'
                                  : i % 2 === 0 ? 'bg-navy-dark/40' : 'bg-navy-mid/40'
                              }
                            >
                              <td className="p-3 font-bold text-gold-light">{step.step}</td>
                              <td className="p-3 text-white/80">{step.client}</td>
                              <td className="p-3 text-white/80">{step.agency}</td>
                              <td className={`p-3 font-medium text-white/80 ${(step as any).isOverdue ? 'text-amber-400' : ''}`}>{step.fees}</td>
                              <td className="p-3 text-white/80">{step.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
