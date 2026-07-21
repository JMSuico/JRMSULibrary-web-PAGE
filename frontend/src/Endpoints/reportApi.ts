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
    days_old?: number;
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
  trend_data: {
    name: string;
    visits: number;
    books: number;
  }[];
  recent_books: {
    id: number;
    title: string;
    author: string;
    category: string;
    dateAdded: string;
  }[];
}

export interface HistoricalReport {
  id: number;
  title: string;
  report_type: string;
  date_range: string;
  generated_at: string;
  generated_by: string;
}

export interface HistoricalReportDetail extends HistoricalReport {
  data: ReportSummary;
}

export const reportApi = {
  getSummary: async (reportType: string = 'summary', dateRange: string = 'this-month'): Promise<ReportSummary> => {
    return apiClient(`/reports/summary/?type=${reportType}&dateRange=${dateRange}`);
  },
  generate: async (reportType: string = 'summary', dateRange: string = 'this-month', title?: string): Promise<{message: string, report_id: number, data: ReportSummary}> => {
    return apiClient('/reports/generate/', {
      method: 'POST',
      body: JSON.stringify({ type: reportType, dateRange, title })
    });
  },
  getHistory: async (search: string = '', limit: number = 10, offset: number = 0): Promise<{total: number, results: HistoricalReport[]}> => {
    return apiClient(`/reports/history/?search=${encodeURIComponent(search)}&limit=${limit}&offset=${offset}`);
  },
  getHistoryDetail: async (id: number): Promise<HistoricalReportDetail> => {
    return apiClient(`/reports/${id}/history_detail/`);
  },
  archiveReport: async (id: number): Promise<{status: string}> => {
    return apiClient(`/reports/${id}/archive/`, { method: 'POST' });
  },
  unarchiveReport: async (id: number): Promise<{status: string}> => {
    return apiClient(`/reports/${id}/unarchive/`, { method: 'POST' });
  },
  getArchivedReports: async (): Promise<{results: HistoricalReport[]}> => {
    return apiClient(`/reports/archived_list/`);
  },
  deleteReport: async (id: number): Promise<void> => {
    return apiClient(`/reports/${id}/`, { method: 'DELETE' });
  }
};

