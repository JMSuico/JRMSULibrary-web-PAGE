import { apiClient } from '@/src/Libs/apiClient';

export interface Personnel {
  id: number;
  name: string;
  title: string;
  photo?: string | null;
  order: number;
}

export const personnelApi = {
  getPersonnel: async (): Promise<Personnel[]> => {
    return apiClient(`/personnel/`);
  },
  
  createPersonnel: async (data: Partial<Personnel> | FormData): Promise<Personnel> => {
    return apiClient(`/personnel/`, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },

  updatePersonnel: async (id: number, data: Partial<Personnel> | FormData): Promise<Personnel> => {
    return apiClient(`/personnel/${id}/`, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },

  deletePersonnel: async (id: number): Promise<void> => {
    return apiClient(`/personnel/${id}/`, {
      method: 'DELETE',
    });
  }
};
