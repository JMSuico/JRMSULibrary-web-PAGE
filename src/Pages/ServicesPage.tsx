import React, { useState } from 'react';
import { ServicesSection } from '../components/ServicesSection';
import { FeedbackSection } from '../components/FeedbackSection';
import { ExternalServicesSection } from '../components/ExternalServicesSection';

const tabs = [
  { id: 'services', label: 'Library Services' },
  { id: 'feedback', label: 'Feedback & Complaints' },
  { id: 'external', label: 'External Services' },
];

const descriptions = [
  { number: '1', label: 'Library Services Guide', text: 'Explore our streamlined processes for borrowing, research, and campus-wide clearances.' },
  { number: '2', label: 'Feedback & Complaints Mechanism', text: 'We value your feedback. Browse through the step-by-step guide below.' },
  { number: '3', label: 'External Services', text: 'Explore our external library services and partner resources.' },
];

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState('services');

  return (
    <div className="pt-24">
      <div className="max-w-max-width mx-auto px-4 md:px-gutter mb-8">
        <div className="space-y-3 mb-8 max-w-3xl mx-auto">
          {descriptions.map((desc) => (
            <div key={desc.number} className="flex items-start gap-3 p-4 rounded-xl shadow-sm border border-gold-light/10" style={{ background: 'rgba(0,24,81,0.12)', backdropFilter: 'blur(4px)' }}>
              <span className="w-7 h-7 rounded-full bg-gold-light text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{desc.number}</span>
              <div>
                <span className="font-bold text-sm" style={{ color: '#F0D97A', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{desc.label}</span>
                <p className="text-xs mt-0.5" style={{ color: '#001851', textShadow: '0 1px 4px rgba(255,255,255,0.5)' }}>{desc.text}</p>
              </div>
            </div>
          ))}
        </div>
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
      {activeTab === 'services' && <ServicesSection />}
      {activeTab === 'feedback' && <FeedbackSection />}
      {activeTab === 'external' && <ExternalServicesSection />}
    </div>
  );
}
