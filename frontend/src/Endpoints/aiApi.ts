import { apiClient } from '@/src/Libs/apiClient';
import faqCacheRaw from '@/src/Assets/FAQ cache/faq_cache.json';

const faqCache: Record<string, string[]> = faqCacheRaw as Record<string, string[]>;

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "am", "was", "were", "be", "been", "being",
  "do", "does", "did", "have", "has", "had",
  "to", "in", "for", "on", "with", "as", "by", "at", "from", "of", "and", "or", "but",
  "it", "this", "that", "these", "those", "there", "here",
  "you", "your", "yours", "i", "me", "my", "mine", "myself", "we", "us", "our", "ours",
  "he", "him", "his", "she", "her", "hers", "they", "them", "their", "theirs", "themselves",
  "what", "where", "when", "why", "how", "can", "could", "will", "would", "should",
  "please", "pls", "tell", "give", "show", "about", "just"
]);

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0 && !STOP_WORDS.has(w));
}

function areTokensMatching(t1: string, t2: string): boolean {
  if (t1 === t2) return true;
  // Suffix stemming for plurals and common verb forms
  if (t1 === t2 + 's' || t2 === t1 + 's') return true;
  if (t1 === t2 + 'es' || t2 === t1 + 'es') return true;
  if (t1 === t2 + 'ing' || t2 === t1 + 'ing') return true;
  // Safe prefix stemming (both tokens must be at least 4 characters to avoid false matches like "me" in "name")
  if (t1.length >= 4 && t2.length >= 4 && (t1.startsWith(t2) || t2.startsWith(t1))) return true;
  return false;
}

function findBestCachedAnswer(message: string): string | null {
  const normUserMsg = message.toLowerCase().replace(/[^\w\s]/g, '').trim();
  if (!normUserMsg) return null;

  // 1. Direct normalized exact match bypass
  for (const [question, answers] of Object.entries(faqCache)) {
    const normQ = question.toLowerCase().replace(/[^\w\s]/g, '').trim();
    if (normUserMsg === normQ) {
      return answers[Math.floor(Math.random() * answers.length)];
    }
  }

  // 2. Tokenized Bidirectional Similarity Match
  const userTokens = tokenize(message);
  if (userTokens.length === 0) return null;

  let bestMatch: string | null = null;
  let highestScore = 0;

  for (const [question, answers] of Object.entries(faqCache)) {
    const qTokens = tokenize(question);
    if (qTokens.length === 0) continue;

    // Safety guard: Single-token FAQ questions (e.g., 'name', 'wifi') should not hijack multi-token complex user queries
    if (qTokens.length === 1 && userTokens.length > 2) {
      continue;
    }

    let matchCount = 0;
    for (const qt of qTokens) {
      if (userTokens.some(ut => areTokensMatching(ut, qt))) {
        matchCount++;
      }
    }

    if (matchCount === 0) continue;

    // Sørensen-Dice Bidirectional Coefficient: (2 * matchCount) / (|userTokens| + |qTokens|)
    const score = (2 * matchCount) / (userTokens.length + qTokens.length);
    if (score >= 0.6 && score > highestScore) {
      highestScore = score;
      bestMatch = answers[Math.floor(Math.random() * answers.length)];
    }
  }

  return bestMatch;
}


export interface ChatMessage {
  sender: 'user' | 'rizal';
  text: string;
}

function getSeenAnswers(): string[] {
  const cacheStr = localStorage.getItem('ai_seen_answers');
  const cacheDate = localStorage.getItem('ai_seen_date');
  const todayDate = new Date().toDateString(); 

  // Midnight wipe: if the saved date doesn't match today's date, clear it.
  if (cacheDate !== todayDate) {
    localStorage.removeItem('ai_seen_answers');
    localStorage.setItem('ai_seen_date', todayDate);
    return [];
  }
  
  if (!cacheStr) return [];
  try {
    return JSON.parse(cacheStr);
  } catch(e) {
    return [];
  }
}

function addSeenAnswer(answer: string) {
  const seen = getSeenAnswers();
  if (!seen.includes(answer)) {
    seen.push(answer);
    localStorage.setItem('ai_seen_answers', JSON.stringify(seen));
  }
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
      body: JSON.stringify({ message, history, seen_answers: getSeenAnswers() }),
    });
  },

  /**
   * Send a message to the backend AI service (Ollama) and read the response as a stream.
   * @param message The user's new message
   * @param history The recent chat history for context
   * @param onChunk Callback triggered when a new chunk of text arrives
   */
  /**
   * Auto-draft a contextual email reply using AI (Staff only)
   */
  draftReply: async (data: {
    sender_name?: string;
    sender_email?: string;
    subject?: string;
    message_text?: string;
    inquiry_type?: string;
  }): Promise<{ draft: string }> => {
    return apiClient('/ai/draft-reply/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  chatStream: async (message: string, history: ChatMessage[], onChunk: (chunk: string) => void): Promise<void> => {
    // 1. Semantic Cache Intercept
    const cachedAnswer = findBestCachedAnswer(message);
    if (cachedAnswer) {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 400));
      
      // Simulate streaming word-by-word
      const words = cachedAnswer.split(/(\s+)/); // Preserve whitespace
      for (const word of words) {
        if (word) {
          onChunk(word);
          // Randomize typing speed for realism (10ms to 40ms per chunk)
          await new Promise(r => setTimeout(r, Math.random() * 30 + 10));
        }
      }
      return;
    }

    // 2. API Fallback (Ollama)
    // API base must match how apiClient resolves URLs
    let API_BASE = import.meta.env.VITE_API_BASE_URL;
    if (!API_BASE) {
      API_BASE = '/api';
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
      body: JSON.stringify({ message, history, seen_answers: getSeenAnswers() })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not yet supported in this browser.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullAnswer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (fullAnswer.trim()) {
          addSeenAnswer(fullAnswer.trim());
        }
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        fullAnswer += chunk;
        onChunk(chunk);
      }
    }
  },
};
