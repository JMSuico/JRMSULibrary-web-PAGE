import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TopNavBar } from '@/src/Components/LayoutBars/TopNavBar';
import { FacebookBubble } from '@/src/Components/Shared/FacebookBubble';
import { FeedbackStickyCard } from '@/src/Features/Feedback/components/FeedbackStickyCard';
import { RizalAssistant } from '@/src/Features/AIAssistant/components/RizalAssistant';
import { Footer } from '@/src/Components/LayoutBars/Footer';
import { PageSkeleton } from '@/src/Components/Shared/SkeletonLoader';

const HomePage = lazy(() => import('@/src/Pages/Home/HomePage'));
const AboutPage = lazy(() => import('@/src/Pages/About/AboutPage'));
const ServicesPage = lazy(() => import('@/src/Pages/Services/ServicesPage'));
const AdministrationPage = lazy(() => import('@/src/Pages/Administration/AdministrationPage'));
const PersonnelPage = lazy(() => import('@/src/Pages/Personnel/PersonnelPage'));
const CollectionPage = lazy(() => import('@/src/Pages/Collection/CollectionPage'));
const PhysicalSetupPage = lazy(() => import('@/src/Pages/PhysicalSetup/PhysicalSetupPage'));

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
