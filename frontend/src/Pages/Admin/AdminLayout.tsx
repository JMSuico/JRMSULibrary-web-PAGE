import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/src/Features/Admin/components/AdminSidebar';
import { AdminTopbar } from '@/src/Features/Admin/components/AdminTopbar';
import '@/src/LayoutStyles/admin.css';
import { ToastProvider } from '@/src/Hooks/useToast';
import { userApi, User } from '@/src/Endpoints/userApi';
import { Loader2 } from 'lucide-react';
import { PageTransition } from '@/src/Components/Shared/PageTransition';
import { useGlobalAutoRefresh } from '@/src/Hooks/useGlobalAutoRefresh';

import bgImage from '@/src/Assets/assets/JRMSU library lib.jpg';

/** Map route paths to human-readable page titles */
const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard Overview',
  '/admin/books': 'Newly Acquired Books',
  '/admin/batch-history': 'Batch History',
  '/admin/sections': 'Library Sections',
  '/admin/content': 'Content Manager',
  '/admin/eresources': 'E-Resources',
  '/admin/email': 'Email & Reservations',
  '/admin/users': 'User Management',
  '/admin/analytics': 'Analytics',
  '/admin/reports': 'Document Reports',
  '/admin/settings': 'Settings',
  '/admin/recycle-bin': 'Recycle Bin',
};

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await userApi.me();
        setUser(currentUser);
        setIsAuthenticated(true);
      } catch (err) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  return { isAuthenticated, user, setUser }; 
};

const useInactivityTimer = (timeoutMs: number, onTimeout: () => void) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onTimeout();
    }, timeoutMs);
  }, [timeoutMs, onTimeout]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    
    const handleActivity = () => resetTimer();
    
    // Set initial timer
    resetTimer();

    // Attach listeners
    events.forEach(event => document.addEventListener(event, handleActivity));
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => document.removeEventListener(event, handleActivity));
    };
  }, [resetTimer]);
};

export interface AdminOutletContext {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, setUser } = useAuth();

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Admin Panel';

  // Monitor server connection: if server drops and reconnects, force reload. (Ignores normal CMS updates)
  useGlobalAutoRefresh(15000, false);

  const handleAutoLogout = useCallback(async () => {
    try {
      await userApi.logout();
    } catch (e) {
      console.warn("Auto-logout error:", e);
    }
    // Reload to fully clear all memory state
    window.location.href = '/admin/login?timeout=1';
  }, []);

  // 5 minutes = 300000 ms
  useInactivityTimer(300000, handleAutoLogout);

  const handleToggleSidebar = useCallback(() => {
    // Under 1024px (lg breakpoint), toggle the mobile overlay; on desktop, collapse/expand
    if (window.innerWidth < 1024) {
      setMobileOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  }, []);

  const handleCloseMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  // Heartbeat to keep account online
  useEffect(() => {
    if (isAuthenticated) {
      userApi.heartbeat(); // Initial ping
      const interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          userApi.heartbeat();
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Wait for auth check
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-navy mb-4" />
        <p className="text-gray-500 font-inter">Verifying session...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (isAuthenticated === false) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return (
    <ToastProvider>
      <div 
        className="admin-layout relative min-h-screen"
        style={{
          backgroundImage: `linear-gradient(to right, color-mix(in srgb, var(--color-surface-container-low) 85%, transparent), color-mix(in srgb, var(--color-surface-container-low) 85%, transparent)), url("${bgImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        
        {/* Background mesh gradient is handled in admin.css via .admin-layout */}

        <AdminSidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={handleCloseMobile}
        />
        <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <AdminTopbar
            pageTitle={pageTitle}
            onToggleSidebar={handleToggleSidebar}
            user={user}
            onUserUpdate={(updatedUser) => setUser(updatedUser)}
          />
          <div className="admin-content bg-transparent">
            <div className="bg-white/95 rounded-3xl shadow-lg border border-gray-200/60 p-4 sm:p-6 md:p-8 min-h-[calc(100vh-120px)] backdrop-blur-sm overflow-x-hidden">
              <PageTransition>
                <Outlet context={{ user, setUser } satisfies AdminOutletContext} />
              </PageTransition>
            </div>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
