import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Image,
  FileText,
  Link2,
  FolderTree,
  BarChart3,
  Settings,
  LogOut,
  Library,
  Users,
  Mail,
} from 'lucide-react';

interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/admin', icon: LayoutDashboard, text: 'Dashboard', end: true },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/admin/books', icon: BookOpen, text: 'Newly Acquired Books' },
      { to: '/admin/batch-history', icon: FileText, text: 'Batch History' },
      { to: '/admin/sections', icon: Image, text: 'Library Sections' },
      { to: '/admin/content', icon: FileText, text: 'Content Manager' },
      { to: '/admin/eresources', icon: FolderTree, text: 'E-Resources' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/email', icon: Mail, text: 'Email & Reservations' },
      { to: '/admin/users', icon: Users, text: 'User Management' },
      { to: '/admin/analytics', icon: BarChart3, text: 'Analytics' },
      { to: '/admin/reports', icon: FileText, text: 'Reports Generator' },
      { to: '/admin/settings', icon: Settings, text: 'Settings' },
    ],
  },

] as const;

export function AdminSidebar({ collapsed, mobileOpen, onCloseMobile }: AdminSidebarProps) {
  const location = useLocation();

  const sidebarClasses = [
    'admin-sidebar',
    collapsed ? 'collapsed' : '',
    mobileOpen ? 'open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={sidebarClasses} aria-label="Admin navigation">
        {/* Brand */}
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__brand-logo" aria-hidden="true">
            <Library size={22} />
          </div>
          {!collapsed && (
            <div className="admin-sidebar__brand-text">
              <span className="admin-sidebar__brand-title">JRMSU Library</span>
              <span className="admin-sidebar__brand-sub">Admin Panel</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar__nav">
          {NAV_SECTIONS.map((section) => (
            <React.Fragment key={section.label}>
              {!collapsed && (
                <span className="admin-sidebar__section-label">{section.label}</span>
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={'end' in item ? item.end : false}
                  className={({ isActive }) =>
                    `admin-sidebar__link ${isActive ? 'active' : ''}`
                  }
                  onClick={onCloseMobile}
                  aria-label={item.text}
                >
                  <item.icon className="admin-sidebar__link-icon" size={20} />
                  {!collapsed && (
                    <span className="admin-sidebar__link-text">{item.text}</span>
                  )}
                </NavLink>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            className="admin-sidebar__link"
            style={{ width: '100%' }}
            onClick={() => {
              // Redirect to login page
              window.location.href = '/admin/login';
            }}
            aria-label="Logout"
          >
            <LogOut className="admin-sidebar__link-icon" size={20} />
            {!collapsed && <span className="admin-sidebar__link-text">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
