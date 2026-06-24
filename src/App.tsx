/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TopNavBar } from './components/TopNavBar';
import { HeroSection } from './components/HeroSection';
import { PersonnelSection } from './components/PersonnelSection';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { FileServicesSection } from './components/FileServicesSection';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <>
      <TopNavBar />
      <main>
        <HeroSection />
        <PersonnelSection />
        <AboutSection />
        <ServicesSection />
        <FileServicesSection />
      </main>
      <Footer />
    </>
  );
}
