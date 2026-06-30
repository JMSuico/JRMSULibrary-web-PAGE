const API_BASE = '/api';

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
  label: string;
  url: string;
  group: string;
  order: number;
  is_active: boolean;
  created_at: string;
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
    const res = await fetch(`${API_BASE}/content/`);
    if (!res.ok) throw new Error('Failed to fetch content');
    return res.json();
  },
  updateContent: async (slug: string, data: Partial<PageContent>): Promise<PageContent> => {
    const res = await fetch(`${API_BASE}/content/${slug}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update content');
    return res.json();
  },

  // Managed Links
  getAllLinks: async (): Promise<ManagedLink[]> => {
    const res = await fetch(`${API_BASE}/links/`);
    if (!res.ok) throw new Error('Failed to fetch links');
    return res.json();
  },
  createLink: async (data: Partial<ManagedLink>): Promise<ManagedLink> => {
    const res = await fetch(`${API_BASE}/links/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create link');
    return res.json();
  },
  updateLink: async (id: number, data: Partial<ManagedLink>): Promise<ManagedLink> => {
    const res = await fetch(`${API_BASE}/links/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update link');
    return res.json();
  },
  deleteLink: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/links/${id}/`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error('Failed to delete link');
  },

  // Managed Files
  getAllFiles: async (): Promise<ManagedFile[]> => {
    const res = await fetch(`${API_BASE}/files/`);
    if (!res.ok) throw new Error('Failed to fetch files');
    return res.json();
  },
  createFile: async (data: FormData): Promise<ManagedFile> => {
    const res = await fetch(`${API_BASE}/files/`, {
      method: 'POST',
      body: data,
    });
    if (!res.ok) throw new Error('Failed to create file');
    return res.json();
  },
  deleteFile: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/files/${id}/`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error('Failed to delete file');
  },
};
