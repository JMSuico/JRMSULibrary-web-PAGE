import { apiClient } from '@/src/Libs/apiClient';

export const bulkApi = {
  delete: async (type: string, ids: number[]): Promise<void> => {
    return apiClient('/system/bulk-actions/delete/', {
      method: 'POST',
      body: JSON.stringify({ type, ids }),
    });
  },
  
  restore: async (ids: number[]): Promise<void> => {
    return apiClient('/system/bulk-actions/restore/', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },
  
  hardDelete: async (ids: number[]): Promise<void> => {
    return apiClient('/system/bulk-actions/hard_delete/', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },
};
