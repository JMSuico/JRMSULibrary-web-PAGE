const API_BASE = '/api';

export interface ContactMessage {
  id: number;
  message_type: 'EMAIL' | 'RESERVATION';
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'REPLIED';
  created_at: string;
}

export const contactApi = {
  getAllMessages: async (): Promise<ContactMessage[]> => {
    const res = await fetch(`${API_BASE}/contact/`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  updateMessageStatus: async (id: number, status: 'UNREAD' | 'READ' | 'REPLIED'): Promise<ContactMessage> => {
    const res = await fetch(`${API_BASE}/contact/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update message status');
    return res.json();
  },

  submitContactMessage: async (data: Partial<ContactMessage>): Promise<ContactMessage> => {
    const res = await fetch(`${API_BASE}/contact/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit contact message');
    return res.json();
  }
};
