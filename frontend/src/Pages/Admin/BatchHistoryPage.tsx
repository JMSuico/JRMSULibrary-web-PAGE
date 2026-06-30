import { useState, useEffect } from 'react';
import { Archive, Search, Filter, History } from 'lucide-react';
import { batchApi, AcquisitionBatch } from '@/src/Endpoints/batchApi';

export default function BatchHistoryPage() {
  const [batches, setBatches] = useState<AcquisitionBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const data = await batchApi.getAllBatches();
        setBatches(data);
      } catch (error) {
        console.error('Failed to load batch history', error);
      } finally {
        setLoading(false);
      }
    };
    loadBatches();
  }, []);

  const years = ['All', ...new Set(batches.map(b => new Date(b.opened_at).getFullYear().toString()))];

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch = batch.name.toLowerCase().includes(searchQuery.toLowerCase());
    const year = new Date(batch.opened_at).getFullYear().toString();
    const matchesYear = selectedYear === 'All' || year === selectedYear;
    return matchesSearch && matchesYear;
  });

  return (
    <>
      <div className="admin-content__header">
        <h1>Batch History</h1>
        <p>View past acquisition batches, their audit trails, and restore archived batches.</p>
      </div>

      <div className="admin-table-wrapper" style={{ marginTop: 24 }}>
        <div className="admin-table-toolbar">
          <div className="admin-table-toolbar__search">
            <Search size={16} style={{ color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search batches by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="admin-table-toolbar__actions">
            <select
              className="admin-btn admin-btn--secondary"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map(y => <option key={y} value={y}>{y === 'All' ? 'All Years' : y}</option>)}
            </select>
          </div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Batch Name</th>
              <th>Status</th>
              <th>Date Opened</th>
              <th>Date Closed</th>
              <th>Total Books</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
            ) : filteredBatches.length > 0 ? (
              filteredBatches.map((batch) => (
                <tr key={batch.id}>
                  <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Archive size={16} color="#6b7280" /> {batch.name}
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge--${batch.status === 'open' ? 'info' : batch.status === 'closed' ? 'success' : 'warning'}`}>
                      {batch.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: '#6b7280' }}>{new Date(batch.opened_at).toLocaleDateString()}</td>
                  <td style={{ color: '#6b7280' }}>{batch.closed_at ? new Date(batch.closed_at).toLocaleDateString() : '-'}</td>
                  <td>{batch.book_count || 0}</td>
                  <td>
                    <div className="admin-table__actions">
                      <button className="admin-btn admin-btn--secondary" onClick={() => window.location.href = `/admin/books?batch=${batch.id}`}>
                        <History size={14} /> View Audit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>No historical batches found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
