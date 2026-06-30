import { apiClient } from '@/src/Libs/apiClient';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined: string;
}

export const userApi = {
  getAllUsers: async (): Promise<User[]> => {
    return apiClient(`/users/`);
  },

  createUser: async (data: Partial<User>): Promise<User> => {
    return apiClient(`/users/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    return apiClient(`/users/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteUser: async (id: number): Promise<void> => {
    return apiClient(`/users/${id}/`, { method: 'DELETE' });
  },
};
