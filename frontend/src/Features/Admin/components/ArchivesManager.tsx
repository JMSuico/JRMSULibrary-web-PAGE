import React, { useState, useEffect } from 'react';
import { Archive, RotateCcw, RefreshCw } from 'lucide-react';
import { batchApi, AcquisitionBatch } from '@/src/Endpoints/batchApi';
import { reportApi, HistoricalReport } from '@/src/Endpoints/reportApi';
import { useToast } from '@/src/Hooks/useToast';
import { useUndoDelete } from '@/src/Hooks/useUndoDelete';
import { UndoDeleteToast } from '@/src/Components/Shared/UndoDeleteToast';
import { processInChunks } from '@/src/Libs/chunkUtils';

export function ArchivesManager({ active }: { active: boolean }) {
  const [archivedBatches, setArchivedBatches] = useState<AcquisitionBatch[]>([]);
  const [archivedReports, setArchivedReports] = useState<HistoricalReport[]>([]);
  const [archivesLoading, setArchivesLoading] = useState(false);
  const [archiveType, setArchiveType] = useState<'batches' | 'reports'>('batches');
  const [selectedArchivedBatchIds, setSelectedArchivedBatchIds] = useState<Set<number>>(new Set());
  const [selectedArchivedReportIds, setSelectedArchivedReportIds] = useState<Set<number>>(new Set());
  const [isRemoving, setIsRemoving] = useState(false);

  const { showToast } = useToast();
  const { undoState, triggerDelete, cancelDelete, executeNow } = useUndoDelete();

  useEffect(() => {
    if (!active) return;
    setArchivesLoading(true);
    
    Promise.all([
      batchApi.getAllBatches().then(data => setArchivedBatches(data.filter(b => b.status === 'archived'))).catch(() => showToast('Failed to load archived batches', 'error')),
      reportApi.getArchivedReports().then(data => setArchivedReports(data.results)).catch(() => showToast('Failed to load archived reports', 'error'))
    ]).finally(() => setArchivesLoading(false));
  }, [active, showToast]);

  const handleBulkDeleteArchivedBatches = () => {
    if (selectedArchivedBatchIds.size === 0) return;
    const count = selectedArchivedBatchIds.size;
    const ids = Array.from(selectedArchivedBatchIds);
    const itemsToDelete = archivedBatches.filter(b => selectedArchivedBatchIds.has(b.id));

    setArchivedBatches(prev => prev.filter(b => !selectedArchivedBatchIds.has(b.id)));
    setSelectedArchivedBatchIds(new Set());

    triggerDelete(
      `${count} archived batch(es)`,
      async () => {
        setIsRemoving(true);
        try {
          await processInChunks(ids, 10, (id: number) => batchApi.deleteBatch(id), (_, __, c) => {});
          showToast(`Permanently removed ${count} batches`, 'success');
        } catch (err) {
          setArchivedBatches(prev => [...prev, ...itemsToDelete].sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
          showToast('Failed to permanently remove some batches', 'error');
        } finally {
          setIsRemoving(false);
        }
      },
      () => {
        setArchivedBatches(prev => [...prev, ...itemsToDelete].sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
        showToast('Bulk permanent removal undone', 'success');
      }
    );
  };

  const handleBulkDeleteArchivedReports = () => {
    if (selectedArchivedReportIds.size === 0) return;
    const count = selectedArchivedReportIds.size;
    const ids = Array.from(selectedArchivedReportIds);
    const itemsToDelete = archivedReports.filter(r => selectedArchivedReportIds.has(r.id));

    setArchivedReports(prev => prev.filter(r => !selectedArchivedReportIds.has(r.id)));
    setSelectedArchivedReportIds(new Set());

    triggerDelete(
      `${count} archived report(s)`,
      async () => {
        setIsRemoving(true);
        try {
          await processInChunks(ids, 10, (id: number) => reportApi.deleteReport(id), (_, __, c) => {});
          showToast(`Permanently removed ${count} reports`, 'success');
        } catch (err) {
          setArchivedReports(prev => [...prev, ...itemsToDelete].sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
          showToast('Failed to permanently remove some reports', 'error');
        } finally {
          setIsRemoving(false);
        }
      },
      () => {
        setArchivedReports(prev => [...prev, ...itemsToDelete].sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
        showToast('Bulk permanent removal undone', 'success');
      }
    );
  };

  const handleBulkReopenBatches = async () => {
    if (selectedArchivedBatchIds.size === 0) return;
    const count = selectedArchivedBatchIds.size;
    const ids = Array.from(selectedArchivedBatchIds);
    const itemsToRestore = archivedBatches.filter(b => selectedArchivedBatchIds.has(b.id));

    setArchivedBatches(prev => prev.filter(b => !selectedArchivedBatchIds.has(b.id)));
    setSelectedArchivedBatchIds(new Set());

    try {
      await processInChunks(ids, 10, (id: number) => batchApi.reopenBatch(id), (_, __, c) => showToast(`${c} items reopened.`, 'info'));
      showToast(`Reopened ${count} batches`, 'success');
    } catch (err) {
      setArchivedBatches(prev => [...prev, ...itemsToRestore]);
      showToast('Failed to reopen some batches', 'error');
    }
  };

  const handleBulkUnarchiveReports = async () => {
    if (selectedArchivedReportIds.size === 0) return;
    const count = selectedArchivedReportIds.size;
    const ids = Array.from(selectedArchivedReportIds);
    const itemsToRestore = archivedReports.filter(r => selectedArchivedReportIds.has(r.id));

    setArchivedReports(prev => prev.filter(r => !selectedArchivedReportIds.has(r.id)));
    setSelectedArchivedReportIds(new Set());

    try {
      await processInChunks(ids, 10, (id: number) => reportApi.unarchiveReport(id), (_, __, c) => showToast(`${c} items reopened.`, 'info'));
      showToast(`Unarchived ${count} reports`, 'success');
    } catch (err) {
      setArchivedReports(prev => [...prev, ...itemsToRestore]);
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
                  {archivedBatches.map(batch => (
                    <tr key={batch.id} style={{ backgroundColor: selectedArchivedBatchIds.has(batch.id) ? 'var(--color-blue-50)' : undefined }}>
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox"
                          checked={selectedArchivedBatchIds.has(batch.id)}
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
                              try {
                                await batchApi.reopenBatch(batch.id);
                                setArchivedBatches(prev => prev.filter(b => b.id !== batch.id));
                                showToast('Batch reopened successfully', 'success');
                              } catch (err: any) {
                                showToast(err.message || 'Failed to reopen batch', 'error');
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
                              const newSet = new Set([batch.id]);
                              setSelectedArchivedBatchIds(newSet);
                              triggerDelete(
                                `Archived batch "${batch.name}"`,
                                async () => {
                                  try {
                                    await batchApi.deleteBatch(batch.id);
                                  } catch (err) {
                                    setArchivedBatches(prev => [...prev, batch].sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
                                    showToast('Failed to permanently remove batch', 'error');
                                  }
                                },
                                () => {
                                  setArchivedBatches(prev => [...prev, batch].sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
                                  showToast('Batch permanent removal undone', 'success');
                                }
                              );
                              setArchivedBatches(prev => prev.filter(b => b.id !== batch.id));
                            }}
                          >
                            <Archive size={14} /> Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                  {archivedReports.map(report => (
                    <tr key={report.id} style={{ backgroundColor: selectedArchivedReportIds.has(report.id) ? 'var(--color-blue-50)' : undefined }}>
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox"
                          checked={selectedArchivedReportIds.has(report.id)}
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
                              try {
                                await reportApi.unarchiveReport(report.id);
                                setArchivedReports(prev => prev.filter(r => r.id !== report.id));
                                showToast('Report unarchived successfully', 'success');
                              } catch (err: any) {
                                showToast(err.message || 'Failed to unarchive report', 'error');
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
                              triggerDelete(
                                `Archived report "${report.title}"`,
                                async () => {
                                  try {
                                    await reportApi.deleteReport(report.id);
                                  } catch (err) {
                                    setArchivedReports(prev => [...prev, report].sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
                                    showToast('Failed to permanently remove report', 'error');
                                  }
                                },
                                () => {
                                  setArchivedReports(prev => [...prev, report].sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
                                  showToast('Report permanent removal undone', 'success');
                                }
                              );
                              setArchivedReports(prev => prev.filter(r => r.id !== report.id));
                            }}
                          >
                            <Archive size={14} /> Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </>
  );
}
