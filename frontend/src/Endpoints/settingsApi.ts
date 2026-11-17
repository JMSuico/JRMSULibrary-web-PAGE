import { apiClient } from '@/src/Libs/apiClient';

export const RESERVATION_ROOMS = [
  'Discussion Room 1',
  'Discussion Room 2',
  'Tutorium Room 1',
  'Tutorium Room 2',
  'Multimedia Room',
  'Library ComLab (Computer Laboratory)',
] as const;

export type ReservationRoomName = (typeof RESERVATION_ROOMS)[number];

export interface SiteSettings {
  library_name: string;
  address: string;
  contact_email: string;
  alternate_email?: string;
  phone_number: string;
  opening_hours_mon_fri: string;
  opening_hours_sat: string;
  opening_hours_sun: string;
  carousel_style: 'default' | 'classic';
  background_image?: string | null;
  room_availability?: Record<string, boolean>;
  updated_at?: string;
}

export const normalizeRoomAvailability = (
  raw?: Record<string, boolean> | null
): Record<string, boolean> => {
  const normalized: Record<string, boolean> = {};
  for (const room of RESERVATION_ROOMS) {
    normalized[room] = raw && typeof raw[room] === 'boolean' ? raw[room] : true;
  }
  return normalized;
};

export const settingsApi = {
  getSettings: async (): Promise<SiteSettings> => {
    return apiClient(`/settings/`);
  },
  
  updateSettings: async (data: Partial<SiteSettings> | FormData): Promise<SiteSettings> => {
    return apiClient(`/settings/`, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }
};
