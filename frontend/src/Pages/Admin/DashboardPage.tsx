import { MetricCard } from '@/src/Features/Admin/components/MetricCard';
import {
  BookOpen,
  Users,
  Image,
  FolderTree,
  TrendingUp,
  Eye,
  X,
  Search,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { reportApi, ReportSummary } from '@/src/Endpoints/reportApi';
import { useEffect, useState, useMemo } from 'react';
import { useToast } from '@/src/Hooks/useToast';
import { useAutoRefresh } from '@/src/Hooks/useAutoRefresh';
import { createPortal } from 'react-dom';
import { dynamicAxis, extractValues } from '@/src/Libs/chartUtils';

export default function DashboardPage() {
  const [data, setData] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllBooksModal, setShowAllBooksModal] = useState(false);
  const [bookSearch, setBookSearch] = useState('');
  const { showToast } = useToast();

  const loadData = async () => {
    try {
      const summary = await reportApi.getSummary();
      setData(summary);
    } catch (err: any) {
      showToast(err.message || 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useAutoRefresh(loadData, 30000);

  if (loading || !data) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  const weeklyVisitors = (data.trend_data ?? []).reduce((sum, d) => sum + d.visits, 0);

  const MOCK_METRICS = [
    { label: 'Total Books', value: data.total_books, icon: <BookOpen size={22} />, variant: 'navy' as const },
    { label: 'Site Visitors', value: data.total_visits, icon: <Users size={22} />, variant: 'gold' as const },
    { label: 'Website Visitors (This Week)', value: weeklyVisitors, icon: <Eye size={22} />, variant: 'blue' as const },
    { label: 'Total Emails', value: data.total_emails, icon: <Image size={22} />, variant: 'green' as const },
    { label: 'Reservations', value: data.total_reservations, icon: <FolderTree size={22} />, variant: 'purple' as const },
  ];

  return (
    <>
      <div className="admin-content__header">
        <h1>Dashboard</h1>
        <p>Welcome back. Here is an overview of your library system.</p>
      </div>

      {/* Metric Cards */}
      <div className="admin-metrics">
        {MOCK_METRICS.map((m) => (
          <MetricCard 
            key={m.label} 
            label={m.label} 
            value={m.value} 
            icon={m.icon} 
            variant={m.variant} 
          />
        ))}
      </div>


      {/* Quick Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginBottom: 24 }}>
        
        {/* Newly Acquired Books Trend */}
        <div className="admin-table-wrapper" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <TrendingUp size={18} style={{ color: 'var(--color-navy)' }} />
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-gray-900)' }}>Recently Added Books (by Date)</span>
          </div>
          <div style={{ height: 260 }}>
            {(() => {
              const chartData = (() => {
                const counts: Record<string, number> = {};
                data.recent_books.forEach(b => {
                  counts[b.dateAdded] = (counts[b.dateAdded] || 0) + 1;
                });
                return Object.entries(counts)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([date, count]) => ({ name: date, books: count }));
              })();
              const yAxis = dynamicAxis(extractValues(chartData, 'books'));
              return (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='var(--color-gray-200)' />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-gray-500)', fontSize: 12 }} dy={10} />
                    <YAxis type="number" domain={yAxis.domain} ticks={yAxis.ticks} axisLine={false} tickLine={false} tick={{ fill: 'var(--color-gray-500)', fontSize: 12 }} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      cursor={{ fill: 'var(--color-gray-100)' }}
                    />
                    <Bar 
                      dataKey="books" 
                      fill='var(--color-navy)' 
                      radius={[4, 4, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
        </div>

        {/* Site Visitors Bar Chart */}
        <div className="admin-table-wrapper" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Eye size={18} style={{ color: 'var(--color-gold)' }} />
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-gray-900)' }}>Website Visitors (This Week)</span>
          </div>
          {(() => {
            const visitData = (data.trend_data ?? []).slice().reverse();
            const yAxis = dynamicAxis(extractValues(visitData, 'visits'));
            return (
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={visitData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='var(--color-gray-200)' />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-gray-500)', fontSize: 12 }} dy={10} />
                    <YAxis type="number" domain={yAxis.domain} ticks={yAxis.ticks} axisLine={false} tickLine={false} tick={{ fill: 'var(--color-gray-500)', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      cursor={{ fill: 'var(--color-gray-100)' }}
                    />
                    <Bar 
                      dataKey="visits" 
                      fill='var(--color-gold)' 
                      radius={[4, 4, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Recent Books Table */}
      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-gray-900)' }}>Recently Added Books</span>
          <button
            onClick={() => setShowAllBooksModal(true)}
            className="admin-btn admin-btn--secondary cursor-pointer"
          >
            View All
          </button>
        </div>
        <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Date Added</th>
            </tr>
          </thead>
          <tbody>
            {data.recent_books.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: 'var(--color-gray-500)' }}>
                  No recent books added.
                </td>
              </tr>
            ) : (
              data.recent_books.map((book) => (
                <tr key={book.id}>
                  <td style={{ fontWeight: 500, color: 'var(--color-gray-900)' }}>{book.title}</td>
                  <td>{book.author}</td>
                  <td>
                    <span className="admin-badge admin-badge--info">{book.category}</span>
                  </td>
                  <td style={{ color: 'var(--color-gray-500)' }}>{book.dateAdded}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* All Books Modal */}
      {showAllBooksModal && createPortal(
        <div className="fixed backdrop-blur-sm inset-0 z-[200] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowAllBooksModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h2 className="font-bold text-lg text-gray-900">All Added Books</h2>
                <p className="text-xs text-gray-500">Sorted by date added (ascending)</p>
              </div>
              <button onClick={() => setShowAllBooksModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-3 border-b border-gray-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, author or category..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Added</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_books
                    .slice()
                    .sort((a, b) => a.dateAdded.localeCompare(b.dateAdded))
                    .filter(b =>
                      !bookSearch ||
                      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
                      b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
                      b.category.toLowerCase().includes(bookSearch.toLowerCase())
                    )
                    .map((book, idx) => (
                      <tr key={book.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{book.title}</td>
                        <td className="px-4 py-3 text-gray-600">{book.author}</td>
                        <td className="px-4 py-3"><span className="admin-badge admin-badge--info">{book.category}</span></td>
                        <td className="px-4 py-3 text-gray-500">{book.dateAdded}</td>
                      </tr>
                    ))
                  }
                  {data.recent_books.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-12 text-gray-400">No books found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-gray-100 text-right">
              <button onClick={() => setShowAllBooksModal(false)} className="px-4 py-2 text-sm font-medium rounded-lg cursor-pointer border-none" style={{ background: 'var(--color-navy)', color: 'white' }}>Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
