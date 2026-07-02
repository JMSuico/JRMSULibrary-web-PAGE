import { apiClient } from '@/src/Libs/apiClient';

export interface SiteSettings {
  library_name: string;
  address: string;
  contact_email: string;
  phone_number: string;
  opening_hours_mon_fri: string;
  opening_hours_sat: string;
  opening_hours_sun: string;
  carousel_style: 'default' | 'classic';
  updated_at?: string;
}

export const settingsApi = {
  getSettings: async (): Promise<SiteSettings> => {
    return apiClient(`/settings/`);
  },
  
  updateSettings: async (data: Partial<SiteSettings>): Promise<SiteSettings> => {
    return apiClient(`/settings/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
