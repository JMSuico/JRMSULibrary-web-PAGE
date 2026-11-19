import React from 'react';
import { useScrollRestoration } from '@/src/Hooks';
import { PersonnelSection } from '@/src/Features/Personnel/components/PersonnelSection';

const PersonnelPage = () => {
  useScrollRestoration({ storageKey: 'public:page:personnel', isReady: true });

  return (
    <section className="pt-24 min-h-screen">
      <PersonnelSection />
    </section>
  );
};

export default PersonnelPage;
