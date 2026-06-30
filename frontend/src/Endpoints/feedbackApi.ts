const API_BASE = '/api';

export interface FeedbackData {
  name: string;
  email: string;
  category: string;
  message: string;
  rating?: number;
}

export const feedbackApi = {
  submitFeedback: async (data: FeedbackData) => {
    const res = await fetch(`${API_BASE}/feedback/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit feedback');
    return res.json();
  },
};
