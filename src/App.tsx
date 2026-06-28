import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TopNavBar } from './components/TopNavBar';
import { FacebookBubble } from './components/FacebookBubble';
import { FeedbackStickyCard } from './components/FeedbackStickyCard';
import { RizalAssistant } from './components/RizalAssistant';
import { Footer } from './components/Footer';
import { PageSkeleton } from './components/SkeletonLoader';

const HomePage = lazy(() => import('./Pages/HomePage'));
const AboutPage = lazy(() => import('./Pages/AboutPage'));
const ServicesPage = lazy(() => import('./Pages/ServicesPage'));
const AdministrationPage = lazy(() => import('./Pages/AdministrationPage'));
const PersonnelPage = lazy(() => import('./Pages/PersonnelPage'));
const CollectionPage = lazy(() => import('./Pages/CollectionPage'));
const PhysicalSetupPage = lazy(() => import('./Pages/PhysicalSetupPage'));

export default function App() {
  return (
    <BrowserRouter>
      <TopNavBar />
      <FacebookBubble />
      <FeedbackStickyCard />
      <RizalAssistant />
      <main>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/administration" element={<AdministrationPage />} />
            <Route path="/personnel" element={<PersonnelPage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/collection/:tab" element={<CollectionPage />} />
            <Route path="/physical-setup" element={<PhysicalSetupPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
