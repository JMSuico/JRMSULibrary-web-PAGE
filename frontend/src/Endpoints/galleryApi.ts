const API_BASE = '/api';

export interface GalleryImage {
  id: number;
  title: string;
  section_label: string;
  is_active: boolean;
  image: string;
  created_at: string;
}

export const galleryApi = {
  getAllImages: async (): Promise<GalleryImage[]> => {
    const res = await fetch(`${API_BASE}/gallery/`);
    if (!res.ok) throw new Error('Failed to fetch images');
    return res.json();
  },

  createImage: async (data: FormData): Promise<GalleryImage> => {
    const res = await fetch(`${API_BASE}/gallery/`, {
      method: 'POST',
      body: data,
    });
    if (!res.ok) throw new Error('Failed to create image');
    return res.json();
  },

  updateImage: async (id: number, data: FormData): Promise<GalleryImage> => {
    const res = await fetch(`${API_BASE}/gallery/${id}/`, {
      method: 'PATCH',
      body: data,
    });
    if (!res.ok) throw new Error('Failed to update image');
    return res.json();
  },

  deleteImage: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/gallery/${id}/`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error('Failed to delete image');
  },
};
