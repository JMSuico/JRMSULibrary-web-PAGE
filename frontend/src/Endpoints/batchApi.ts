import { apiClient } from '@/src/Libs/apiClient';

export interface BatchBook {
  id: number;
  title: string;
  author: string;
  accession_number: string;
  category: string;
  cover_image: string | null;
  date_encoded: string;
}

export interface AcquisitionBatch {
  id: number;
  name: string;
  description: string;
  status: 'open' | 'closed' | 'archived';
  is_display_batch: boolean;
  opened_at: string;
  closed_at: string | null;
  last_interacted_at: string;
  safety_expiry: string | null;
  created_by: number | null;
  remarks: string;
  book_count: number;
  books?: BatchBook[]; // Present in detail view
  history?: any[]; // Audit history
}

export const batchApi = {
  getAllBatches: async (): Promise<AcquisitionBatch[]> => {
    return apiClient(`/batches/`);
  },

  getBatchById: async (id: number): Promise<AcquisitionBatch> => {
    return apiClient(`/batches/${id}/`);
  },

  getCurrentDisplayBatch: async (): Promise<AcquisitionBatch | null> => {
    try {
      const data = await apiClient(`/batches/current/`);
      if (data?.message) return null;
      return data;
    } catch (err: any) {
      if (err.message.includes('404')) return null;
      throw err;
    }
  },

  createBatch: async (data: Partial<AcquisitionBatch>): Promise<AcquisitionBatch> => {
    return apiClient(`/batches/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateBatch: async (id: number, data: Partial<AcquisitionBatch>): Promise<AcquisitionBatch> => {
    return apiClient(`/batches/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  closeBatch: async (id: number): Promise<void> => {
    return apiClient(`/batches/${id}/close/`, { method: 'POST' });
  },

  archiveBatch: async (id: number): Promise<void> => {
    return apiClient(`/batches/${id}/archive/`, { method: 'POST' });
  },

  activateBatch: async (id: number): Promise<void> => {
    return apiClient(`/batches/${id}/activate/`, { method: 'POST' });
  },

  reopenBatch: async (id: number): Promise<void> => {
    return apiClient(`/batches/${id}/reopen/`, { method: 'POST' });
  },

  touchBatch: async (id: number): Promise<void> => {
    return apiClient(`/batches/${id}/touch/`, { method: 'POST' });
  },

  addBookToBatch: async (batchId: number, data: FormData): Promise<BatchBook> => {
    return apiClient(`/batches/${batchId}/books/`, {
      method: 'POST',
      body: data,
    });
  },

  updateBook: async (batchId: number, bookId: number, data: FormData): Promise<BatchBook> => {
    return apiClient(`/batches/${batchId}/books/${bookId}/`, {
      method: 'PATCH',
      body: data,
    });
  },

  deleteBook: async (batchId: number, bookId: number): Promise<void> => {
    return apiClient(`/batches/${batchId}/books/${bookId}/`, {
      method: 'DELETE',
    });
  },

  deleteBatch: async (id: number): Promise<void> => {
    return apiClient(`/batches/${id}/`, {
      method: 'DELETE',
    });
  },

  getBatchHistory: async (id: number): Promise<any[]> => {
    try {
      const data = await apiClient(`/batches/${id}/history/`);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
};
