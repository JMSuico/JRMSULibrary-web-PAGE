// [Layer: Libs/Api] — recycleApi.ts
import { apiClient } from '@/src/Libs/apiClient';

export interface RecycleBinItem {
  id: number;
  original_id: number;
  source_module: 'BOOKS' | 'GALLERY';
  item_name: string;
  data_snapshot: any;
  deleted_at: string;
  deleted_by: number | null;
}

export const recycleApi = {
  getAll: async (module?: string): Promise<RecycleBinItem[]> => {
    const url = module ? `/recycle-bin/?module=${module}` : `/recycle-bin/`;
    return apiClient(url);
  },

  restore: async (id: number): Promise<void> => {
    return apiClient(`/recycle-bin/${id}/restore/`, { method: 'POST' });
  },

  deletePermanently: async (id: number): Promise<void> => {
    return apiClient(`/recycle-bin/${id}/?confirm=true`, { method: 'DELETE' });
  }
};
