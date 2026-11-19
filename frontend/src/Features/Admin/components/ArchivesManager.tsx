import { useState, useEffect, useMemo, useRef } from 'react';
import { Archive, RotateCcw, RefreshCw } from 'lucide-react';
import { batchApi, AcquisitionBatch } from '@/src/Endpoints/batchApi';
import { reportApi } from '@/src/Endpoints/reportApi';
import { useToast } from '@/src/Hooks/useToast';
import { useUndoDelete } from '@/src/Hooks/useUndoDelete';
import { UndoDeleteToast } from '@/src/Components/Shared/UndoDeleteToast';
import { useCachedQuery, invalidateCacheByPrefix } from '@/src/Hooks/useCachedQuery';
import { usePersistentState, useScrollRestoration } from '@/src/Hooks';
import { processInChunks } from '@/src/Libs/chunkUtils';

type ArchiveType = 'batches' | 'reports';
type ArchivedReportsResponse = Awaited<ReturnType<typeof reportApi.getArchivedReports>>;

const isArchiveType = (value: unknown): value is ArchiveType =>
  value === 'batches' || value === 'reports';

export function ArchivesManager({ active }: { active: boolean }) {
  const [archiveType, setArchiveType] = usePersistentState<ArchiveType>(
    'admin:archives:type',
    'batches',
    { validate: isArchiveType },
  );
  const [selectedArchivedBatchIds, setSelectedArchivedBatchIds] = useState<Set<number>>(new Set());
  const [selectedArchivedReportIds, setSelectedArchivedReportIds] = useState<Set<number>>(new Set());
  const [isRemoving, setIsRemoving] = useState(false);

  const { showToast } = useToast();
  const { undoState, triggerDelete, cancelDelete, executeNow } = useUndoDelete();

  const {
    data: cachedBatches,
    isLoading: batchesLoading,
    error: batchesError,
    mutate: mutateBatches,
  } = useCachedQuery<AcquisitionBatch[]>({
    key: 'admin:batches',
    fetcher: () => batchApi.getAllBatches(),
    staleTimeMs: 30_000,
    persistStorage: true,
    enabled: active,
    listenCmsUpdate: true,
  });

  const {
    data: cachedArchivedReports,
    isLoading: reportsLoading,
    error: reportsError,
    mutate: mutateArchivedReports,
  } = useCachedQuery<ArchivedReportsResponse>({
    key: 'admin:archives:reports',
    fetcher: () => reportApi.getArchivedReports(),
    staleTimeMs: 30_000,
    persistStorage: true,
    enabled: active,
    listenCmsUpdate: true,
  });

  const batchesRef = useRef<AcquisitionBatch[]>(cachedBatches ?? []);
  batchesRef.current = cachedBatches ?? [];

  const cachedArchivedReportsRef = useRef<ArchivedReportsResponse | undefined>(cachedArchivedReports);
  cachedArchivedReportsRef.current = cachedArchivedReports;

  const archivedBatches = useMemo(
    () => (cachedBatches ?? []).filter((b) => b.status === 'archived'),
    [cachedBatches],
  );
  const archivedReports = useMemo(
    () => cachedArchivedReports?.results ?? [],
    [cachedArchivedReports],
  );
  const archivesLoading =
    (batchesLoading && !cachedBatches) || (reportsLoading && !cachedArchivedReports);

  const {
    captureNow,
    restoreNow,
    highlightedId,
    setLastAnchorId,
  } = useScrollRestoration({
    storageKey: `admin:archives:${archiveType}`,
    isReady: active && !archivesLoading,
  });

  useEffect(() => {
    if (batchesError) {
      showToast('Failed to load archived batches', 'error');
    }
  }, [batchesError, showToast]);

  useEffect(() => {
    if (reportsError) {
      showToast('Failed to load archived reports', 'error');
    }
  }, [reportsError, showToast]);

  const sortByCreatedDesc = <T extends { created_at?: string }>(items: T[]): T[] =>
    [...items].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
    );

  const handleBulkDeleteArchivedBatches = () => {
    if (selectedArchivedBatchIds.size === 0) return;
    const count = selectedArchivedBatchIds.size;
    const ids = Array.from(selectedArchivedBatchIds);
    const itemsToDelete = archivedBatches.filter((b) => selectedArchivedBatchIds.has(b.id));

    captureNow(null);
    mutateBatches(batchesRef.current.filter((b) => !selectedArchivedBatchIds.has(b.id)));
    setSelectedArchivedBatchIds(new Set());

    triggerDelete(
      `${count} archived batch(es)`,
      async () => {
        setIsRemoving(true);
        try {
          await processInChunks(ids, 10, (id: number) => batchApi.deleteBatch(id), () => {});
          invalidateCacheByPrefix('admin:batch');
          invalidateCacheByPrefix('admin:dashboard');
          showToast(`Permanently removed ${count} batches`, 'success');
        } catch {
          mutateBatches(sortByCreatedDesc([...batchesRef.current, ...itemsToDelete]));
          showToast('Failed to permanently remove some batches', 'error');
        } finally {
          setIsRemoving(false);
        }
      },
      () => {
        mutateBatches(sortByCreatedDesc([...batchesRef.current, ...itemsToDelete]));
        showToast('Bulk permanent removal undone', 'success');
      }
    );
  };

  const handleBulkDeleteArchivedReports = () => {
    if (selectedArchivedReportIds.size === 0) return;
    const count = selectedArchivedReportIds.size;
    const ids = Array.from(selectedArchivedReportIds);
    const itemsToDelete = archivedReports.filter((r) => selectedArchivedReportIds.has(r.id));

    captureNow(null);
    if (cachedArchivedReportsRef.current) {
      mutateArchivedReports({
        ...cachedArchivedReportsRef.current,
        results: (cachedArchivedReportsRef.current.results || []).filter(
          (r) => !selectedArchivedReportIds.has(r.id),
        ),
      });
    }
    setSelectedArchivedReportIds(new Set());

    triggerDelete(
      `${count} archived report(s)`,
      async () => {
        setIsRemoving(true);
        try {
          await processInChunks(ids, 10, (id: number) => reportApi.deleteReport(id), () => {});
          invalidateCacheByPrefix('admin:archives');
          showToast(`Permanently removed ${count} reports`, 'success');
        } catch {
          if (cachedArchivedReportsRef.current) {
            mutateArchivedReports({
              ...cachedArchivedReportsRef.current,
              results: sortByCreatedDesc([
                ...(cachedArchivedReportsRef.current.results || []),
                ...itemsToDelete,
              ]),
            });
          }
          showToast('Failed to permanently remove some reports', 'error');
        } finally {
          setIsRemoving(false);
        }
      },
      () => {
        if (cachedArchivedReportsRef.current) {
          mutateArchivedReports({
            ...cachedArchivedReportsRef.current,
            results: sortByCreatedDesc([
              ...(cachedArchivedReportsRef.current.results || []),
              ...itemsToDelete,
            ]),
          });
        }
        showToast('Bulk permanent removal undone', 'success');
      }
    );
  };

  const handleBulkReopenBatches = async () => {
    if (selectedArchivedBatchIds.size === 0) return;
    const count = selectedArchivedBatchIds.size;
    const ids = Array.from(selectedArchivedBatchIds);
    const idSet = new Set(ids);

    captureNow(null);
    mutateBatches(
      batchesRef.current.map((b) => (idSet.has(b.id) ? { ...b, status: 'open' as const } : b)),
    );
    setSelectedArchivedBatchIds(new Set());

    try {
      await processInChunks(ids, 10, (id: number) => batchApi.reopenBatch(id), (_, __, c) => showToast(`${c} items reopened.`, 'info'));
      invalidateCacheByPrefix('admin:batch');
      invalidateCacheByPrefix('admin:dashboard');
      showToast(`Reopened ${count} batches`, 'success');
      restoreNow();
    } catch {
      mutateBatches(
        batchesRef.current.map((b) => (idSet.has(b.id) ? { ...b, status: 'archived' as const } : b)),
      );
      showToast('Failed to reopen some batches', 'error');
    }
  };

  const handleBulkUnarchiveReports = async () => {
    if (selectedArchivedReportIds.size === 0) return;
    const count = selectedArchivedReportIds.size;
    const ids = Array.from(selectedArchivedReportIds);
    const itemsToRestore = archivedReports.filter((r) => selectedArchivedReportIds.has(r.id));

    captureNow(null);
    if (cachedArchivedReportsRef.current) {
      mutateArchivedReports({
        ...cachedArchivedReportsRef.current,
        results: (cachedArchivedReportsRef.current.results || []).filter(
          (r) => !selectedArchivedReportIds.has(r.id),
        ),
      });
    }
    setSelectedArchivedReportIds(new Set());

    try {
      await processInChunks(ids, 10, (id: number) => reportApi.unarchiveReport(id), (_, __, c) => showToast(`${c} items reopened.`, 'info'));
      invalidateCacheByPrefix('admin:archives');
      showToast(`Unarchived ${count} reports`, 'success');
      restoreNow();
    } catch {
      if (cachedArchivedReportsRef.current) {
        mutateArchivedReports({
          ...cachedArchivedReportsRef.current,
          results: [...(cachedArchivedReportsRef.current.results || []), ...itemsToRestore],
        });
      }
      showToast('Failed to unarchive some reports', 'error');
    }
  };

  if (!active) return null;

  return (
    <>
      <UndoDeleteToast 
        undoState={undoState} 
        onUndo={cancelDelete} 
        onExecuteNow={executeNow} 
      />
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in">
        <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col xl:flex-row justify-between xl:items-center gap-4 items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2"><Archive size={22} className="text-gray-500" /> Archives</h2>
            <p className="text-sm text-gray-500">Manage archived batches and reports. Use Reopen to return items to active status.</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setArchiveType('batches')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${archiveType === 'batches' ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Batches
            </button>
            <button 
              onClick={() => setArchiveType('reports')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${archiveType === 'reports' ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Reports
            </button>
          </div>
        </div>
        
        {/* Action Bar */}
        {(archiveType === 'batches' ? selectedArchivedBatchIds.size > 0 : selectedArchivedReportIds.size > 0) && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">
              {archiveType === 'batches' ? selectedArchivedBatchIds.size : selectedArchivedReportIds.size} selected
            </span>
            <button 
              onClick={archiveType === 'batches' ? handleBulkReopenBatches : handleBulkUnarchiveReports}
              className="admin-btn admin-btn--secondary flex items-center gap-1 !py-1.5"
            >
              <RotateCcw size={14} /> Reopen Selected
            </button>
            <button 
              onClick={archiveType === 'batches' ? handleBulkDeleteArchivedBatches : handleBulkDeleteArchivedReports}
              disabled={isRemoving}
              className="admin-btn flex items-center gap-1 !py-1.5 disabled:opacity-50"
              style={{ background: isRemoving ? 'var(--color-gray-400)' : 'var(--color-red-600)', color: 'white', border: 'none' }}
            >
              <Archive size={14} /> Remove Permanently
            </button>
          </div>
        )}

        {archivesLoading ? (
          <div className="p-10 text-center text-gray-400 flex items-center justify-center gap-2"><RefreshCw size={20} className="animate-spin" /> Loading archives...</div>
        ) : archiveType === 'batches' ? (
          archivedBatches.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <Archive size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No archived batches found.</p>
              <p className="text-sm mt-1">Batches you archive will appear here.</p>
            </div>
          ) : (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input 
                        type="checkbox"
                        checked={archivedBatches.length > 0 && archivedBatches.every(b => selectedArchivedBatchIds.has(b.id))}
                        disabled={isRemoving}
                        className="disabled:opacity-50"
                        onChange={(e) => {
                          const newSet = new Set(selectedArchivedBatchIds);
                          if (e.target.checked) archivedBatches.forEach(b => newSet.add(b.id));
                          else archivedBatches.forEach(b => newSet.delete(b.id));
                          setSelectedArchivedBatchIds(newSet);
                        }}
                      />
                    </th>
                    <th>Batch Name</th>
                    <th>Description</th>
                    <th>Books</th>
                    <th>Opened</th>
                    <th>Closed</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedBatches.map((batch) => {
                    const isHighlighted = highlightedId === String(batch.id);
                    const isSelected = selectedArchivedBatchIds.has(batch.id);
                    return (
                    <tr
                      key={batch.id}
                      data-cache-anchor-id={String(batch.id)}
                      className={isHighlighted ? 'ring-2 ring-amber-400 bg-amber-50/40' : undefined}
                      style={{
                        backgroundColor: isSelected ? 'var(--color-blue-50)' : undefined,
                      }}
                    >
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          disabled={isRemoving}
                          className="disabled:opacity-50"
                          onChange={(e) => {
                            const newSet = new Set(selectedArchivedBatchIds);
                            if (e.target.checked) newSet.add(batch.id);
                            else newSet.delete(batch.id);
                            setSelectedArchivedBatchIds(newSet);
                          }}
                        />
                      </td>
                      <td style={{ fontWeight: 500 }}>{batch.name}</td>
                      <td style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>{batch.description || <span className="text-gray-300 italic">No description</span>}</td>
                      <td>{batch.book_count || 0}</td>
                      <td style={{ color: 'var(--color-gray-500)', fontSize: '0.85rem' }}>{new Date(batch.opened_at).toLocaleDateString()}</td>
                      <td style={{ color: 'var(--color-gray-500)', fontSize: '0.85rem' }}>{batch.closed_at ? new Date(batch.closed_at).toLocaleDateString() : '—'}</td>
                      <td>
                        <div className="flex justify-end">
                          <button
                            className="admin-btn admin-btn--secondary"
                            style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                            onClick={async () => {
                              captureNow(batch.id);
                              try {
                                await batchApi.reopenBatch(batch.id);
                                mutateBatches(
                                  batchesRef.current.map((b) =>
                                    b.id === batch.id ? { ...b, status: 'open' as const } : b,
                                  ),
                                );
                                invalidateCacheByPrefix('admin:batch');
                                invalidateCacheByPrefix('admin:dashboard');
                                showToast('Batch reopened successfully', 'success');
                                restoreNow();
                              } catch (err: unknown) {
                                const message = err instanceof Error ? err.message : 'Failed to reopen batch';
                                showToast(message, 'error');
                                setLastAnchorId(batch.id);
                                restoreNow(batch.id);
                              }
                            }}
                          >
                            <RotateCcw size={14} /> Reopen
                          </button>
                          <button
                            className="admin-btn disabled:opacity-50"
                            disabled={isRemoving}
                            style={{ background: isRemoving ? 'var(--color-gray-400)' : 'var(--color-red-600)', color: 'white', border: 'none', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                            onClick={() => {
                              captureNow(batch.id);
                              const newSet = new Set([batch.id]);
                              setSelectedArchivedBatchIds(newSet);
                              triggerDelete(
                                `Archived batch "${batch.name}"`,
                                async () => {
                                  try {
                                    await batchApi.deleteBatch(batch.id);
                                    invalidateCacheByPrefix('admin:batch');
                                    invalidateCacheByPrefix('admin:dashboard');
                                  } catch {
                                    mutateBatches(sortByCreatedDesc([...batchesRef.current, batch]));
                                    setLastAnchorId(batch.id);
                                    restoreNow(batch.id);
                                    showToast('Failed to permanently remove batch', 'error');
                                  }
                                },
                                () => {
                                  mutateBatches(sortByCreatedDesc([...batchesRef.current, batch]));
                                  setLastAnchorId(batch.id);
                                  restoreNow(batch.id);
                                  showToast('Batch permanent removal undone', 'success');
                                }
                              );
                              mutateBatches(batchesRef.current.filter((b) => b.id !== batch.id));
                            }}
                          >
                            <Archive size={14} /> Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          archivedReports.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <Archive size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No archived reports found.</p>
              <p className="text-sm mt-1">Reports you archive will appear here.</p>
            </div>
          ) : (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input 
                        type="checkbox"
                        checked={archivedReports.length > 0 && archivedReports.every(r => selectedArchivedReportIds.has(r.id))}
                        disabled={isRemoving}
                        className="disabled:opacity-50"
                        onChange={(e) => {
                          const newSet = new Set(selectedArchivedReportIds);
                          if (e.target.checked) archivedReports.forEach(r => newSet.add(r.id));
                          else archivedReports.forEach(r => newSet.delete(r.id));
                          setSelectedArchivedReportIds(newSet);
                        }}
                      />
                    </th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Date Range</th>
                    <th>Generated By</th>
                    <th>Generated At</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedReports.map((report) => {
                    const isHighlighted = highlightedId === String(report.id);
                    const isSelected = selectedArchivedReportIds.has(report.id);
                    return (
                    <tr
                      key={report.id}
                      data-cache-anchor-id={String(report.id)}
                      className={isHighlighted ? 'ring-2 ring-amber-400 bg-amber-50/40' : undefined}
                      style={{
                        backgroundColor: isSelected ? 'var(--color-blue-50)' : undefined,
                      }}
                    >
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          disabled={isRemoving}
                          className="disabled:opacity-50"
                          onChange={(e) => {
                            const newSet = new Set(selectedArchivedReportIds);
                            if (e.target.checked) newSet.add(report.id);
                            else newSet.delete(report.id);
                            setSelectedArchivedReportIds(newSet);
                          }}
                        />
                      </td>
                      <td className="font-medium text-gray-900">{report.title}</td>
                      <td><span className="bg-blue-50 text-navy px-2 py-1 rounded-md text-xs font-semibold uppercase">{report.report_type}</span></td>
                      <td>{report.date_range.replace('-', ' ').toUpperCase()}</td>
                      <td>{report.generated_by}</td>
                      <td>{new Date(report.generated_at).toLocaleString()}</td>
                      <td>
                        <div className="flex justify-end">
                          <button
                            className="admin-btn admin-btn--secondary"
                            style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                            onClick={async () => {
                              captureNow(report.id);
                              try {
                                await reportApi.unarchiveReport(report.id);
                                if (cachedArchivedReportsRef.current) {
                                  mutateArchivedReports({
                                    ...cachedArchivedReportsRef.current,
                                    results: (cachedArchivedReportsRef.current.results || []).filter(
                                      (r) => r.id !== report.id,
                                    ),
                                  });
                                }
                                invalidateCacheByPrefix('admin:archives');
                                showToast('Report unarchived successfully', 'success');
                                restoreNow();
                              } catch (err: unknown) {
                                const message = err instanceof Error ? err.message : 'Failed to unarchive report';
                                showToast(message, 'error');
                                setLastAnchorId(report.id);
                                restoreNow(report.id);
                              }
                            }}
                          >
                            <RotateCcw size={14} /> Reopen
                          </button>
                          <button
                            className="admin-btn disabled:opacity-50"
                            disabled={isRemoving}
                            style={{ background: isRemoving ? 'var(--color-gray-400)' : 'var(--color-red-600)', color: 'white', border: 'none', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                            onClick={() => {
                              captureNow(report.id);
                              triggerDelete(
                                `Archived report "${report.title}"`,
                                async () => {
                                  try {
                                    await reportApi.deleteReport(report.id);
                                    invalidateCacheByPrefix('admin:archives');
                                  } catch {
                                    if (cachedArchivedReportsRef.current) {
                                      mutateArchivedReports({
                                        ...cachedArchivedReportsRef.current,
                                        results: sortByCreatedDesc([
                                          ...(cachedArchivedReportsRef.current.results || []),
                                          report,
                                        ]),
                                      });
                                    }
                                    setLastAnchorId(report.id);
                                    restoreNow(report.id);
                                    showToast('Failed to permanently remove report', 'error');
                                  }
                                },
                                () => {
                                  if (cachedArchivedReportsRef.current) {
                                    mutateArchivedReports({
                                      ...cachedArchivedReportsRef.current,
                                      results: sortByCreatedDesc([
                                        ...(cachedArchivedReportsRef.current.results || []),
                                        report,
                                      ]),
                                    });
                                  }
                                  setLastAnchorId(report.id);
                                  restoreNow(report.id);
                                  showToast('Report permanent removal undone', 'success');
                                }
                              );
                              if (cachedArchivedReportsRef.current) {
                                mutateArchivedReports({
                                  ...cachedArchivedReportsRef.current,
                                  results: (cachedArchivedReportsRef.current.results || []).filter(
                                    (r) => r.id !== report.id,
                                  ),
                                });
                              }
                            }}
                          >
                            <Archive size={14} /> Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </>
  );
}
