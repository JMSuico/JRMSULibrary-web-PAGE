import React from 'react';
import { ServicesSection } from '../components/ServicesSection';
import { FeedbackSection } from '../components/FeedbackSection';
import { ExternalServicesSection } from '../components/ExternalServicesSection';

export default function ServicesPage() {
  return (
    <div className="pt-24">
      <ServicesSection />
      <FeedbackSection />
      <ExternalServicesSection />
    </div>
  );
}
