import { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Eye,
  Pencil,
  Trash2,
  Tag,
} from 'lucide-react';
import { MetricCard } from '@/src/Features/Admin/components/MetricCard';

type ViewMode = 'table' | 'grid';

/** Placeholder data — will be replaced with API calls */
const MOCK_BOOKS = [
  { id: 1, title: 'Introduction to Machine Learning', author: 'Dr. Smith', isbn: '978-3-16-148410-0', category: 'Technology', status: 'Available', dateAdded: '2026-06-28', cover: '' },
  { id: 2, title: 'Philippine History: A New Perspective', author: 'Maria Santos', isbn: '978-1-40-289462-6', category: 'History', status: 'Available', dateAdded: '2026-06-27', cover: '' },
  { id: 3, title: 'Fundamentals of Nursing', author: 'Dr. Cruz', isbn: '978-0-06-112008-4', category: 'Health Sciences', status: 'Checked Out', dateAdded: '2026-06-25', cover: '' },
  { id: 4, title: 'Data Structures & Algorithms', author: 'Prof. Reyes', isbn: '978-0-13-468599-1', category: 'Computer Science', status: 'Available', dateAdded: '2026-06-24', cover: '' },
  { id: 5, title: 'Environmental Science Today', author: 'Ana Lopez', isbn: '978-0-7432-7356-5', category: 'Science', status: 'Available', dateAdded: '2026-06-22', cover: '' },
  { id: 6, title: 'Organic Chemistry', author: 'Dr. Garcia', isbn: '978-0-06-093546-7', category: 'Science', status: 'Available', dateAdded: '2026-06-20', cover: '' },
];

const CATEGORIES = ['All', 'Technology', 'History', 'Health Sciences', 'Computer Science', 'Science'];

export default function BooksManagerPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredBooks = MOCK_BOOKS.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = [...new Set(MOCK_BOOKS.map((b) => b.category))];

  return (
    <>
      <div className="admin-content__header">
        <h1>Newly Acquired Books</h1>
        <p>Manage your library's book collection. New additions sync to the public website automatically.</p>
      </div>

      {/* Metric Cards */}
      <div className="admin-metrics">
        <MetricCard
          label="Total Books"
          value={MOCK_BOOKS.length}
          icon={<BookOpen size={22} />}
          variant="navy"
        />
        <MetricCard
          label="Categories"
          value={uniqueCategories.length}
          icon={<Tag size={22} />}
          variant="gold"
        />
      </div>

      {/* Data Table / Grid */}
      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          {/* Search */}
          <div className="admin-table-toolbar__search">
            <Search size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search books by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search books"
            />
          </div>

          {/* Actions */}
          <div className="admin-table-toolbar__actions">
            {/* Category Filter */}
            <select
              className="admin-btn admin-btn--secondary"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
              style={{ cursor: 'pointer' }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* View Toggle */}
            <button
              className={`admin-btn admin-btn--icon ${viewMode === 'grid' ? '' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              style={viewMode === 'grid' ? { background: '#002B7F', color: '#fff' } : {}}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`admin-btn admin-btn--icon`}
              onClick={() => setViewMode('table')}
              aria-label="Table view"
              style={viewMode === 'table' ? { background: '#002B7F', color: '#fff' } : {}}
            >
              <List size={16} />
            </button>

            {/* Add Book */}
            <button className="admin-btn admin-btn--primary" aria-label="Add new book">
              <Plus size={16} />
              Add Book
            </button>
          </div>
        </div>

        {/* Table View */}
        {viewMode === 'table' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id}>
                  <td style={{ fontWeight: 500, color: '#111827' }}>{book.title}</td>
                  <td>{book.author}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{book.isbn}</td>
                  <td>
                    <span className="admin-badge admin-badge--info">{book.category}</span>
                  </td>
                  <td>
                    <span className={`admin-badge ${book.status === 'Available' ? 'admin-badge--success' : 'admin-badge--warning'}`}>
                      {book.status}
                    </span>
                  </td>
                  <td style={{ color: '#6b7280' }}>{book.dateAdded}</td>
                  <td>
                    <div className="admin-table__actions">
                      <button className="admin-btn admin-btn--icon" aria-label={`View ${book.title}`}>
                        <Eye size={15} />
                      </button>
                      <button className="admin-btn admin-btn--icon" aria-label={`Edit ${book.title}`}>
                        <Pencil size={15} />
                      </button>
                      <button className="admin-btn admin-btn--icon" aria-label={`Delete ${book.title}`} style={{ color: '#dc2626' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBooks.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 40 }}>
                    No books found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="admin-card-grid" style={{ padding: 20 }}>
            {filteredBooks.map((book) => (
              <div className="admin-grid-card" key={book.id}>
                <div
                  style={{
                    height: 140,
                    background: 'linear-gradient(135deg, #002B7F 0%, #001655 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#F0D97A',
                  }}
                >
                  <BookOpen size={40} />
                </div>
                <div className="admin-grid-card__body">
                  <div className="admin-grid-card__title">{book.title}</div>
                  <div className="admin-grid-card__meta">{book.author}</div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                    <span className="admin-badge admin-badge--info">{book.category}</span>
                    <span className={`admin-badge ${book.status === 'Available' ? 'admin-badge--success' : 'admin-badge--warning'}`}>
                      {book.status}
                    </span>
                  </div>
                </div>
                <div className="admin-grid-card__actions">
                  <button className="admin-btn admin-btn--icon" aria-label={`View ${book.title}`}>
                    <Eye size={15} />
                  </button>
                  <button className="admin-btn admin-btn--icon" aria-label={`Edit ${book.title}`}>
                    <Pencil size={15} />
                  </button>
                  <button className="admin-btn admin-btn--icon" aria-label={`Delete ${book.title}`} style={{ color: '#dc2626' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
