import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell, Menu, X, LogOut, Users, TrendingUp, Mail, Send, Calendar, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userApi, User } from '@/src/Endpoints/userApi';
import { ConfirmModal } from '@/src/Features/Admin/components/ConfirmModal';
import { notificationApi, Notification } from '@/src/Endpoints/notificationApi';
import { NotificationDetailModal } from '@/src/Components/Modals/NotificationDetailModal';

interface AdminTopbarProps {
  pageTitle: string;
  onToggleSidebar: () => void;
  user?: User | null;
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

export function AdminTopbar({ pageTitle, onToggleSidebar, user }: AdminTopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'unread'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getAll();
      setNotifications(data.notifications);
      setTotalVisits(data.total_visits);
      setUnreadCount(data.unread_count);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  }, []);

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
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpenPanel = () => {
    setShowNotifications(v => !v);
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      await notificationApi.markAllRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
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
              className="fixed right-4 md:right-6 top-[68px] w-[calc(100vw-32px)] md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
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
                  <div className="flex bg-black/20 rounded-lg p-0.5 mr-2">
                    <button 
                      onClick={() => setFilterMode('all')}
                      className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${filterMode === 'all' ? 'bg-white text-[#002B7F]' : 'text-white hover:bg-white/10'}`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setFilterMode('unread')}
                      className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${filterMode === 'unread' ? 'bg-white text-[#002B7F]' : 'text-white hover:bg-white/10'}`}
                    >
                      Unread
                    </button>
                  </div>
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
              <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 size={20} className="animate-spin text-[#002B7F]" />
                  </div>
                ) : notifications.filter(n => filterMode === 'all' ? true : !n.read).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                    <Bell size={28} className="opacity-30" />
                    <p className="text-sm">No {filterMode === 'unread' ? 'unread ' : ''}notifications yet</p>
                  </div>
                ) : (
                  notifications.filter(n => filterMode === 'all' ? true : !n.read).map(n => {
                    const isRead = n.read;
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          setSelectedNotification(n);
                          if (!isRead) {
                            setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                            setUnreadCount(prev => Math.max(0, prev - 1));
                          }
                        }}
                        className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer ${isRead ? 'bg-white' : 'bg-blue-50/40'} hover:bg-gray-50`}
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
                          <p className="text-xs text-gray-500 mt-0.5 leading-snug truncate">{n.body}</p>
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
                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchNotifications}
                    className="text-xs text-[#002B7F] font-semibold hover:underline cursor-pointer border-none bg-transparent"
                  >
                    Refresh
                  </button>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-gray-500 font-medium hover:text-gray-700 cursor-pointer border-none bg-transparent"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-gray-400">{totalVisits.toLocaleString()} site visits</span>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button 
            className="admin-topbar__avatar border-none outline-none cursor-pointer overflow-hidden p-0 flex items-center justify-center bg-[#002B7F] text-white font-bold" 
            aria-label="Admin user"
            onClick={() => setShowProfile(!showProfile)}
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm">{user?.first_name?.[0]?.toUpperCase() || 'A'}</span>
            )}
          </button>
          
          {showProfile && user && (
            <div 
              className="absolute right-0 top-[48px] w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-col items-center p-5"
              style={{ animation: 'fadeInDown 0.15s ease-out' }}
            >
              <div className="w-20 h-20 rounded-full bg-[#002B7F] text-white flex items-center justify-center text-3xl font-bold mb-3 shadow-md overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.first_name?.[0]?.toUpperCase() || 'A'
                )}
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{user.first_name} {user.last_name}</h3>
              <p className="text-xs text-gray-500 mb-4">{user.email}</p>
              <div className="w-full border-t border-gray-100 pt-3 flex gap-2">
                <button
                  onClick={() => {
                    navigate('/admin/settings');
                    setShowProfile(false);
                  }}
                  className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-[#002B7F] text-sm font-semibold rounded-lg transition-colors border border-gray-200 cursor-pointer"
                >
                  Profile
                </button>
                <button
                  onClick={() => setLogoutModalOpen(true)}
                  className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg transition-colors border border-red-100 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
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

      <NotificationDetailModal 
        notification={selectedNotification}
        isOpen={selectedNotification !== null}
        onClose={() => setSelectedNotification(null)}
      />
    </header>
  );
}
