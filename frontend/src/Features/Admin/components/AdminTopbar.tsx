import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell, Menu, X, LogOut, Users, TrendingUp, Mail, Send, Calendar, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '@/src/Endpoints/userApi';
import { ConfirmModal } from '@/src/Features/Admin/components/ConfirmModal';
import { notificationApi, Notification } from '@/src/Endpoints/notificationApi';

interface AdminTopbarProps {
  pageTitle: string;
  onToggleSidebar: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  users: <Users size={14} />,
  'trending-up': <TrendingUp size={14} />,
  mail: <Mail size={14} />,
  send: <Send size={14} />,
  calendar: <Calendar size={14} />,
};

const COLOR_MAP: Record<string, string> = {
  green:  'bg-emerald-100 text-emerald-700',
  blue:   'bg-blue-100 text-blue-700',
  amber:  'bg-amber-100 text-amber-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  purple: 'bg-purple-100 text-purple-700',
};

const DOT_MAP: Record<string, string> = {
  green:  'bg-emerald-500',
  blue:   'bg-blue-500',
  amber:  'bg-amber-500',
  indigo: 'bg-indigo-500',
  purple: 'bg-purple-500',
};

export function AdminTopbar({ pageTitle, onToggleSidebar }: AdminTopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getAll();
      setNotifications(data.notifications);
      setTotalVisits(data.total_visits);
      // Unread = server unread minus locally marked-as-read
      const serverUnread = data.notifications.filter(n => !n.read && !readIds.has(n.id));
      setUnreadCount(serverUnread.length);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  }, [readIds]);

  // Fetch on mount, then poll every 60 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpenPanel = () => {
    setShowNotifications(v => !v);
    if (!showNotifications) {
      // Mark all visible unread as read locally
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      setReadIds(prev => new Set([...prev, ...unreadIds]));
      setUnreadCount(0);
    }
  };

  const handleLogout = async () => {
    try {
      await userApi.logout();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const effectiveUnread = unreadCount;

  return (
    <header className="admin-topbar relative" role="banner">
      <div className="admin-topbar__left">
        <button
          className="admin-topbar__toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className="admin-topbar__title">{pageTitle}</h1>
      </div>

      <div className="admin-topbar__right relative">
        {/* Notification Bell */}
        <div className="relative" ref={panelRef}>
          <button
            className="admin-btn admin-btn--icon relative"
            aria-label={`Notifications${effectiveUnread > 0 ? ` (${effectiveUnread} unread)` : ''}`}
            aria-expanded={showNotifications}
            onClick={handleOpenPanel}
          >
            <Bell size={18} />
            {effectiveUnread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                {effectiveUnread > 9 ? '9+' : effectiveUnread}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
              style={{ animation: 'fadeInDown 0.15s ease-out' }}
              role="dialog"
              aria-modal="true"
              aria-label="Notifications panel"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#002B7F] to-[#001655]">
                <div className="flex items-center gap-2">
                  <Bell size={15} className="text-[#C9A84C]" />
                  <h3 className="font-bold text-white text-sm">Notifications</h3>
                  {effectiveUnread > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                      {effectiveUnread}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-white/60">
                    {totalVisits.toLocaleString()} total visits
                  </span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer"
                    aria-label="Close notifications"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 size={20} className="animate-spin text-[#002B7F]" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                    <Bell size={28} className="opacity-30" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map(n => {
                    const isRead = n.read || readIds.has(n.id);
                    return (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-default ${isRead ? 'bg-white' : 'bg-blue-50/40'} hover:bg-gray-50`}
                      >
                        {/* Icon badge */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${COLOR_MAP[n.color]}`}>
                          {ICON_MAP[n.icon]}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-semibold text-gray-800 leading-tight ${!isRead ? 'font-bold' : ''}`}>
                              {n.title}
                            </p>
                            {!isRead && (
                              <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${DOT_MAP[n.color]}`} />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.body}</p>
                          {n.time_ago && (
                            <p className="text-[11px] text-[#002B7F]/70 mt-1 font-medium">{n.time_ago}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                <button
                  onClick={fetchNotifications}
                  className="text-xs text-[#002B7F] font-semibold hover:underline cursor-pointer"
                >
                  Refresh
                </button>
                <span className="text-[11px] text-gray-400">{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          )}
        </div>

        <div className="admin-topbar__avatar" aria-label="Admin user">
          A
        </div>

        <button
          onClick={() => setLogoutModalOpen(true)}
          className="admin-btn admin-btn--icon text-red-600 hover:bg-red-50 hover:border-red-200 ml-2"
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>

      <ConfirmModal
        isOpen={logoutModalOpen}
        title="Confirm Logout"
        message="Do you want to Logout?"
        onConfirm={handleLogout}
        onCancel={() => setLogoutModalOpen(false)}
      />
    </header>
  );
}
