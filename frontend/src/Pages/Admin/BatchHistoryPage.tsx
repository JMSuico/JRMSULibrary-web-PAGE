import { useState, useEffect } from 'react';
import { Archive, Search, History, X, ClipboardList, FileArchive } from 'lucide-react';
import { batchApi, AcquisitionBatch } from '@/src/Endpoints/batchApi';
import { useToast } from '@/src/Hooks/useToast';
import { ConfirmModal } from '@/src/Features/Admin/components/ConfirmModal';

export default function BatchHistoryPage() {
  const [batches, setBatches] = useState<AcquisitionBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [auditBatch, setAuditBatch] = useState<AcquisitionBatch | null>(null);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null);
  const { showToast } = useToast();

  const loadBatches = async () => {
    try {
      setLoading(true);
      const data = await batchApi.getAllBatches();
      setBatches(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load batch history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleArchive = (batch: AcquisitionBatch) => {
    setConfirmModal({
      isOpen: true,
      title: 'Archive Batch',
      message: `Are you sure you want to archive "${batch.name}"? This will move it to the archived state.`,
      onConfirm: async () => {
        try {
          await batchApi.archiveBatch(batch.id);
          showToast('Batch archived successfully', 'success');
          loadBatches();
        } catch (err: any) {
          showToast(err.message || 'Failed to archive batch', 'error');
        }
      }
    });
  };

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

        <div className="admin-table-scroll">
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
                    <td style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Archive size={16} color="#6b7280" /> {batch.name}
                      </div>
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
                        {/* View Audit — opens an audit detail modal, NOT a redirect */}
                        <button
                          className="admin-btn admin-btn--secondary"
                          title="View Audit Trail"
                          style={{ color: '#6366f1' }}
                          onClick={() => setAuditBatch(batch)}
                        >
                          <ClipboardList size={14} /> View Audit
                        </button>
                        {/* Archive — only for closed batches */}
                        {batch.status === 'closed' && (
                          <button
                            className="admin-btn admin-btn--secondary"
                            title="Archive Batch"
                            style={{ color: '#b91c1c' }}
                            onClick={() => handleArchive(batch)}
                          >
                            <FileArchive size={14} /> Archive
                          </button>
                        )}
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
      </div>

      {/* Audit Detail Modal */}
      {auditBatch && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setAuditBatch(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-5 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ClipboardList size={20} /> Audit Trail
                </h2>
                <p className="text-indigo-200 text-sm mt-1">{auditBatch.name}</p>
              </div>
              <button
                onClick={() => setAuditBatch(null)}
                className="text-indigo-200 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X size={22} />
              </button>
            </div>

            {/* Timeline */}
            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              <div className="flex flex-col gap-3">
                {/* Created */}
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-1.5"></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Batch Created & Opened</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(auditBatch.opened_at).toLocaleString('en-PH', { dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>

                {/* Closed */}
                {auditBatch.closed_at && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0 mt-1.5"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Batch Closed</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(auditBatch.closed_at).toLocaleString('en-PH', { dateStyle: 'full', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Archived */}
                {auditBatch.status === 'archived' && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-400 shrink-0 mt-1.5"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Batch Archived</p>
                      <p className="text-xs text-gray-500 mt-0.5">Moved from closed to archived state</p>
                    </div>
                  </div>
                )}

                {/* Active Display */}
                {auditBatch.is_display_batch && (
                  <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Set as Active Display Batch</p>
                      <p className="text-xs text-gray-500 mt-0.5">Currently shown to the public</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700">{auditBatch.book_count || 0}</p>
                  <p className="text-xs text-blue-600 font-medium">Total Books</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-indigo-700 capitalize">{auditBatch.status}</p>
                  <p className="text-xs text-indigo-600 font-medium">Current Status</p>
                </div>
              </div>

              {/* Description */}
              {auditBatch.description && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-gray-700">{auditBatch.description}</p>
                </div>
              )}

              {/* Remarks */}
              {auditBatch.remarks && (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                  <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wider mb-1">Remarks</p>
                  <p className="text-sm text-gray-700">{auditBatch.remarks}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setAuditBatch(null)} className="admin-btn admin-btn--secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmModal}
        title={confirmModal?.title || ''}
        message={confirmModal?.message || ''}
        onConfirm={() => confirmModal?.onConfirm()}
        onCancel={() => setConfirmModal(null)}
      />
    </>
  );
}
