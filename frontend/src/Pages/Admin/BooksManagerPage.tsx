import { useState, useEffect, useRef, useCallback } from 'react';
import { BookOpen, Plus, Tag, RefreshCw, LayoutGrid, List, Eye, Pencil, Trash2 } from 'lucide-react';
import { MetricCard } from '@/src/Features/Admin/components/MetricCard';
import { batchApi, AcquisitionBatch, BatchBook } from '@/src/Endpoints/batchApi';
import { BatchCard } from '@/src/Features/Admin/components/BatchCard';
import { CreateBatchModal } from '@/src/Features/Admin/components/CreateBatchModal';
import { BookFormModal } from '@/src/Features/Admin/components/BookFormModal';
import { ConfirmModal } from '@/src/Features/Admin/components/ConfirmModal';
import { useToast } from '@/src/Hooks/useToast';
import { useAutoRefresh } from '@/src/Hooks/useAutoRefresh';
import { useDebounce } from '@/src/Hooks/useDebounce';
import { useUndoDelete } from '@/src/Hooks/useUndoDelete';

type ViewMode = 'table' | 'grid';

export default function BooksManagerPage() {
  const [batches, setBatches] = useState<AcquisitionBatch[]>([]);
  const [currentBatch, setCurrentBatch] = useState<AcquisitionBatch | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [isBookFormOpen, setIsBookFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BatchBook | undefined>(undefined);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null);
  const [auditBatch, setAuditBatch] = useState<AcquisitionBatch | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const { showToast } = useToast();
  const { undoState, triggerDelete, cancelDelete } = useUndoDelete();

  const loadData = async () => {
    setLoading(true);
    try {
      // For the manager page, we typically want to see the active display batch OR the latest open batch
      const allBatches = await batchApi.getAllBatches();
      setBatches(allBatches);
      
      const displayBatch = allBatches.find(b => b.is_display_batch);
      const openBatch = allBatches.find(b => b.status === 'open');
      
      const targetBatchId = openBatch?.id || displayBatch?.id || (allBatches.length > 0 ? allBatches[0].id : null);
      
      if (targetBatchId) {
        const fullBatch = await batchApi.getBatchById(targetBatchId);
        setCurrentBatch(fullBatch);
      } else {
        setCurrentBatch(null);
      }
    } catch (error) {
      console.error('Failed to load batches', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Mutation guard — prevents auto-refresh from overwriting optimistic UI
  const isMutating = useRef(false);

  useAutoRefresh(useCallback(async () => {
    if (isMutating.current) return; // Skip if a CRUD op is in flight
    await loadData();
  }, []), 30000);
  const handleCreateBatch = async (data: Partial<AcquisitionBatch>) => {
    try {
      await batchApi.createBatch(data);
      setIsCreateBatchOpen(false);
      showToast('Batch created successfully', 'success');
      loadData();
    } catch (error: any) {
      showToast(error.message || 'Failed to create batch', 'error');
    }
  };

  const handleBatchAction = async (action: 'close' | 'archive' | 'activate' | 'reopen', id: number) => {
    try {
      switch (action) {
        case 'close': await batchApi.closeBatch(id); break;
        case 'archive': await batchApi.archiveBatch(id); break;
        case 'activate': await batchApi.activateBatch(id); break;
        case 'reopen': await batchApi.reopenBatch(id); break;
      }
      showToast(`Batch ${action}d successfully`, 'success');
      loadData();
    } catch (error: any) {
      showToast(error.message || `Failed to ${action} batch`, 'error');
    }
  };

  const handleViewBatchBooks = async (id: number) => {
    setLoading(true);
    try {
      const fullBatch = await batchApi.getBatchById(id);
      setCurrentBatch(fullBatch);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateBook = async (data: FormData) => {
    if (!currentBatch) return;
    isMutating.current = true;
    try {
      if (editingBook) {
        const updatedBook = await batchApi.updateBook(currentBatch.id, editingBook.id, data);
        // Optimistic update: replace the edited book in local state
        setCurrentBatch(prev => prev ? {
          ...prev,
          books: (prev.books || []).map(b => b.id === editingBook.id ? updatedBook : b)
        } : prev);
        showToast('Book updated successfully', 'success');
      } else {
        const newBook = await batchApi.addBookToBatch(currentBatch.id, data);
        // Optimistic update: append new book to local state
        setCurrentBatch(prev => prev ? {
          ...prev,
          books: [...(prev.books || []), newBook],
          book_count: (prev.book_count || 0) + 1
        } : prev);
        showToast('Book added successfully', 'success');
      }
      setIsBookFormOpen(false);
      setEditingBook(undefined);
    } catch (error: any) {
      showToast(error.message || 'Failed to save book', 'error');
      // On error, do a full refresh to ensure consistent state
      await handleViewBatchBooks(currentBatch.id);
    } finally {
      isMutating.current = false;
    }
  };

  const handleDeleteBook = (bookId: number) => {
    if (!currentBatch) return;
    const bookToDelete = currentBatch.books?.find(b => b.id === bookId);
    if (!bookToDelete) return;

    setConfirmModal({
      isOpen: true,
      title: 'Remove Book',
      message: 'Are you sure you want to remove this book from the batch?',
      onConfirm: () => {
        triggerDelete(
          bookToDelete.title,
          async () => {
            // Actual delete action after timeout
            try {
              await batchApi.deleteBook(currentBatch.id, bookId);
              showToast('Book permanently deleted', 'success');
            } catch (error: any) {
              // Revert if API fails
              setCurrentBatch(prev => prev ? {
                ...prev,
                books: [...(prev.books || []), bookToDelete],
                book_count: (prev.book_count || 0) + 1
              } : prev);
              showToast(error.message || 'Failed to delete book', 'error');
            }
          },
          () => {
            // Local Undo Action (restore optimistic)
            setCurrentBatch(prev => prev ? {
              ...prev,
              books: [...(prev.books || []), bookToDelete],
              book_count: (prev.book_count || 0) + 1
            } : prev);
            showToast('Deletion undone', 'success');
          }
        );

        // Optimistic: remove immediately from local state
        setCurrentBatch(prev => prev ? {
          ...prev,
          books: (prev.books || []).filter(b => b.id !== bookId),
          book_count: Math.max(0, (prev.book_count || 0) - 1)
        } : prev);
      }
    });
  };

  // Derived state for filtering
  const debouncedSearch = useDebounce(searchQuery, 400);
  const displayBooks = currentBatch?.books || [];
  const filteredBooks = displayBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      book.author.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (book.accession_number && book.accession_number.toLowerCase().includes(debouncedSearch.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = ['All', ...new Set(displayBooks.map((b) => b.category))].filter(Boolean);

  if (loading && !currentBatch) {
    return <div style={{ padding: 40, textAlign: 'center' }}><RefreshCw className="animate-spin" /> Loading...</div>;
  }

  return (
    <>
      <div className="admin-content__header">
        <h1>Newly Acquired Books</h1>
        <p>Manage batches of new acquisitions. Only one batch can be actively displayed to the public at a time.</p>
      </div>

      <div className="admin-metrics">
        <MetricCard
          label="Total Batches"
          value={batches.length}
          icon={<BookOpen size={22} />}
          variant="navy"
        />
        <MetricCard
          label="Active Display Books"
          value={batches.find(b => b.is_display_batch)?.book_count || 0}
          icon={<Tag size={22} />}
          variant="gold"
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
          <button className="admin-btn admin-btn--primary" onClick={() => setIsCreateBatchOpen(true)}>
            <Plus size={16} /> New Batch
          </button>
        </div>
      </div>

      {/* Batch Cards Section */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.125rem', marginBottom: 16 }}>Recent Batches</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {batches.slice(0, 3).map((batch) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              onContinue={() => handleViewBatchBooks(batch.id)}
              onClose={(id) => handleBatchAction('close', id)}
              onArchive={(id) => handleBatchAction('archive', id)}
              onReopen={(id) => handleBatchAction('reopen', id)}
              onActivate={(id) => handleBatchAction('activate', id)}
              onViewBooks={handleViewBatchBooks}
              onViewAudit={(b) => setAuditBatch(b)}
            />
          ))}
          {batches.length === 0 && (
            <div style={{ color: '#6b7280', gridColumn: '1 / -1' }}>No batches found. Create one to get started.</div>
          )}
        </div>
      </div>

      {/* Current Selected Batch Books Section */}
      {currentBatch && (
        <div className="admin-table-wrapper" style={{ marginTop: 32 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Books in: {currentBatch.name}</h3>
              <span className={`admin-badge admin-badge--${currentBatch.status === 'open' ? 'info' : 'warning'}`} style={{ marginTop: 8, display: 'inline-block' }}>
                Status: {currentBatch.status.toUpperCase()}
              </span>
            </div>
            {currentBatch.status === 'open' && (
              <button className="admin-btn admin-btn--primary" onClick={() => { setEditingBook(undefined); setIsBookFormOpen(true); }}>
                <Plus size={16} /> Add Book
              </button>
            )}
          </div>

          <div className="admin-table-toolbar">
            <div className="admin-table-toolbar__search">
              <input
                type="text"
                placeholder="Search by title, author, or accession..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="admin-table-toolbar__actions">
              <select className="admin-btn admin-btn--secondary" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button className={`admin-btn admin-btn--icon`} onClick={() => setViewMode('grid')} style={viewMode === 'grid' ? { background: '#002B7F', color: '#fff' } : {}}>
                <LayoutGrid size={16} />
              </button>
              <button className={`admin-btn admin-btn--icon`} onClick={() => setViewMode('table')} style={viewMode === 'table' ? { background: '#002B7F', color: '#fff' } : {}}>
                <List size={16} />
              </button>
            </div>
          </div>

          {viewMode === 'table' && (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Accession No.</th>
                    <th>Category</th>
                    <th>Date Encoded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => (
                    <tr key={book.id}>
                      <td style={{ fontWeight: 500 }}>{book.title}</td>
                      <td>{book.author}</td>
                      <td style={{ fontFamily: 'monospace' }}>{book.accession_number || 'N/A'}</td>
                      <td><span className="admin-badge admin-badge--info">{book.category}</span></td>
                      <td style={{ color: '#6b7280' }}>{new Date(book.date_encoded).toLocaleDateString()}</td>
                      <td>
                        <div className="admin-table__actions">
                          <button className="admin-btn admin-btn--icon" onClick={() => { setEditingBook(book); setIsBookFormOpen(true); }}><Pencil size={15} /></button>
                          <button className="admin-btn admin-btn--icon" style={{ color: '#dc2626' }} onClick={() => handleDeleteBook(book.id)}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredBooks.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>No books in this batch match the filter.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="admin-card-grid" style={{ padding: 20 }}>
              {filteredBooks.map((book) => (
                <div className="admin-grid-card" key={book.id}>
                  <div style={{ height: 140, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {book.cover_image ? (
                      <img src={book.cover_image} alt={book.title} style={{ height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <BookOpen size={40} color="#9ca3af" />
                    )}
                  </div>
                  <div className="admin-grid-card__body">
                    <div className="admin-grid-card__title">{book.title}</div>
                    <div className="admin-grid-card__meta">{book.author}</div>
                    <div style={{ marginTop: 8 }}><span className="admin-badge admin-badge--info">{book.category}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateBatchModal
        isOpen={isCreateBatchOpen}
        onClose={() => setIsCreateBatchOpen(false)}
        onSubmit={handleCreateBatch}
      />
      
      <BookFormModal
        isOpen={isBookFormOpen}
        onClose={() => { setIsBookFormOpen(false); setEditingBook(undefined); }}
        onSubmit={handleAddOrUpdateBook}
        initialData={editingBook}
      />

      <ConfirmModal
        isOpen={!!confirmModal}
        title={confirmModal?.title || ''}
        message={confirmModal?.message || ''}
        onConfirm={() => confirmModal?.onConfirm()}
        onCancel={() => setConfirmModal(null)}
      />

      {/* Audit Modal */}
      {auditBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setAuditBatch(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-5 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Audit Trail — {auditBatch.name}
                </h2>
                <p className="text-indigo-200 text-sm mt-1">Full lifecycle history of this batch</p>
              </div>
              <button onClick={() => setAuditBatch(null)} className="text-indigo-200 hover:text-white transition-colors text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Batch Created / Opened</p>
                    <p className="text-xs text-gray-500">{new Date(auditBatch.opened_at).toLocaleString('en-PH', { dateStyle: 'full', timeStyle: 'short' })}</p>
                  </div>
                </div>
                {auditBatch.closed_at && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Batch Closed</p>
                      <p className="text-xs text-gray-500">{new Date(auditBatch.closed_at).toLocaleString('en-PH', { dateStyle: 'full', timeStyle: 'short' })}</p>
                    </div>
                  </div>
                )}
                {auditBatch.status === 'archived' && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-400 shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Batch Archived</p>
                      <p className="text-xs text-gray-500">Archived from closed state</p>
                    </div>
                  </div>
                )}
                {auditBatch.is_display_batch && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Set as Active Display Batch</p>
                      <p className="text-xs text-gray-500">Currently displayed to the public</p>
                    </div>
                  </div>
                )}
              </div>

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

              {auditBatch.description && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-gray-700">{auditBatch.description}</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setAuditBatch(null)} className="admin-btn admin-btn--secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Delete Toast */}
      {undoState && (
        <div className="fixed bottom-6 right-6 z-[60] bg-white rounded-lg shadow-xl border border-gray-100 p-4 w-80 flex flex-col gap-3 animate-in slide-in-from-bottom-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-800 text-sm">Item deleted</p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">"{undoState.itemName}"</p>
            </div>
            <button
              onClick={cancelDelete}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded transition-colors"
            >
              Undo
            </button>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gray-400 h-full transition-all ease-linear"
              style={{ width: `${(undoState.countdown / 15) * 100}%`, transitionDuration: '1s' }}
            />
          </div>
        </div>
      )}
    </>
  );
}
