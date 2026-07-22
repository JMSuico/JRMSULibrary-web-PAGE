import { apiClient } from '@/src/Libs/apiClient';

export type ResearchDepartment =
  | 'Research of Bachelor of Science in Forestry (BSF)'
  | 'Research Books for Bachelor of Science in Computer Science'
  | 'Research Books for Agri. Business Management'
  | 'Narrative Report of Secondary Education';

export const RESEARCH_DEPARTMENTS: ResearchDepartment[] = [
  'Research of Bachelor of Science in Forestry (BSF)',
  'Research Books for Bachelor of Science in Computer Science',
  'Research Books for Agri. Business Management',
  'Narrative Report of Secondary Education',
];

export interface ResearchReference {
  id: number;
  category: 'Research for College Student in JRMSU' | 'Thesis and Dissertation';
  department: ResearchDepartment | null;
  no: number | null;
  acc_no: string | null;
  call_number: string | null;
  title: string;
  author: string | null;
  copyright: string | null;
  remarks: string | null;
  resource_status: string | null;
  inventory_year: string | null;
  access_type: 'none' | 'link' | 'file';
  access_link: string | null;
  access_file: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedReferences {
  count: number;
  total_pages: number;
  current_page: number;
  results: ResearchReference[];
}

export interface BulkImportResult {
  imported: number;
  errors: { row: number; title: string; error: any }[];
  total_submitted: number;
}

export interface SyncDiff {
  to_create: Partial<ResearchReference>[];
  to_update: (Partial<ResearchReference> & { id: number; changes: Record<string, [any, any]> })[];
  to_delete: Pick<ResearchReference, 'id' | 'title' | 'author' | 'department'>[];
  unchanged: number;
}

export interface SyncCommitResult {
  created: number;
  updated: number;
  deleted: number;
  errors: { row?: number; id?: number; title?: string; error: any }[];
}

export const referenceApi = {
  getAllReferences: async (
    page = 1,
    limit = 50,
    search = '',
    category = '',
    department = ''
  ): Promise<PaginatedReferences> => {
    let url = `/research-references/?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (category && category !== 'All') url += `&category=${encodeURIComponent(category)}`;
    if (department && department !== 'All') url += `&department=${encodeURIComponent(department)}`;
    return await apiClient(url);
  },

  createReference: async (data: Partial<ResearchReference>): Promise<ResearchReference> => {
    return await apiClient('/research-references/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateReference: async (id: number, data: Partial<ResearchReference>): Promise<ResearchReference> => {
    return await apiClient(`/research-references/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteReference: async (id: number): Promise<void> => {
    await apiClient(`/research-references/${id}/`, {
      method: 'DELETE',
    });
  },

  bulkImportReferences: async (records: Partial<ResearchReference>[]): Promise<BulkImportResult> => {
    return await apiClient('/research-references/bulk-import/', {
      method: 'POST',
      body: JSON.stringify(records),
    });
  },

  uploadReferenceFile: async (id: number, formData: FormData): Promise<ResearchReference> => {
    // Note: Don't set Content-Type to application/json, browser will set multipart/form-data
    return await apiClient(`/research-references/${id}/`, {
      method: 'PATCH',
      body: formData,
    });
  },

  removeReferenceFile: async (id: number): Promise<void> => {
    await apiClient(`/research-references/${id}/remove-file/`, {
      method: 'DELETE',
    });
  },

  syncPreview: async (records: Partial<ResearchReference>[]): Promise<SyncDiff> => {
    return await apiClient('/research-references/sync-preview/', {
      method: 'POST',
      body: JSON.stringify(records),
    });
  },

  syncCommit: async (payload: {
    to_create: Partial<ResearchReference>[];
    to_update: (Partial<ResearchReference> & { id: number; changes: Record<string, [any, any]> })[];
    to_delete: number[];
    apply_deletions: boolean;
  }): Promise<SyncCommitResult> => {
    return await apiClient('/research-references/sync-commit/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  bulkDeleteReferences: async (ids: number[]): Promise<void> => {
    await apiClient('/research-references/bulk-delete/', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },
};
