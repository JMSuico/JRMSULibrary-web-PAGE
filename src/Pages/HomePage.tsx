import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { FeedbackSection } from '../components/FeedbackSection';
import { ExternalServicesSection } from '../components/ExternalServicesSection';
import { LibraryMapSection } from '../components/LibraryMapSection';
import { UOPACSection } from '../components/UOPACSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeedbackSection />
      <ExternalServicesSection />
      <LibraryMapSection />
      <UOPACSection />
    </>
  );
}
