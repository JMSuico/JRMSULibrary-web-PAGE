import { apiClient } from '@/src/Libs/apiClient';

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
    return apiClient(`/gallery/`);
  },

  createImage: async (data: FormData): Promise<GalleryImage> => {
    return apiClient(`/gallery/`, {
      method: 'POST',
      body: data,
    });
  },

  updateImage: async (id: number, data: FormData): Promise<GalleryImage> => {
    return apiClient(`/gallery/${id}/`, {
      method: 'PATCH',
      body: data,
    });
  },

  deleteImage: async (id: number): Promise<void> => {
    return apiClient(`/gallery/${id}/`, { method: 'DELETE' });
  },
};
