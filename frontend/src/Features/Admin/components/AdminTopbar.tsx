import React, { useState } from 'react';
import { Bell, Menu, Search, X } from 'lucide-react';

interface AdminTopbarProps {
  pageTitle: string;
  onToggleSidebar: () => void;
}

export function AdminTopbar({ pageTitle, onToggleSidebar }: AdminTopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);

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
        <button
          className="admin-btn admin-btn--icon"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
        
        {/* Notification Bell */}
        <div className="relative">
          <button
            className="admin-btn admin-btn--icon relative"
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden animate-in">
              <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-800">Notifications</h3>
                <button onClick={() => setShowNotifications(false)} className="text-gray-500 hover:text-gray-800">
                  <X size={16} />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                  <p className="text-sm font-semibold text-gray-800">New Contact Message</p>
                  <p className="text-xs text-gray-500 mt-1">From: Juan Dela Cruz</p>
                  <p className="text-xs text-blue-600 mt-1">2 mins ago</p>
                </div>
                <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                  <p className="text-sm font-semibold text-gray-800">New Room Reservation</p>
                  <p className="text-xs text-gray-500 mt-1">Study Room A (2:00 PM)</p>
                  <p className="text-xs text-blue-600 mt-1">1 hour ago</p>
                </div>
                <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <p className="text-sm font-semibold text-gray-800">New Library Rating</p>
                  <p className="text-xs text-gray-500 mt-1">5 Stars - "Great service!"</p>
                  <p className="text-xs text-blue-600 mt-1">3 hours ago</p>
                </div>
              </div>
              <div className="p-3 border-t border-gray-100 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer">
                <span className="text-xs font-semibold text-[#002B7F]">View All Notifications</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="admin-topbar__avatar" aria-label="Admin user">
          A
        </div>
      </div>
    </header>
  );
}
