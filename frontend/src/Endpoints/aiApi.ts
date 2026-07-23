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

  /**
   * Send a message to the backend AI service (Ollama) and read the response as a stream.
   * @param message The user's new message
   * @param history The recent chat history for context
   * @param onChunk Callback triggered when a new chunk of text arrives
   */
  chatStream: async (message: string, history: ChatMessage[], onChunk: (chunk: string) => void): Promise<void> => {
    // API base must match how apiClient resolves URLs
    let API_BASE = import.meta.env.VITE_API_BASE_URL;
    if (!API_BASE) {
      API_BASE = import.meta.env.DEV ? '/api' : 'https://jrmsulibrary-web-page.onrender.com/api';
    } else {
      if (!API_BASE.endsWith('/api') && !API_BASE.endsWith('/api/')) {
        API_BASE = API_BASE.endsWith('/') ? `${API_BASE}api` : `${API_BASE}/api`;
      }
    }
    const url = `${API_BASE}/ai/chat/`;
    
    // Extract CSRF if available (same logic as apiClient)
    let csrf = '';
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, 10) === 'csrftoken=') {
          csrf = decodeURIComponent(cookie.substring(10));
          break;
        }
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf
      },
      credentials: 'include',
      body: JSON.stringify({ message, history })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not yet supported in this browser.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        onChunk(chunk);
      }
    }
  },
};
