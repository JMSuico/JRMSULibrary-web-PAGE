const API_BASE = '/api';

export interface EResourceDepartment {
  id: number;
  name: string;
  parent: number | null;
  sub_departments: EResourceDepartment[];
  files: EResourceFile[];
}

export interface EResourceFile {
  id: number;
  title: string;
  file: string;
  department: number;
  is_active: boolean;
  created_at: string;
}

export const eresourceApi = {
  // Departments
  getAllDepartments: async (): Promise<EResourceDepartment[]> => {
    const res = await fetch(`${API_BASE}/eresource-departments/`);
    if (!res.ok) throw new Error('Failed to fetch departments');
    return res.json();
  },
  createDepartment: async (data: Partial<EResourceDepartment>): Promise<EResourceDepartment> => {
    const res = await fetch(`${API_BASE}/eresource-departments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create department');
    return res.json();
  },
  updateDepartment: async (id: number, data: Partial<EResourceDepartment>): Promise<EResourceDepartment> => {
    const res = await fetch(`${API_BASE}/eresource-departments/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update department');
    return res.json();
  },
  deleteDepartment: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/eresource-departments/${id}/`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error('Failed to delete department');
  },

  // Files
  getAllFiles: async (): Promise<EResourceFile[]> => {
    const res = await fetch(`${API_BASE}/eresource-files/`);
    if (!res.ok) throw new Error('Failed to fetch files');
    return res.json();
  },
  createFile: async (data: FormData): Promise<EResourceFile> => {
    const res = await fetch(`${API_BASE}/eresource-files/`, {
      method: 'POST',
      body: data,
    });
    if (!res.ok) throw new Error('Failed to create file');
    return res.json();
  },
  updateFile: async (id: number, data: Partial<EResourceFile>): Promise<EResourceFile> => {
    const res = await fetch(`${API_BASE}/eresource-files/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update file');
    return res.json();
  },
  deleteFile: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/eresource-files/${id}/`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error('Failed to delete file');
  },
};
