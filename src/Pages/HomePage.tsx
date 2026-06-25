import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { PersonnelSection } from '../components/PersonnelSection';
import { LibraryMapSection } from '../components/LibraryMapSection';
import { UOPACSection } from '../components/UOPACSection';
import { NewlyAcquiredBooks } from '../components/NewlyAcquiredBooks';
import { LibrarySectionCarousel } from '../components/LibrarySectionCarousel';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <NewlyAcquiredBooks />
      <LibrarySectionCarousel />
      <PersonnelSection />
      <LibraryMapSection />
      <UOPACSection />
    </>
  );
}
