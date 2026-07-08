import React from 'react';
import { createPortal } from 'react-dom';
import { X, Users, TrendingUp, Mail, Send, Calendar } from 'lucide-react';
import type { Notification } from '@/src/Endpoints/notificationApi';

interface Props {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  users: <Users size={24} />,
  'trending-up': <TrendingUp size={24} />,
  mail: <Mail size={24} />,
  send: <Send size={24} />,
  calendar: <Calendar size={24} />,
};

const COLOR_MAP: Record<string, string> = {
  green:  'bg-emerald-100 text-emerald-700',
  blue:   'bg-blue-100 text-blue-700',
  amber:  'bg-amber-100 text-amber-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  purple: 'bg-purple-100 text-purple-700',
};

export const NotificationDetailModal: React.FC<Props> = ({ notification, isOpen, onClose }) => {
  if (!isOpen || !notification) return null;

  return createPortal(
    <div className="fixed inset-0 ] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-modal-overlay z-[9999]" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-modal-card" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-headline-md text-lg font-bold text-primary">Notification Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer bg-transparent border-none">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${COLOR_MAP[notification.color] || COLOR_MAP.blue}`}>
            {ICON_MAP[notification.icon]}
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-2">{notification.title}</h3>
          
          {notification.time && (
            <div className="text-sm text-gray-500 font-medium mb-6">
              {new Date(notification.time).toLocaleString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
          
          <div className="bg-gray-50 rounded-xl p-4 w-full text-left text-gray-700 leading-relaxed border border-gray-100">
            {notification.body}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors cursor-pointer border-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
