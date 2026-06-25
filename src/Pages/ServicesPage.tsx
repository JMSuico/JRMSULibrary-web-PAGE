import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ServicesSection } from '../components/ServicesSection';
import { FeedbackSection } from '../components/FeedbackSection';
import { ExternalServicesSection } from '../components/ExternalServicesSection';

const tabs = [
  { id: 'services', label: 'Library Services' },
  { id: 'feedback', label: 'Feedback & Complaints' },
  { id: 'external', label: 'External Services' },
];

const descriptions: Record<string, { label: string; text: string }> = {
  services: { label: 'Library Services Guide', text: 'Explore our streamlined processes for borrowing, research, and campus-wide clearances.' },
  feedback: { label: 'Feedback & Complaints Mechanism', text: 'We value your feedback. Browse through the step-by-step guide below.' },
  external: { label: 'External Services', text: 'Explore our external library services and partner resources.' },
};

export default function ServicesPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('services');

  useEffect(() => {
    if (location.hash) {
      const hash = location.hash.replace('#', '');
      if (tabs.some(t => t.id === hash)) {
        setActiveTab(hash);
      }
    }
  }, [location.hash]);

  return (
    <section className="pt-24 min-h-screen">
      <div className="max-w-max-width mx-auto px-4 md:px-gutter mb-6 pt-4">
        <div className="text-center mb-6">
          <h2 className="font-headline-lg font-bold text-4xl mb-4" style={{ color: '#001851', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
            {descriptions[activeTab].label}
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: '#001851', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            {descriptions[activeTab].text}
          </p>
        </div>

        {/* Radio / Tab buttons — below the description, outside the card */}
        <div className="flex flex-wrap justify-center gap-2">
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
        </div>

      {/* Section content — the modal cards render inside each component */}
      {activeTab === 'services' && <ServicesSection />}
      {activeTab === 'feedback' && <FeedbackSection />}
      {activeTab === 'external' && <ExternalServicesSection />}
    </section>
  );
}
