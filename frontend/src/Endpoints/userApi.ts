import { apiClient } from '@/src/Libs/apiClient';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined: string;
  avatar_url?: string | null;
  is_online?: boolean;
}

export const userApi = {
  login: async (credentials: Record<string, string>): Promise<User> => {
    return apiClient(`/users/login/`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout: async (): Promise<void> => {
    return apiClient(`/users/logout/`, { method: 'POST' });
  },

  forceLogout: async (id: number): Promise<void> => {
    return apiClient(`/users/${id}/force_logout/`, { method: 'POST' });
  },

  heartbeat: async (): Promise<void> => {
    try {
      await apiClient(`/users/heartbeat/`, { method: 'POST' });
    } catch (e) {
      // ignore
    }
  },

  me: async (): Promise<User> => {
    return apiClient(`/users/me/`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  },

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

  changePassword: async (data: { old_password: string; new_password: string }): Promise<{ message: string }> => {
    return apiClient(`/users/change_password/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  uploadAvatar: async (id: number, data: FormData): Promise<User> => {
    return apiClient(`/users/${id}/upload_avatar/`, {
      method: 'POST',
      body: data,
    });
  },

  updateProfile: async (data: { first_name?: string; last_name?: string; email?: string; username?: string }): Promise<User> => {
    return apiClient(`/users/update_profile/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    return apiClient(`/users/request_password_reset/`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPasswordWithCode: async (email: string, code: string, new_password: string): Promise<{ message: string }> => {
    return apiClient(`/users/reset_password_with_code/`, {
      method: 'POST',
      body: JSON.stringify({ email, code, new_password }),
    });
  },
};

