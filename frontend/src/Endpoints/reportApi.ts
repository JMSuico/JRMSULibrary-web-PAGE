import { apiClient } from '@/src/Libs/apiClient';

export interface RatingsSummary {
  total_ratings: number;
  average_rating: number;
  distribution: Record<number, number>;
  recent_feedback: {
    id: number;
    name: string;
    rating: number;
    category: string;
    message: string;
    created_at: string;
  }[];
}

export interface ReportSummary {
  total_visits: number;
  total_books: number;
  total_emails: number;
  total_reservations: number;
  ratings_summary: RatingsSummary;
  recent_activity: {
    id: number;
    type: string;
    name: string;
    date: string;
  }[];
  visitors_data: {
    name: string;
    visitors: number;
  }[];
  recent_books: {
    id: number;
    title: string;
    author: string;
    category: string;
    dateAdded: string;
  }[];
}

export const reportApi = {
  getSummary: async (): Promise<ReportSummary> => {
    return apiClient(`/reports/summary/`);
  }
};

