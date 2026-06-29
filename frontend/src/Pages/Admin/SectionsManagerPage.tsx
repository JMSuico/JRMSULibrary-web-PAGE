import { useState } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Search,
  LayoutGrid,
  List,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import { MetricCard } from '@/src/Features/Admin/components/MetricCard';

type ViewMode = 'table' | 'grid';

const MOCK_SECTIONS = [
  { id: 1, name: 'Circulation Section', description: 'Where books are borrowed and returned', imageCount: 4, status: 'Published' },
  { id: 2, name: 'Reference Section', description: 'Reference materials and encyclopedias', imageCount: 3, status: 'Published' },
  { id: 3, name: 'Periodical Section', description: 'Newspapers, magazines, and journals', imageCount: 2, status: 'Published' },
  { id: 4, name: 'E-Library Section', description: 'Digital resources and computer terminals', imageCount: 5, status: 'Published' },
  { id: 5, name: 'Audio-Visual Section', description: 'Multimedia resources', imageCount: 1, status: 'Draft' },
  { id: 6, name: 'Filipino Section', description: 'Filipino language books and materials', imageCount: 3, status: 'Published' },
];

export default function SectionsManagerPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = MOCK_SECTIONS.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="admin-content__header">
        <h1>Library Section Pictures</h1>
        <p>Manage section images. Adding a section here syncs to the public website.</p>
      </div>

      <div className="admin-metrics">
        <MetricCard
          label="Total Sections"
          value={MOCK_SECTIONS.length}
          icon={<ImageIcon size={22} />}
          variant="green"
        />
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <div className="admin-table-toolbar__search">
            <Search size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search sections"
            />
          </div>
          <div className="admin-table-toolbar__actions">
            <button
              className="admin-btn admin-btn--icon"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              style={viewMode === 'grid' ? { background: '#002B7F', color: '#fff' } : {}}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className="admin-btn admin-btn--icon"
              onClick={() => setViewMode('table')}
              aria-label="Table view"
              style={viewMode === 'table' ? { background: '#002B7F', color: '#fff' } : {}}
            >
              <List size={16} />
            </button>
            <button className="admin-btn admin-btn--primary" aria-label="Add section">
              <Plus size={16} />
              Add Section
            </button>
          </div>
        </div>

        {viewMode === 'table' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Section Name</th>
                <th>Description</th>
                <th>Images</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((section) => (
                <tr key={section.id}>
                  <td style={{ fontWeight: 500, color: '#111827' }}>{section.name}</td>
                  <td>{section.description}</td>
                  <td>{section.imageCount}</td>
                  <td>
                    <span className={`admin-badge ${section.status === 'Published' ? 'admin-badge--success' : 'admin-badge--warning'}`}>
                      {section.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button className="admin-btn admin-btn--icon" aria-label={`View ${section.name}`}><Eye size={15} /></button>
                      <button className="admin-btn admin-btn--icon" aria-label={`Edit ${section.name}`}><Pencil size={15} /></button>
                      <button className="admin-btn admin-btn--icon" aria-label={`Delete ${section.name}`} style={{ color: '#dc2626' }}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {viewMode === 'grid' && (
          <div className="admin-card-grid" style={{ padding: 20 }}>
            {filtered.map((section) => (
              <div className="admin-grid-card" key={section.id}>
                <div style={{
                  height: 140,
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}>
                  <ImageIcon size={40} />
                </div>
                <div className="admin-grid-card__body">
                  <div className="admin-grid-card__title">{section.name}</div>
                  <div className="admin-grid-card__meta">{section.description}</div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span className="admin-badge admin-badge--info">{section.imageCount} images</span>
                    <span className={`admin-badge ${section.status === 'Published' ? 'admin-badge--success' : 'admin-badge--warning'}`}>
                      {section.status}
                    </span>
                  </div>
                </div>
                <div className="admin-grid-card__actions">
                  <button className="admin-btn admin-btn--icon" aria-label={`View ${section.name}`}><Eye size={15} /></button>
                  <button className="admin-btn admin-btn--icon" aria-label={`Edit ${section.name}`}><Pencil size={15} /></button>
                  <button className="admin-btn admin-btn--icon" aria-label={`Delete ${section.name}`} style={{ color: '#dc2626' }}><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
