import React from 'react';
import { useScrollRestoration } from '@/src/Hooks';
import { LibrarySectionCarousel } from '@/src/Features/PhysicalSetup/components/LibrarySectionCarousel';

const PhysicalSetupPage = () => {
  useScrollRestoration({ storageKey: 'public:page:physical-setup', isReady: true });

  return (
    <section className="pt-24 min-h-screen">
      <LibrarySectionCarousel />
    </section>
  );
};

export default PhysicalSetupPage;
