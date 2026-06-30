import { apiClient } from '@/src/Libs/apiClient';

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
    return apiClient(`/eresource-departments/`);
  },
  createDepartment: async (data: Partial<EResourceDepartment>): Promise<EResourceDepartment> => {
    return apiClient(`/eresource-departments/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateDepartment: async (id: number, data: Partial<EResourceDepartment>): Promise<EResourceDepartment> => {
    return apiClient(`/eresource-departments/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  deleteDepartment: async (id: number): Promise<void> => {
    return apiClient(`/eresource-departments/${id}/`, { method: 'DELETE' });
  },

  // Files
  getAllFiles: async (): Promise<EResourceFile[]> => {
    return apiClient(`/eresource-files/`);
  },
  createFile: async (data: FormData): Promise<EResourceFile> => {
    return apiClient(`/eresource-files/`, {
      method: 'POST',
      body: data,
    });
  },
  updateFile: async (id: number, data: Partial<EResourceFile>): Promise<EResourceFile> => {
    return apiClient(`/eresource-files/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  deleteFile: async (id: number): Promise<void> => {
    return apiClient(`/eresource-files/${id}/`, { method: 'DELETE' });
  },
};
