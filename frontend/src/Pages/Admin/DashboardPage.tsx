import { MetricCard } from '@/src/Features/Admin/components/MetricCard';
import {
  BookOpen,
  Users,
  Image,
  FolderTree,
  TrendingUp,
  Eye,
} from 'lucide-react';

/** Placeholder data — will be replaced with API calls */
const MOCK_METRICS = [
  { label: 'Total Books', value: 142, icon: <BookOpen size={22} />, variant: 'navy' as const, trend: { value: '+12 this month', direction: 'up' as const } },
  { label: 'Site Visitors', value: '3,284', icon: <Users size={22} />, variant: 'gold' as const, trend: { value: '+8.2%', direction: 'up' as const } },
  { label: 'Library Sections', value: 8, icon: <Image size={22} />, variant: 'green' as const },
  { label: 'E-Resources', value: 56, icon: <FolderTree size={22} />, variant: 'purple' as const, trend: { value: '+3 new', direction: 'up' as const } },
];

const RECENT_BOOKS = [
  { id: 1, title: 'Introduction to Machine Learning', author: 'Dr. Smith', category: 'Technology', dateAdded: '2026-06-28' },
  { id: 2, title: 'Philippine History: A New Perspective', author: 'Maria Santos', category: 'History', dateAdded: '2026-06-27' },
  { id: 3, title: 'Fundamentals of Nursing', author: 'Dr. Cruz', category: 'Health Sciences', dateAdded: '2026-06-25' },
  { id: 4, title: 'Data Structures & Algorithms', author: 'Prof. Reyes', category: 'Computer Science', dateAdded: '2026-06-24' },
  { id: 5, title: 'Environmental Science Today', author: 'Ana Lopez', category: 'Science', dateAdded: '2026-06-22' },
];

export default function DashboardPage() {
  return (
    <>
      <div className="admin-content__header">
        <h1>Dashboard</h1>
        <p>Welcome back. Here is an overview of your library system.</p>
      </div>

      {/* Metric Cards */}
      <div className="admin-metrics">
        {MOCK_METRICS.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Quick Charts Placeholder */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Newly Acquired Books Trend */}
        <div className="admin-table-wrapper" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <TrendingUp size={18} style={{ color: '#002B7F' }} />
            <span style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>Books Added Over Time</span>
          </div>
          <div style={{
            height: 200,
            background: 'linear-gradient(to top, rgba(0,43,127,0.05), rgba(0,43,127,0.02))',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
            fontSize: 14,
          }}>
            Linear chart will render here (connect to API)
          </div>
        </div>

        {/* Site Visitors Bar Chart */}
        <div className="admin-table-wrapper" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Eye size={18} style={{ color: '#C9A84C' }} />
            <span style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>Website Visitors</span>
          </div>
          <div style={{
            height: 200,
            background: 'linear-gradient(to top, rgba(201,168,76,0.05), rgba(201,168,76,0.02))',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
            fontSize: 14,
          }}>
            Bar graph will render here (connect to API)
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
            {RECENT_BOOKS.map((book) => (
              <tr key={book.id}>
                <td style={{ fontWeight: 500, color: '#111827' }}>{book.title}</td>
                <td>{book.author}</td>
                <td>
                  <span className="admin-badge admin-badge--info">{book.category}</span>
                </td>
                <td style={{ color: '#6b7280' }}>{book.dateAdded}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
