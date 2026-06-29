import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { TopNavBar } from '@/src/Components/LayoutBars/TopNavBar';
import { FacebookBubble } from '@/src/Components/Shared/FacebookBubble';
import { FeedbackStickyCard } from '@/src/Features/Feedback/components/FeedbackStickyCard';
import { RizalAssistant } from '@/src/Features/AIAssistant/components/RizalAssistant';
import { Footer } from '@/src/Components/LayoutBars/Footer';
import { PageSkeleton } from '@/src/Components/Shared/SkeletonLoader';

// Public Pages
const HomePage = lazy(() => import('@/src/Pages/Home/HomePage'));
const AboutPage = lazy(() => import('@/src/Pages/About/AboutPage'));
const ServicesPage = lazy(() => import('@/src/Pages/Services/ServicesPage'));
const AdministrationPage = lazy(() => import('@/src/Pages/Administration/AdministrationPage'));
const PersonnelPage = lazy(() => import('@/src/Pages/Personnel/PersonnelPage'));
const CollectionPage = lazy(() => import('@/src/Pages/Collection/CollectionPage'));
const PhysicalSetupPage = lazy(() => import('@/src/Pages/PhysicalSetup/PhysicalSetupPage'));

// Admin Pages
const AdminLayout = lazy(() => import('@/src/Pages/Admin/AdminLayout'));
const DashboardPage = lazy(() => import('@/src/Pages/Admin/DashboardPage'));
const BooksManagerPage = lazy(() => import('@/src/Pages/Admin/BooksManagerPage'));
const SectionsManagerPage = lazy(() => import('@/src/Pages/Admin/SectionsManagerPage'));
const ContentManagerPage = lazy(() => import('@/src/Pages/Admin/ContentManagerPage'));
const EResourcesManagerPage = lazy(() => import('@/src/Pages/Admin/EResourcesManagerPage'));

function PublicLayout() {
  return (
    <>
      <TopNavBar />
      <FacebookBubble />
      <FeedbackStickyCard />
      <RizalAssistant />
      <main>
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes - Completely isolated from public layout */}
        <Route path="/admin" element={
          <Suspense fallback={<PageSkeleton />}>
            <AdminLayout />
          </Suspense>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="books" element={<BooksManagerPage />} />
          <Route path="sections" element={<SectionsManagerPage />} />
          <Route path="content" element={<ContentManagerPage />} />
          <Route path="eresources" element={<EResourcesManagerPage />} />
          {/* Fallbacks for placeholder routes */}
          <Route path="analytics" element={<DashboardPage />} />
          <Route path="settings" element={<DashboardPage />} />
        </Route>

        {/* Public Website Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="administration" element={<AdministrationPage />} />
          <Route path="personnel" element={<PersonnelPage />} />
          <Route path="collection" element={<CollectionPage />} />
          <Route path="collection/:tab" element={<CollectionPage />} />
          <Route path="physical-setup" element={<PhysicalSetupPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
