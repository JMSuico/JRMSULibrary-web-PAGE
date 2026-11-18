import type { ComponentType } from 'react';

export type RouteModule = { default: ComponentType<Record<string, never>> };
export type RouteImporter = () => Promise<RouteModule>;

export const PUBLIC_ROUTE_IMPORTERS = {
  '/': () => import('@/src/Pages/Home/HomePage'),
  '/about': () => import('@/src/Pages/About/AboutPage'),
  '/services': () => import('@/src/Pages/Services/ServicesPage'),
  '/administration': () => import('@/src/Pages/Administration/AdministrationPage'),
  '/personnel': () => import('@/src/Pages/Personnel/PersonnelPage'),
  '/collection': () => import('@/src/Pages/Collection/CollectionPage'),
  '/physical-setup': () => import('@/src/Pages/PhysicalSetup/PhysicalSetupPage'),
} as const satisfies Record<string, RouteImporter>;

export const ADMIN_LAYOUT_IMPORTER: RouteImporter = () =>
  import('@/src/Pages/Admin/AdminLayout');

export const ADMIN_LOGIN_IMPORTER: RouteImporter = () =>
  import('@/src/Pages/Admin/LoginPage');

export const ADMIN_ROUTE_IMPORTERS = {
  '/admin': () => import('@/src/Pages/Admin/DashboardPage'),
  '/admin/books': () => import('@/src/Pages/Admin/BooksManagerPage'),
  '/admin/batch-history': () => import('@/src/Pages/Admin/BatchHistoryPage'),
  '/admin/sections': () => import('@/src/Pages/Admin/SectionsManagerPage'),
  '/admin/content': () => import('@/src/Pages/Admin/ContentManagerPage'),
  '/admin/eresources': () => import('@/src/Pages/Admin/EResourcesManagerPage'),
  '/admin/email': () => import('@/src/Pages/Admin/EmailMessagePage'),
  '/admin/users': () => import('@/src/Pages/Admin/UserManagementPage'),
  '/admin/analytics': () => import('@/src/Pages/Admin/AnalyticsPage'),
  '/admin/reports': () => import('@/src/Pages/Admin/ReportsPage'),
  '/admin/settings': () => import('@/src/Pages/Admin/SettingsPage'),
  '/admin/recycle-bin': () => import('@/src/Pages/Admin/RecycleBinPage'),
} as const satisfies Record<string, RouteImporter>;

const ALL_ROUTE_IMPORTERS: Record<string, RouteImporter> = {
  ...PUBLIC_ROUTE_IMPORTERS,
  ...ADMIN_ROUTE_IMPORTERS,
  '/admin/login': ADMIN_LOGIN_IMPORTER,
};

const prefetchedRoutes = new Set<string>();

const normalizeRoutePath = (rawPath: string): string => {
  const withoutHash = rawPath.split('#')[0] || '/';
  const withoutQuery = withoutHash.split('?')[0] || '/';
  if (withoutQuery === '/collection' || withoutQuery.startsWith('/collection/')) {
    return '/collection';
  }
  if (withoutQuery.length > 1 && withoutQuery.endsWith('/')) {
    return withoutQuery.slice(0, -1);
  }
  return withoutQuery;
};

export const prefetchRoute = (rawPath: string): void => {
  const normalized = normalizeRoutePath(rawPath);
  if (prefetchedRoutes.has(normalized)) return;

  const importer = ALL_ROUTE_IMPORTERS[normalized];
  if (!importer) return;

  prefetchedRoutes.add(normalized);
  void importer().catch(() => {
    prefetchedRoutes.delete(normalized);
  });
};

const scheduleIdlePrefetch = (routes: readonly string[]): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  let cancelled = false;
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let idleId: number | null = null;

  const runQueue = (index: number): void => {
    if (cancelled || index >= routes.length) return;
    prefetchRoute(routes[index]);
    timerId = setTimeout(() => runQueue(index + 1), 120);
  };

  if ('requestIdleCallback' in window) {
    idleId = window.requestIdleCallback(() => runQueue(0), { timeout: 2000 });
  } else {
    timerId = setTimeout(() => runQueue(0), 1200);
  }

  return () => {
    cancelled = true;
    if (idleId !== null && 'cancelIdleCallback' in window) {
      window.cancelIdleCallback(idleId);
    }
    if (timerId !== null) {
      clearTimeout(timerId);
    }
  };
};

export const startPublicIdlePrefetch = (): (() => void) =>
  scheduleIdlePrefetch(Object.keys(PUBLIC_ROUTE_IMPORTERS));

export const startAdminIdlePrefetch = (): (() => void) =>
  scheduleIdlePrefetch(Object.keys(ADMIN_ROUTE_IMPORTERS));
