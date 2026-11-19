import React from 'react';
import { useScrollRestoration } from '@/src/Hooks';
import { HeroSection } from '@/src/Features/Home/components/HeroSection';
import { FeedbackSection } from '@/src/Features/Feedback/components/FeedbackSection';
import { ExternalServicesSection } from '@/src/Features/Services/components/ExternalServicesSection';
import { LibraryMapSection } from '@/src/Features/Home/components/LibraryMapSection';
import { UOPACSection } from '@/src/Components/Shared/UOPACSection';

const HomePage = () => {
  useScrollRestoration({ storageKey: 'public:page:home', isReady: true });

  return (
    <>
      <HeroSection />
      <FeedbackSection />
      <ExternalServicesSection />
      <LibraryMapSection />
      <UOPACSection />
    </>
  );
};

export default HomePage;
