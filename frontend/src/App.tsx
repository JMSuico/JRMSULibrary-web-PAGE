import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router';
import { TopNavBar } from '@/src/Components/LayoutBars/TopNavBar';
import { FacebookBubble } from '@/src/Components/Shared/FacebookBubble';
import { RizalAssistant } from '@/src/Features/AIAssistant/components/RizalAssistant';
import { FeedbackStickyCard } from '@/src/Features/Feedback/components/FeedbackStickyCard';
import { ResearchSurveyStickyCard } from '@/src/Features/ResearchSurvey';
import { RizalPreviewBubble } from '@/src/Features/AIAssistant/components/RizalPreviewBubble';
import { Footer } from '@/src/Components/LayoutBars/Footer';
import { PageSkeleton } from '@/src/Components/Shared/SkeletonLoader';
import { ToastProvider } from '@/src/Hooks/useToast';
import { publicApi } from '@/src/Endpoints/cmsApi';
import { settingsApi, type SiteSettings } from '@/src/Endpoints/settingsApi';
import { InitialLoader } from '@/src/Components/Shared/InitialLoader';
import { PrivacyConsentModal } from '@/src/Components/Shared/PrivacyConsentModal';
import { PageTransition } from '@/src/Components/Shared/PageTransition';
import { useGlobalAutoRefresh } from '@/src/Hooks/useGlobalAutoRefresh';
import { useCachedQuery } from '@/src/Hooks/useCachedQuery';
import { ChunkErrorBoundary } from '@/src/Components/Shared/ChunkErrorBoundary';
import { useDevToolsProtection } from '@/src/Hooks/useDevToolsProtection';
import {
  ADMIN_LAYOUT_IMPORTER,
  ADMIN_LOGIN_IMPORTER,
  ADMIN_ROUTE_IMPORTERS,
  PUBLIC_ROUTE_IMPORTERS,
  startPublicIdlePrefetch,
} from '@/src/Libs/routePrefetch';
import '@/src/Libs/offlineQueue';

// Resolves a Django media path to a full browser-usable URL.
// Django ImageFields return relative paths like `settings/bg.jpg`.
// The /media/ prefix is served by Django's media URL route or Nginx proxy.
const resolveMediaUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
  if (path.startsWith('/media/')) return path;
  return `/media/${path}`;
};

// Public Pages
const HomePage = lazy(PUBLIC_ROUTE_IMPORTERS['/']);
const AboutPage = lazy(PUBLIC_ROUTE_IMPORTERS['/about']);
const ServicesPage = lazy(PUBLIC_ROUTE_IMPORTERS['/services']);
const AdministrationPage = lazy(PUBLIC_ROUTE_IMPORTERS['/administration']);
const PersonnelPage = lazy(PUBLIC_ROUTE_IMPORTERS['/personnel']);
const CollectionPage = lazy(PUBLIC_ROUTE_IMPORTERS['/collection']);
const PhysicalSetupPage = lazy(PUBLIC_ROUTE_IMPORTERS['/physical-setup']);

// Admin Pages
const AdminLayout = lazy(ADMIN_LAYOUT_IMPORTER);
const DashboardPage = lazy(ADMIN_ROUTE_IMPORTERS['/admin']);
const BooksManagerPage = lazy(ADMIN_ROUTE_IMPORTERS['/admin/books']);
const BatchHistoryPage = lazy(ADMIN_ROUTE_IMPORTERS['/admin/batch-history']);
const SectionsManagerPage = lazy(ADMIN_ROUTE_IMPORTERS['/admin/sections']);
const ContentManagerPage = lazy(ADMIN_ROUTE_IMPORTERS['/admin/content']);
const EResourcesManagerPage = lazy(ADMIN_ROUTE_IMPORTERS['/admin/eresources']);
const EmailMessagePage = lazy(ADMIN_ROUTE_IMPORTERS['/admin/email']);
const UserManagementPage = lazy(ADMIN_ROUTE_IMPORTERS['/admin/users']);
const ReportsPage = lazy(ADMIN_ROUTE_IMPORTERS['/admin/reports']);
const AnalyticsPage = lazy(ADMIN_ROUTE_IMPORTERS['/admin/analytics']);
const SettingsPage = lazy(ADMIN_ROUTE_IMPORTERS['/admin/settings']);
const RecycleBinPage = lazy(ADMIN_ROUTE_IMPORTERS['/admin/recycle-bin']);
const LoginPage = lazy(ADMIN_LOGIN_IMPORTER);

