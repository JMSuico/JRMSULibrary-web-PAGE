import { apiClient } from '@/src/Libs/apiClient';
import { revalidateCacheByPrefix } from '@/src/Libs/swrCache';

export const PERSONNEL_CACHE_KEY = 'public:personnel';

export interface Personnel {
  id?: number;
  name: string;
  title: string;
  photo?: string | null;
  photo_version?: string;
  order: number;
  updated_at?: string;
}

export const personnelApi = {
  getPersonnel: async (options?: { fresh?: boolean }): Promise<Personnel[]> => {
    const useFresh = options?.fresh ?? true;
    return apiClient(
      `/personnel/`,
      useFresh ? { headers: { 'Cache-Control': 'no-cache' } } : undefined
    );
  },

  createPersonnel: async (data: Partial<Personnel> | FormData): Promise<Personnel> => {
    const created = await apiClient(`/personnel/`, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
    revalidateCacheByPrefix(PERSONNEL_CACHE_KEY);
    return created;
  },

  updatePersonnel: async (id: number, data: Partial<Personnel> | FormData): Promise<Personnel> => {
    const updated = await apiClient(`/personnel/${id}/`, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
    revalidateCacheByPrefix(PERSONNEL_CACHE_KEY);
    return updated;
  },

  deletePersonnel: async (id: number): Promise<void> => {
    await apiClient(`/personnel/${id}/`, {
      method: 'DELETE',
    });
    revalidateCacheByPrefix(PERSONNEL_CACHE_KEY);
  },
};
