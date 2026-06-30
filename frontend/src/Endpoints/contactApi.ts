import { apiClient } from '@/src/Libs/apiClient';

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
    return apiClient(`/contact/`);
  },

  updateMessageStatus: async (id: number, status: 'UNREAD' | 'READ' | 'REPLIED'): Promise<ContactMessage> => {
    return apiClient(`/contact/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  submitContactMessage: async (data: Partial<ContactMessage>): Promise<ContactMessage> => {
    return apiClient(`/contact/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
