import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Archive, Search, History, X, ClipboardList, FileArchive } from 'lucide-react';
import { batchApi, AcquisitionBatch } from '@/src/Endpoints/batchApi';
import { useToast } from '@/src/Hooks/useToast';
import { ConfirmModal } from '@/src/Features/Admin/components/ConfirmModal';
import { useCachedQuery, invalidateCacheByPrefix } from '@/src/Hooks/useCachedQuery';
import { useUndoDelete } from '@/src/Hooks/useUndoDelete';
import { UndoDeleteToast } from '@/src/Components/Shared/UndoDeleteToast';
import { useDebounce } from '@/src/Hooks/useDebounce';
import { Pagination } from '@/src/Components/Shared/Pagination';
import { usePagination, PAGE_SIZE_OPTIONS } from '@/src/Hooks/usePagination';
import { processInChunks } from '@/src/Libs/chunkUtils';

export function BatchHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [auditBatch, setAuditBatch] = useState<AcquisitionBatch | null>(null);
  const [selectedBatchIds, setSelectedBatchIds] = useState<Set<number>>(new Set());
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const { showToast, removeToast } = useToast();
  const { undoState, triggerDelete, cancelDelete, executeNow } = useUndoDelete();

  const {
    data: cachedBatches,
    isLoading,
    error,
    refetch,
    mutate,
  } = useCachedQuery<AcquisitionBatch[]>({
    key: 'admin:batches',
    fetcher: () => batchApi.getAllBatches(),
    staleTimeMs: 30_000,
    listenCmsUpdate: true,
  });

  const batches = cachedBatches ?? [];
  const batchesRef = useRef<AcquisitionBatch[]>(batches);
  batchesRef.current = batches;

  useEffect(() => {
    if (error) {
      showToast(error.message || 'Failed to load batch history', 'error');
    }
  }, [error, showToast]);

  const handleArchive = (batch: AcquisitionBatch) => {
    const previous = batchesRef.current;
    triggerDelete(
      batch.name,
      async () => {
        try {
          await batchApi.archiveBatch(batch.id);
          invalidateCacheByPrefix('admin:batch');
          invalidateCacheByPrefix('admin:dashboard');
          showToast('Batch archived successfully', 'success');
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to archive batch';
          showToast(message, 'error');
          refetch();
        }
      },
      () => {
        mutate(
          [...batchesRef.current, batch].sort(
            (a, b) => new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime(),
          ),
        );
        showToast('Batch archive undone', 'success');
      },
    );
    // Optimistic removal
    mutate(previous.filter((b) => b.id !== batch.id));
  };

  const handleBulkArchive = () => {
    if (selectedBatchIds.size === 0) return;
    const idsToArchive = Array.from<number>(selectedBatchIds);
    const count = idsToArchive.length;
    const batchesToArchive = batchesRef.current.filter((b) => selectedBatchIds.has(b.id));

    // Optimistic removal
    mutate(batchesRef.current.filter((b) => !selectedBatchIds.has(b.id)));
    setSelectedBatchIds(new Set());

    triggerDelete(
      `${count} selected batch(es)`,
      async () => {
        setIsRemoving(true);
        const toastId = showToast(`${count} removing processing.`, 'loading');
        try {
          await processInChunks(
            idsToArchive,
            10,
            (id: number) => batchApi.archiveBatch(id),
            () => {},
          );
          invalidateCacheByPrefix('admin:batch');
          invalidateCacheByPrefix('admin:dashboard');
          showToast(`Archived ${count} batches successfully`, 'success');
        } catch {
          showToast('Failed to archive some batches', 'error');
          refetch();
        } finally {
          setIsRemoving(false);
          removeToast(toastId);
        }
      },
      () => {
        mutate(
          [...batchesRef.current, ...batchesToArchive].sort(
            (a, b) => new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime(),
          ),
        );
        showToast('Bulk archive undone', 'success');
      },
    );
  };

  const years = useMemo(
    () => ['All', ...new Set(batches.map((b) => new Date(b.opened_at).getFullYear().toString()))],
    [batches],
  );

  const debouncedSearch = useDebounce(searchQuery, 400);

  const filteredBatches = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return batches.filter((batch) => {
      const matchesSearch = batch.name.toLowerCase().includes(query);
      const year = new Date(batch.opened_at).getFullYear().toString();
      const matchesYear = selectedYear === 'All' || year === selectedYear;
      return matchesSearch && matchesYear;
    });
  }, [batches, debouncedSearch, selectedYear]);

  const {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    paginatedItems: paginatedBatches,
    setPage,
    setPageSize,
  } = usePagination<AcquisitionBatch>({
    items: filteredBatches,
    pageSize: 20,
    storageKey: 'jrmsu_admin_batch_history_page_size',
  });

  // Reset to page 1 if filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedYear, setPage]);

  const loading = isLoading && batches.length === 0;

  return (
    <>
      <div className="admin-content__header">
        <h1>Batch History</h1>
        <p>View past acquisition batches, their audit trails, and restore archived batches.</p>
      </div>

      <div className="admin-table-wrapper" style={{ marginTop: 24 }}>
        <div className="admin-table-toolbar">
          <div className="admin-table-toolbar__search">
            <Search size={16} style={{ color: 'var(--color-gray-400)' }} />
            <input
              type="text"
              placeholder="Search batches by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="admin-table-toolbar__actions">
            <button
              className="admin-btn admin-btn--secondary text-sm"
              onClick={() => {
                if (selectedBatchIds.size > 0) {
                  setSelectedBatchIds(new Set());
                } else {
                  setSelectedBatchIds(new Set(filteredBatches.map((b) => b.id)));
                }
              }}
              disabled={isRemoving}
            >
              {selectedBatchIds.size > 0 ? 'Unselect All' : 'Select All'}
            </button>
            {selectedBatchIds.size > 0 && (
              <button
                className="admin-btn"
                style={{ background: isRemoving ? 'var(--color-gray-400)' : 'var(--color-red-600)', color: 'white', border: 'none' }}
                onClick={handleBulkArchive}
                disabled={isRemoving}
              >
                <FileArchive size={16} /> Archive Selected ({selectedBatchIds.size})
              </button>
            )}
            <select
              className="admin-btn admin-btn--secondary"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y === 'All' ? 'All Years' : y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-table-scroll overflow-x-auto w-full">
          <table className="admin-table w-full min-w-[800px]">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={paginatedBatches.length > 0 && paginatedBatches.every((b) => selectedBatchIds.has(b.id))}
                    disabled={isRemoving}
                    onChange={(e) => {
                      const newSelected = new Set(selectedBatchIds);
                      if (e.target.checked) {
                        paginatedBatches.forEach((b) => newSelected.add(b.id));
                      } else {
                        paginatedBatches.forEach((b) => newSelected.delete(b.id));
                      }
                      setSelectedBatchIds(newSelected);
                    }}
                  />
                </th>
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
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
              ) : paginatedBatches.length > 0 ? (
                paginatedBatches.map((batch) => (
                  <tr key={batch.id} style={{ backgroundColor: selectedBatchIds.has(batch.id) ? 'var(--color-blue-50)' : 'transparent' }}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedBatchIds.has(batch.id)}
                        disabled={isRemoving}
                        onChange={(e) => {
                          const newSelected = new Set(selectedBatchIds);
                          if (e.target.checked) newSelected.add(batch.id);
                          else newSelected.delete(batch.id);
                          setSelectedBatchIds(newSelected);
                        }}
                      />
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Archive size={16} color="var(--color-gray-500)" /> {batch.name}
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge admin-badge--${batch.status === 'open' ? 'info' : batch.status === 'closed' ? 'success' : 'warning'}`}>
                        {batch.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-gray-500)' }}>{new Date(batch.opened_at).toLocaleDateString()}</td>
                    <td style={{ color: 'var(--color-gray-500)' }}>{batch.closed_at ? new Date(batch.closed_at).toLocaleDateString() : '-'}</td>
                    <td>{batch.book_count || 0}</td>
                    <td>
                      <div className="admin-table__actions">
                        {/* View Audit — opens an audit detail modal, NOT a redirect */}
                        <button
                          className="admin-btn admin-btn--secondary"
                          title="View Audit Trail"
                          style={{ color: 'var(--color-indigo)' }}
                          onClick={() => setAuditBatch(batch)}
                        >
                          <ClipboardList size={14} /> View Audit
                        </button>
                        {/* Archive — for open or closed batches */}
                        {batch.status !== 'archived' && (
                          <button
                            className="admin-btn admin-btn--secondary"
                            title="Archive Batch"
                            style={{ color: 'var(--color-red-700)' }}
                            onClick={() => handleArchive(batch)}
                          >
                            <FileArchive size={14} /> Archive
                          </button>
                        )}
                        {/* Reopen — for archived batches */}
                        {batch.status === 'archived' && (
                          <button
                            className="admin-btn admin-btn--secondary"
                            title="Restore Batch"
                            style={{ color: 'var(--color-success)' }}
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Restore Batch',
                                message: `Are you sure you want to restore "${batch.name}"? It will become open.`,
                                onConfirm: async () => {
                                  try {
                                    await batchApi.reopenBatch(batch.id);
                                    invalidateCacheByPrefix('admin:batch');
                                    invalidateCacheByPrefix('admin:dashboard');
                                    showToast('Batch restored successfully', 'success');
                                    refetch();
                                  } catch (err: unknown) {
                                    const message = err instanceof Error ? err.message : 'Failed to restore batch';
                                    showToast(message, 'error');
                                  }
                                },
                              });
                            }}
                          >
                            <History size={14} /> Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--color-gray-500)' }}>No historical batches found.</td></tr>
              )}
            </tbody>
          </table>
          {totalItems > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={totalItems}
                itemsPerPage={pageSize}
                onPageSizeChange={setPageSize}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
              />
            </div>
          )}
        </div>
      </div>

      {/* Audit Detail Modal */}
      {auditBatch && createPortal(
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-modal-overlay"
          onClick={() => setAuditBatch(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-modal-card"
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
        </div>,
        document.body,
      )}

      <ConfirmModal
        isOpen={!!confirmModal}
        title={confirmModal?.title || ''}
        message={confirmModal?.message || ''}
        onConfirm={() => confirmModal?.onConfirm()}
        onCancel={() => setConfirmModal(null)}
      />

      <UndoDeleteToast
        undoState={undoState}
        onUndo={cancelDelete}
        onExecuteNow={executeNow}
      />
    </>
  );
}
