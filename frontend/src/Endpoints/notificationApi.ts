// [Layer: Endpoints] — notificationApi.ts
// Fetches smart notifications from the backend aggregated from system data.

import { apiClient } from '@/src/Libs/apiClient';

export interface Notification {
  id: number;
  type: 'VISITOR_MILESTONE' | 'VISITOR_PROGRESS' | 'NEW_EMAIL' | 'REPLY_SENT' | 'NEW_RESERVATION';
  icon: 'users' | 'trending-up' | 'mail' | 'send' | 'calendar';
  color: 'green' | 'blue' | 'amber' | 'indigo' | 'purple';
  title: string;
  body: string;
  time: string | null;
  time_ago: string;
  read: boolean;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
  total_visits: number;
}

export const notificationApi = {
  getAll: (): Promise<NotificationsResponse> =>
    apiClient('/notifications/all/'),
};
