import { apiClient } from '@/src/Libs/apiClient';

export interface ChatMessage {
  sender: 'user' | 'rizal';
  text: string;
}

export const aiApi = {
  /**
   * Send a message to the backend AI service (Ollama)
   * @param message The user's new message
   * @param history The recent chat history for context
   */
  chat: async (message: string, history: ChatMessage[]): Promise<{ response: string }> => {
    return apiClient('/ai/chat/', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  },
};
