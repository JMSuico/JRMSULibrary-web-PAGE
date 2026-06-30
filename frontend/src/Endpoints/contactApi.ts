import { apiClient } from '@/src/Libs/apiClient';

export interface ContactMessage {
  id: number;
  message_type: 'EMAIL' | 'RESERVATION';
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'REPLIED' | 'ARCHIVED' | 'APPROVED' | 'DECLINED';
  is_read: boolean;
  created_at: string;
}

export interface EmailValidation {
  email: string;
  is_disposable: boolean;
  is_domain_valid: boolean;
}

export const contactApi = {
  getAllMessages: async (): Promise<ContactMessage[]> => {
    return apiClient(`/contact/`);
  },

  getMessage: async (id: number): Promise<ContactMessage> => {
    return apiClient(`/contact/${id}/`);
  },

  updateMessageStatus: async (id: number, status: ContactMessage['status']): Promise<ContactMessage> => {
    return apiClient(`/contact/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  deleteMessage: async (id: number): Promise<void> => {
    return apiClient(`/contact/${id}/`, { method: 'DELETE' });
  },

  submitContactMessage: async (data: Partial<ContactMessage>): Promise<ContactMessage> => {
    return apiClient(`/contact/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** 
   * Sends a real SMTP reply email from the library Gmail account to the sender.
   * Marks message as REPLIED on success.
   */
  replyToMessage: async (id: number, reply_body: string): Promise<{ success: boolean; detail: string }> => {
    return apiClient(`/contact/${id}/reply/`, {
      method: 'POST',
      body: JSON.stringify({ reply_body }),
    });
  },

  /**
   * Validates an email address against the disposable/temporary email blacklist.
   * Returns { is_disposable, is_domain_valid }.
   */
  validateEmail: async (email: string): Promise<EmailValidation> => {
    return apiClient(`/contact/validate-email/?email=${encodeURIComponent(email)}`);
  },
};
