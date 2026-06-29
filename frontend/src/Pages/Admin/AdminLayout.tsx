import { useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from '@/src/Features/Admin/components/AdminSidebar';
import { AdminTopbar } from '@/src/Features/Admin/components/AdminTopbar';
import '@/src/LayoutStyles/admin.css';

/** Map route paths to human-readable page titles */
const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/books': 'Newly Acquired Books',
  '/admin/sections': 'Library Sections',
  '/admin/content': 'Content Manager',
  '/admin/eresources': 'E-Resources',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
};

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

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

  return (
    <div className="admin-layout">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={handleCloseMobile}
      />
      <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
           style={{ marginLeft: sidebarCollapsed ? 72 : undefined }}>
        <AdminTopbar
          pageTitle={pageTitle}
          onToggleSidebar={handleToggleSidebar}
        />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
