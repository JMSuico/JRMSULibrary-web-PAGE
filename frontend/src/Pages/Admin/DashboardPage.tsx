import { MetricCard } from '@/src/Features/Admin/components/MetricCard';
import {
  BookOpen,
  Users,
  Image,
  FolderTree,
  TrendingUp,
  Eye,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { reportApi, ReportSummary } from '@/src/Endpoints/reportApi';
import { useEffect, useState } from 'react';

const BOOKS_TREND_DATA = [
  { name: 'Jan', books: 12 },
  { name: 'Feb', books: 19 },
  { name: 'Mar', books: 15 },
  { name: 'Apr', books: 22 },
  { name: 'May', books: 30 },
  { name: 'Jun', books: 44 },
];

export default function DashboardPage() {
  const [data, setData] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const summary = await reportApi.getSummary();
        setData(summary);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading || !data) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  const MOCK_METRICS = [
    { label: 'Total Books', value: data.total_books, icon: <BookOpen size={22} />, variant: 'navy' as const },
    { label: 'Site Visitors', value: data.total_visits, icon: <Users size={22} />, variant: 'gold' as const },
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
            <TrendingUp size={18} style={{ color: '#002B7F' }} />
            <span style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>Books Added Over Time</span>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={BOOKS_TREND_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ stroke: '#002B7F', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="books" 
                  stroke="#002B7F" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, fill: '#002B7F', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Site Visitors Bar Chart */}
        <div className="admin-table-wrapper" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Eye size={18} style={{ color: '#C9A84C' }} />
            <span style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>Website Visitors (This Week)</span>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.visitors_data.slice().reverse()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar 
                  dataKey="visitors" 
                  fill="#C9A84C" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Books Table */}
      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <span style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>Recently Added Books</span>
          <a
            href="/admin/books"
            className="admin-btn admin-btn--secondary"
            style={{ textDecoration: 'none' }}
          >
            View All
          </a>
        </div>
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
                <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  No recent books added.
                </td>
              </tr>
            ) : (
              data.recent_books.map((book) => (
                <tr key={book.id}>
                  <td style={{ fontWeight: 500, color: '#111827' }}>{book.title}</td>
                  <td>{book.author}</td>
                  <td>
                    <span className="admin-badge admin-badge--info">{book.category}</span>
                  </td>
                  <td style={{ color: '#6b7280' }}>{book.dateAdded}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
