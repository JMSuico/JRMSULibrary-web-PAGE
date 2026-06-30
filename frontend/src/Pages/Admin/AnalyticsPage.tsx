import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  BookOpen,
  Mail,
  CalendarDays,
  Star,
} from 'lucide-react';
import { MetricCard } from '@/src/Features/Admin/components/MetricCard';
import { reportApi, ReportSummary } from '@/src/Endpoints/reportApi';
import { useToast } from '@/src/Hooks/useToast';

export default function AnalyticsPage() {
  const [data, setData] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const summary = await reportApi.getSummary();
        setData(summary);
      } catch (err: any) {
        showToast(err.message || 'Failed to load analytics', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < count ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-gray-300'}
      />
    ));
  };

  return (
    <>
      <div className="admin-content__header">
        <h1>Analytics &amp; Reports</h1>
        <p>System overview and statistics generation.</p>
      </div>

      {loading || !data ? (
        <div className="p-8 text-center text-gray-500">Loading analytics...</div>
      ) : (
        <>
          <div className="admin-metrics">
            <MetricCard
              label="Total Site Visits"
              value={data.total_visits}
              icon={<Users size={22} />}
              variant="blue"
            />
            <MetricCard
              label="Books Acquired"
              value={data.total_books}
              icon={<BookOpen size={22} />}
              variant="green"
            />
            <MetricCard
              label="Emails Received"
              value={data.total_emails}
              icon={<Mail size={22} />}
              variant="orange"
            />
            <MetricCard
              label="Reservations"
              value={data.total_reservations}
              icon={<CalendarDays size={22} />}
              variant="purple"
            />
            <MetricCard
              label="Total Ratings"
              value={data.ratings_summary.total_ratings}
              icon={<Star size={22} />}
              variant="gold"
            />
            <MetricCard
              label="Average Rating"
              value={`${data.ratings_summary.average_rating} / 5`}
              icon={<Star size={22} />}
              variant="gold"
            />
          </div>

          {/* Ratings Distribution Section */}
          <div className="admin-table-wrapper" style={{ marginTop: 24, padding: 24 }}>
            <div className="flex items-center gap-3 mb-6">
              <Star size={24} className="text-[#C9A84C]" />
              <h2 className="text-xl font-bold text-gray-800">Ratings Overview</h2>
            </div>

            {data.ratings_summary.total_ratings === 0 ? (
              <p className="text-gray-500 italic">No ratings received yet.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Distribution bars */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-4">Rating Distribution</h3>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = data.ratings_summary.distribution[star] || 0;
                      const percentage = data.ratings_summary.total_ratings > 0
                        ? Math.round((count / data.ratings_summary.total_ratings) * 100)
                        : 0;
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-16 shrink-0">
                            <span className="text-sm font-medium text-gray-700">{star}</span>
                            <Star size={14} className="text-[#C9A84C] fill-[#C9A84C]" />
                          </div>
                          <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: star >= 4 ? '#C9A84C' : star === 3 ? '#f59e0b' : '#ef4444',
                                minWidth: count > 0 ? '8px' : '0px'
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 w-16 text-right shrink-0">
                            {count} ({percentage}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Average rating display */}
                <div className="flex flex-col items-center justify-center">
                  <div className="text-6xl font-bold text-gray-800 mb-2">
                    {data.ratings_summary.average_rating}
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(Math.round(data.ratings_summary.average_rating))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Based on {data.ratings_summary.total_ratings} rating{data.ratings_summary.total_ratings !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Feedback */}
          {data.ratings_summary.recent_feedback.length > 0 && (
            <div className="admin-table-wrapper" style={{ marginTop: 24, padding: 24 }}>
              <div className="flex items-center gap-3 mb-6">
                <Mail size={24} className="text-[#002B7F]" />
                <h2 className="text-xl font-bold text-gray-800">Recent Feedback</h2>
              </div>

              <div className="space-y-4">
                {data.ratings_summary.recent_feedback.map((fb) => (
                  <div key={fb.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-800">{fb.name}</p>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{fb.category}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        {renderStars(fb.rating)}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{fb.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{fb.created_at}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Engagement */}
          <div className="admin-table-wrapper" style={{ marginTop: 24, padding: 24 }}>
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 size={24} className="text-[#002B7F]" />
              <h2 className="text-xl font-bold text-gray-800">Recent Engagement</h2>
            </div>
            
            {data.recent_activity.length === 0 ? (
              <p className="text-gray-500 italic">No recent messages or reservations.</p>
            ) : (
              <div className="space-y-4">
                {data.recent_activity.map((act) => (
                  <div key={act.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="font-semibold text-gray-800">{act.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(act.date).toLocaleString()}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${act.type === 'RESERVATION' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {act.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-8 flex gap-3">
              <button 
                className="admin-btn admin-btn--primary"
                onClick={() => window.print()}
              >
                Print Report
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