function PublicLayout() {
  const location = useLocation();
  const [isLoaderDone, setIsLoaderDone] = useState(false);
  // Tracks whether the Privacy Modal is currently visible, so bubbles can stay hidden.
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data: settings } = useCachedQuery<SiteSettings>({
    key: 'public:settings',
    fetcher: () => settingsApi.getSettings(),
    staleTimeMs: 60000,
    persistStorage: true,
    listenCmsUpdate: true,
  });

  // Poll for global CMS changes every 15 seconds. If detected, reload the page.
  useGlobalAutoRefresh(15000);

  // Idle background preload of public route chunks after initial mount
  useEffect(() => startPublicIdlePrefetch(), []);

  // Track visitor on every public page navigation
  useEffect(() => {
    publicApi.trackVisit(location.pathname);
  }, [location.pathname]);

  // Apply cached background immediately before settings hydrate
  useEffect(() => {
    const cachedBg = localStorage.getItem('cached_bg_image');
    if (cachedBg) {
      document.body.style.backgroundImage = `url(${cachedBg})`;
    }
  }, []);

  // Keep background image in sync with shared public:settings cache & CMS updates
  useEffect(() => {
    if (!settings) return;

    const bgPath = settings.background_image;
    if (!bgPath) {
      localStorage.removeItem('cached_bg_image');
      document.body.style.backgroundImage = 'none';
      return;
    }

    const url = resolveMediaUrl(bgPath);
    let isCancelled = false;
    const tester = new window.Image();
    tester.onload = () => {
      if (isCancelled) return;
      localStorage.setItem('cached_bg_image', url);
      document.body.style.backgroundImage = `url(${url})`;
    };
    tester.onerror = () => {
      // Leave clean navy background without crashing or flashing
    };
    tester.src = url;

    return () => {
      isCancelled = true;
    };
  }, [settings]);

  return (
    <div 
      className="flex flex-col min-h-screen transition-all duration-700 ease-in-out bg-transparent relative"
    >
      {!isLoaderDone && (
        <InitialLoader onComplete={() => setIsLoaderDone(true)} />
      )}
      <TopNavBar />
      <PrivacyConsentModal
        isLoaderDone={isLoaderDone}
        onVisibilityChange={setIsModalVisible}
      />
      <ResearchSurveyStickyCard isHidden={!isLoaderDone || isModalVisible} />
      <FeedbackStickyCard />
      <FacebookBubble isHidden={!isLoaderDone || isModalVisible} />
      <RizalAssistant isHidden={!isLoaderDone || isModalVisible} />
      <RizalPreviewBubble isHidden={!isLoaderDone || isModalVisible} />
      <main className="flex-1 relative z-0 flex flex-col">
        <Suspense fallback={<PageSkeleton />}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  useDevToolsProtection();

  return (
    <ChunkErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Admin Login - Completely isolated full-page layout */}
          <Route path="/admin/login" element={
            <ToastProvider>
              <Suspense fallback={<PageSkeleton />}>
                <LoginPage />
              </Suspense>
            </ToastProvider>
          } />

          {/* Admin Routes - Requires layout with sidebar */}
          <Route path="/admin" element={
            <Suspense fallback={<PageSkeleton />}>
              <AdminLayout />
            </Suspense>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="books" element={<BooksManagerPage />} />
            <Route path="batch-history" element={<BatchHistoryPage />} />
            <Route path="sections" element={<SectionsManagerPage />} />
            <Route path="content" element={<ContentManagerPage />} />
            <Route path="eresources" element={<EResourcesManagerPage />} />
            <Route path="email" element={<EmailMessagePage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="recycle-bin" element={<RecycleBinPage />} />
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
    </ChunkErrorBoundary>
  );
}

