const API_BASE = '/api';

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
  safety_expiry: string | null;
  created_by: number | null;
  remarks: string;
  book_count: number;
  books?: BatchBook[]; // Present in detail view
}

export const batchApi = {
  getAllBatches: async (): Promise<AcquisitionBatch[]> => {
    const res = await fetch(`${API_BASE}/batches/`);
    if (!res.ok) throw new Error('Failed to fetch batches');
    return res.json();
  },

  getBatchById: async (id: number): Promise<AcquisitionBatch> => {
    const res = await fetch(`${API_BASE}/batches/${id}/`);
    if (!res.ok) throw new Error('Failed to fetch batch details');
    return res.json();
  },

  getCurrentDisplayBatch: async (): Promise<AcquisitionBatch | null> => {
    const res = await fetch(`${API_BASE}/batches/current/`);
    if (res.status === 404) return null; // Expected if no active batch
    if (!res.ok) throw new Error('Failed to fetch current display batch');
    const data = await res.json();
    if (data.message) return null; // Edge case matching our controller fallback
    return data;
  },

  createBatch: async (data: Partial<AcquisitionBatch>): Promise<AcquisitionBatch> => {
    const res = await fetch(`${API_BASE}/batches/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create batch');
    return res.json();
  },

  updateBatch: async (id: number, data: Partial<AcquisitionBatch>): Promise<AcquisitionBatch> => {
    const res = await fetch(`${API_BASE}/batches/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update batch');
    return res.json();
  },

  closeBatch: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/batches/${id}/close/`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to close batch');
  },

  archiveBatch: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/batches/${id}/archive/`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to archive batch');
  },

  activateBatch: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/batches/${id}/activate/`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to activate batch');
  },

  reopenBatch: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/batches/${id}/reopen/`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reopen batch');
  },

  addBookToBatch: async (batchId: number, data: FormData): Promise<BatchBook> => {
    // Using FormData to support image uploads
    const res = await fetch(`${API_BASE}/batches/${batchId}/books/`, {
      method: 'POST',
      body: data,
    });
    if (!res.ok) throw new Error('Failed to add book');
    return res.json();
  },

  deleteBook: async (batchId: number, bookId: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/batches/${batchId}/books/${bookId}/`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) throw new Error('Failed to delete book');
  }
};
