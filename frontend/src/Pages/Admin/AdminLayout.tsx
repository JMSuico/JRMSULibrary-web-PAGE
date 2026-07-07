import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/src/Features/Admin/components/AdminSidebar';
import { AdminTopbar } from '@/src/Features/Admin/components/AdminTopbar';
import '@/src/LayoutStyles/admin.css';
import { ToastProvider } from '@/src/Hooks/useToast';
import { userApi, User } from '@/src/Endpoints/userApi';
import { Loader2 } from 'lucide-react';

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
    // On mobile, toggle the mobile overlay; on desktop, collapse/expand
    if (window.innerWidth < 768) {
      setMobileOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  }, []);

  const handleCloseMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

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
      <div className="admin-layout relative bg-gray-50 min-h-screen">
        
        {/* Radiant background removed as requested */}

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
            <div className="bg-white/90 rounded-3xl shadow-xl shadow-navy/5 border border-white/50 p-6 md:p-8 min-h-[calc(100vh-120px)]">
              <Outlet context={{ user, setUser } satisfies AdminOutletContext} />
            </div>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
