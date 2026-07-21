// [Layer: Endpoints] — notificationApi.ts
// Fetches smart notifications from the backend aggregated from system data.

import { apiClient } from '@/src/Libs/apiClient';

export interface Notification {
  id: number;
  type: 'VISITOR_MILESTONE' | 'VISITOR_PROGRESS' | 'NEW_EMAIL' | 'REPLY_SENT' | 'NEW_RESERVATION' | 'CREDENTIAL_REQUEST';
  icon: 'users' | 'trending-up' | 'mail' | 'send' | 'calendar' | 'key';
  color: 'green' | 'blue' | 'amber' | 'indigo' | 'purple';
  title: string;
  body: string;
  time: string | null;
  time_ago: string;
  read: boolean;
  /** Database ID of the linked ContactMessage, null for system notifications (milestones). */
  db_id: number | null;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
  total_visits: number;
}

export const notificationApi = {
  getAll: (): Promise<NotificationsResponse> =>
    apiClient('/notifications/all/'),
  markAllRead: (): Promise<void> =>
    apiClient('/notifications/mark-all-read/', { method: 'POST' }),
};
