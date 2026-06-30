import { apiClient } from '@/src/Libs/apiClient';

export interface FeedbackData {
  name: string;
  email: string;
  category: string;
  message: string;
  rating?: number;
}

export const feedbackApi = {
  submitFeedback: async (data: FeedbackData) => {
    return apiClient(`/feedback/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

