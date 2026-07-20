import { apiClient, getCookie } from '@/src/Libs/apiClient';

export interface ContactMessage {
  id: number;
  message_type: 'EMAIL' | 'RESERVATION' | 'CREDENTIAL_REQUEST';
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'REPLIED' | 'ARCHIVED' | 'APPROVED' | 'DECLINED';
  is_read: boolean;
  created_at: string;
  reply_text?: string;
  replied_at?: string;
  attachments?: { id: number; file: string; original_filename: string; file_size: number; uploaded_at: string }[];
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

  submitContactMessage: async (data: Partial<ContactMessage>, files?: File[]): Promise<ContactMessage> => {
    if (files && files.length > 0) {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if ((data as any)[key] !== undefined && (data as any)[key] !== null) {
          formData.append(key, (data as any)[key]);
        }
      });
      files.forEach(file => {
        formData.append('files', file);
      });
      return apiClient(`/contact/`, {
        method: 'POST',
        body: formData,
      });
    }

    return apiClient(`/contact/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** 
   * Sends a real SMTP reply email from the library Gmail account to the sender.
   * Optionally saves reply to DB for Rizal Chatbot visibility.
   */
  replyToMessage: async (id: number, reply_body: string, send_to_chatbot: boolean = false): Promise<{ success: boolean; detail: string }> => {
    return apiClient(`/contact/${id}/reply/`, {
      method: 'POST',
      body: JSON.stringify({ reply_body, send_to_chatbot }),
    });
  },

  /**
   * Validates an email address against the disposable/temporary email blacklist.
   * Returns { is_disposable, is_domain_valid }.
   */
  validateEmail: async (email: string): Promise<EmailValidation> => {
    return apiClient(`/contact/validate-email/?email=${encodeURIComponent(email)}`);
  },

  /**
   * Bulk reply sequentially.
   */
  bulkReply: async (message_ids: number[], reply_body: string): Promise<{ results: { id: number, success: boolean, detail: string }[] }> => {
    return apiClient(`/contact/bulk-reply/`, {
      method: 'POST',
      body: JSON.stringify({ message_ids, reply_body }),
    });
  },

  /**
   * Upload an attachment to temporary staging area with progress tracking.
   */
  uploadAttachment: (file: File, onProgress: (progress: number) => void): Promise<{ file_id: string; filename: string }> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/contact/upload-attachment/', true);

      const csrfToken = getCookie('csrftoken') || '';
      if (csrfToken) {
        xhr.setRequestHeader('X-CSRFToken', csrfToken);
      }

      // Send credentials for auth
      xhr.withCredentials = true;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(Math.round(percentComplete));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.error || error.detail || 'Upload failed'));
          } catch (e) {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during upload'));
      };

      const formData = new FormData();
      formData.append('file', file);
      xhr.send(formData);
    });
  },

  /**
   * Reply with pre-uploaded attachments.
   */
  replyWithFiles: async (id: number, replyBody: string, fileEntries: { id: string, name: string }[], sendToChatbot: boolean = false) => {
    return apiClient(`/contact/${id}/reply-with-files/`, {
      method: 'POST',
      body: JSON.stringify({ reply_body: replyBody, file_entries: fileEntries, send_to_chatbot: sendToChatbot }),
    });
  },

  /**
   * Check replies for a specific email
   */
  checkReplies: async (email: string): Promise<ContactMessage[]> => {
    return apiClient(`/contact/check-replies/?email=${encodeURIComponent(email)}`);
  },
};
