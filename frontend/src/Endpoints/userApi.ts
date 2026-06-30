const API_BASE = '/api';

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
    const res = await fetch(`${API_BASE}/users/`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  createUser: async (data: Partial<User>): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create user');
    return res.json();
  },

  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  },

  deleteUser: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/users/${id}/`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error('Failed to delete user');
  },
};
