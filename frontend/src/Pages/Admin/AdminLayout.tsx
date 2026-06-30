import { useState, useEffect, useCallback } from 'react';
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
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
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

  return { isAuthenticated, user }; 
};

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Admin Panel';

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
        <Loader2 className="w-10 h-10 animate-spin text-[#002B7F] mb-4" />
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
      <div className="admin-layout relative overflow-hidden bg-gray-50 min-h-screen">
        
        {/* Dynamic Background Elements shared across all Admin pages */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 fixed">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#002B7F] blur-[120px] opacity-15 animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#C9A84C] blur-[120px] opacity-15" style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite 2s' }}></div>
        </div>

        <AdminSidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={handleCloseMobile}
        />
        <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''} relative z-10`}>
          <AdminTopbar
            pageTitle={pageTitle}
            onToggleSidebar={handleToggleSidebar}
          />
          <div className="admin-content relative z-10 bg-transparent">
            <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-xl shadow-[#002B7F]/5 border border-white/50 p-6 md:p-8 min-h-[calc(100vh-120px)]">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
