const API_BASE = '/api';

export interface SiteSettings {
  library_name: string;
  address: string;
  contact_email: string;
  phone_number: string;
  opening_hours_mon_fri: string;
  opening_hours_sat: string;
  opening_hours_sun: string;
  updated_at?: string;
}

export const settingsApi = {
  getSettings: async (): Promise<SiteSettings> => {
    const res = await fetch(`${API_BASE}/settings/`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },
  
  updateSettings: async (data: Partial<SiteSettings>): Promise<SiteSettings> => {
    const res = await fetch(`${API_BASE}/settings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  }
};
