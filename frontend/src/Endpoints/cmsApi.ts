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
  title: string;
  file: string;
  is_active: boolean;
  created_at: string;
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
    const resp = await fetch('/api/site-visits/count/');
    if (!resp.ok) throw new Error('Failed to fetch visitor count');
    return resp.json();
  },
};
