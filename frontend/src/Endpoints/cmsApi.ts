import { apiClient } from '@/src/Libs/apiClient';

export interface PageContent {
  id: number;
  slug: string;
  title: string;
  content: string;
  is_active: boolean;
  updated_at: string;
}

export interface ManagedLink {
  id: number;
  category: string;  // maps to backend 'category' field (previously 'group')
  name: string;      // maps to backend 'name' field (previously 'label')
  url: string;
  order: number;
  is_active: boolean;
}

export interface ManagedFile {
  id: number;
  category: string;
  name: string;
  file: string;
  is_active: boolean;
  uploaded_at: string;
}

export const cmsApi = {
  // Page Content
  getAllContent: async (): Promise<PageContent[]> => {
    return apiClient(`/content/`);
  },
  updateContent: async (slug: string, data: Partial<PageContent>): Promise<PageContent> => {
    return apiClient(`/content/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Managed Links
  getAllLinks: async (): Promise<ManagedLink[]> => {
    return apiClient(`/links/`);
  },
  createLink: async (data: Partial<ManagedLink>): Promise<ManagedLink> => {
    return apiClient(`/links/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateLink: async (id: number, data: Partial<ManagedLink>): Promise<ManagedLink> => {
    return apiClient(`/links/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  deleteLink: async (id: number): Promise<void> => {
    return apiClient(`/links/${id}/`, { method: 'DELETE' });
  },

  // Managed Files
  getAllFiles: async (): Promise<ManagedFile[]> => {
    return apiClient(`/managed-files/`);
  },
  createFile: async (data: FormData): Promise<ManagedFile> => {
    return apiClient(`/managed-files/`, {
      method: 'POST',
      body: data,
    });
  },
  deleteFile: async (id: number): Promise<void> => {
    return apiClient(`/managed-files/${id}/`, { method: 'DELETE' });
  },
};

// Public endpoint — no auth required
export const publicApi = {
  getVisitorCount: async (): Promise<{ total_visits: number; this_week: number }> => {
    return apiClient('/site-visits/count/');
  },

  /**
   * Record a unique page visit. The backend de-duplicates by
   * visitor_id, so the same person on the same device
   * and browser visiting the same page twice in one day is counted once.
   */
  trackVisit: async (page: string): Promise<void> => {
    try {
      const today = new Date().toDateString();
      const cacheKey = `jrmsu_last_visit_${page}`;
      const lastVisit = localStorage.getItem(cacheKey);

      // If we already recorded a visit to this exact page today, skip the network request
      if (lastVisit === today) {
        return;
      }

      let visitorId = localStorage.getItem('jrmsu_visitor_id');
      if (!visitorId) {
        visitorId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
        localStorage.setItem('jrmsu_visitor_id', visitorId);
      }

      await apiClient('/site-visits/track/', {
        method: 'POST',
        body: JSON.stringify({ page, visitor_id: visitorId }),
      });

      // Cache the successful visit for today
      localStorage.setItem(cacheKey, today);
    } catch {
      // Silently ignore tracking errors — never block the UI
    }
  },
};
