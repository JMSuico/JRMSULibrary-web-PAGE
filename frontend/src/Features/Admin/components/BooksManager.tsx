import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Plus, Tag, RefreshCw, LayoutGrid, List, Eye, Pencil, Trash2, X, ChevronRight, ListOrdered, MoreVertical } from 'lucide-react';
import { MetricCard } from '@/src/Features/Admin/components/MetricCard';
import { batchApi, AcquisitionBatch, BatchBook } from '@/src/Endpoints/batchApi';
import { BatchCard } from '@/src/Features/Admin/components/BatchCard';
import { CreateBatchModal } from '@/src/Features/Admin/components/CreateBatchModal';
import { EditBatchModal } from '@/src/Features/Admin/components/EditBatchModal';
import { UndoDeleteToast } from '@/src/Components/Shared/UndoDeleteToast';
import { BookFormModal } from '@/src/Features/Admin/components/BookFormModal';
import { useToast } from '@/src/Hooks/useToast';
import { useCmsUpdated } from '@/src/Hooks/useCmsUpdated';
import { useAutoRefresh } from '@/src/Hooks/useAutoRefresh';
import { useDebounce } from '@/src/Hooks/useDebounce';
import { useUndoDelete } from '@/src/Hooks/useUndoDelete';
import { Pagination } from '@/src/Components/Shared/Pagination';

type ViewMode = 'table' | 'grid';

export function BooksManager() {
  const [batches, setBatches] = useState<AcquisitionBatch[]>([]);
  const [currentBatch, setCurrentBatch] = useState<AcquisitionBatch | null>(null);
  const currentBatchIdRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [isBookFormOpen, setIsBookFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BatchBook | undefined>(undefined);
  const [selectedBatchIds, setSelectedBatchIds] = useState<Set<number>>(new Set());
  const [auditBatch, setAuditBatch] = useState<AcquisitionBatch | null>(null);
  const [editBatch, setEditBatch] = useState<AcquisitionBatch | null>(null);
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [activeBookDropdown, setActiveBookDropdown] = useState<number | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { showToast } = useToast();
  const { undoState, triggerDelete, cancelDelete, executeNow } = useUndoDelete();

  // Mouse Drag to Scroll for Recent Batches
  const recentBatchesRef = useRef<HTMLDivElement>(null);
  const [isDraggingBatches, setIsDraggingBatches] = useState(false);
  const [startXBatches, setStartXBatches] = useState(0);
  const [scrollLeftBatches, setScrollLeftBatches] = useState(0);

  const onMouseDownBatches = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!recentBatchesRef.current) return;
    setIsDraggingBatches(true);
    setStartXBatches(e.pageX - recentBatchesRef.current.offsetLeft);
    setScrollLeftBatches(recentBatchesRef.current.scrollLeft);
    recentBatchesRef.current.style.cursor = 'grabbing';
  };
  const onMouseLeaveBatches = () => {
    setIsDraggingBatches(false);
    if (recentBatchesRef.current) recentBatchesRef.current.style.cursor = 'grab';
  };
  const onMouseUpBatches = () => {
    setIsDraggingBatches(false);
    if (recentBatchesRef.current) recentBatchesRef.current.style.cursor = 'grab';
  };
  const onMouseMoveBatches = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingBatches || !recentBatchesRef.current) return;
    e.preventDefault();
    const x = e.pageX - recentBatchesRef.current.offsetLeft;
    const walk = (x - startXBatches) * 1.5;
    recentBatchesRef.current.scrollLeft = scrollLeftBatches - walk;
  };

  useEffect(() => {
    if (currentBatch) {
      currentBatchIdRef.current = currentBatch.id;
    }
  }, [currentBatch]);

  const loadData = async () => {
    setLoading(true);
    try {
      const allBatches = await batchApi.getAllBatches();
      setBatches(allBatches);

      let targetBatchId = currentBatchIdRef.current;

      if (!targetBatchId || !allBatches.some(b => b.id === targetBatchId)) {
        const displayBatch = allBatches.find(b => b.is_display_batch);
        const openBatch = allBatches.find(b => b.status === 'open');
        targetBatchId = openBatch?.id || displayBatch?.id || (allBatches.length > 0 ? allBatches[0].id : null);
      }

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

  useCmsUpdated(loadData);

  // Mutation guard — prevents auto-refresh from overwriting optimistic UI
  const isMutating = useRef(false);

  // We omit dependency array for useAutoRefresh callback so it captures the latest loadData 
  // (which in turn uses the ref for targetBatchId, so we are safe)
  useAutoRefresh(useCallback(async () => {
    if (isMutating.current) return; // Skip if a CRUD op is in flight
    await loadData();
  }, [loadData]), 30000);
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

  const handleEditBatch = async (id: number, data: Partial<AcquisitionBatch>) => {
    try {
      const updated = await batchApi.updateBatch(id, data);
      setBatches(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b));
      if (currentBatch?.id === id) setCurrentBatch(prev => prev ? { ...prev, ...updated } : prev);
      showToast('Batch updated successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update batch', 'error');
    }
  };

  const handleDeleteBatch = (batch: AcquisitionBatch) => {
    triggerDelete(
      `Batch "${batch.name}"`,
      async () => {
        try {
          await batchApi.deleteBatch(batch.id);
          if (currentBatch?.id === batch.id) setCurrentBatch(null);
        } catch (error: any) {
          setBatches(prev => [...prev, batch]);
          showToast(error.message || 'Failed to delete batch', 'error');
        }
      },
      () => {
        setBatches(prev => [...prev, batch]);
        showToast('Batch restoration undone', 'success');
      }
    );

    // Optimistic delete
    setBatches(prev => prev.filter(b => b.id !== batch.id));
  };

  const handleViewAudit = async (id: number) => {
    setLoading(true);
    try {
      await batchApi.touchBatch(id);
      const history = await batchApi.getBatchHistory(id);
      const batch = batches.find(b => b.id === id);
      if (batch) {
        setAuditBatch({ ...batch, history });
      }
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to load audit trail', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: 'CLOSE' | 'CONTINUE' | 'REOPEN') => {
    if (selectedBatchIds.size === 0) return;
    try {
      const status = (action === 'CLOSE' ? 'closed' : 'open') as 'open' | 'closed';
      await Promise.all(Array.from<number>(selectedBatchIds).map(id => batchApi.updateBatch(id, { status })));
      showToast(`Successfully updated ${selectedBatchIds.size} batches`, 'success');
      setSelectedBatchIds(new Set());
      loadData();
    } catch (err: any) {
      showToast('Failed to update batches', 'error');
    }
  };

  const updateBatchStatus = async (id: number, status: 'open' | 'closed') => {
    try {
      await batchApi.updateBatch(id, { status });
      showToast(`Batch ${status === 'open' ? 'reopened' : 'closed'} successfully`, 'success');
      loadData();
    } catch (err: any) {
      showToast('Failed to update batch status', 'error');
    }
  };

  const handleViewBatchBooks = async (id: number) => {
    setLoading(true);
    try {
      await batchApi.touchBatch(id);
      // Immediately set ref to prevent auto-refresh race conditions
      currentBatchIdRef.current = id;
      // Reset book-level filters so stale search/category doesn't carry over to a different batch
      setSearchQuery('');
      setSelectedCategory('All');
      setCurrentPage(1);
      const fullBatch = await batchApi.getBatchById(id);
      setCurrentBatch(fullBatch);
      loadData();
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

    // Optimistically remove immediately — keeps UI live
    setCurrentBatch(prev => prev ? {
      ...prev,
      books: (prev.books || []).filter(b => b.id !== bookId),
      book_count: Math.max(0, (prev.book_count || 0) - 1)
    } : prev);

    triggerDelete(
      bookToDelete.title,
      async () => {
        // Actual API delete after 3s
        try {
          await batchApi.deleteBook(currentBatch.id, bookId);
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
        // Undo: restore book to local state
        setCurrentBatch(prev => prev ? {
          ...prev,
          books: [...(prev.books || []), bookToDelete],
          book_count: (prev.book_count || 0) + 1
        } : prev);
        showToast('Deletion undone', 'success');
      }
    );
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

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = filteredBooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory, currentBatch?.id]);

  // Batches sorted ascending for View All modal
  const batchesAscending = [...batches].sort((a, b) => new Date(a.opened_at).getTime() - new Date(b.opened_at).getTime());
  const sortedRecentBatches = [...batches].sort((a, b) => new Date(b.last_interacted_at || b.opened_at).getTime() - new Date(a.last_interacted_at || a.opened_at).getTime());

  if (loading && batches.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center' }}><RefreshCw className="animate-spin" /> Loading...</div>;
  }

  return (
    <>
      <div className="admin-content__header mb-6 relative">
        <div className="pr-36">
          <h1>Newly Acquired Books</h1>
          <p className="mt-1">Manage batches of new acquisitions. Only one batch can be actively displayed to the public at a time.</p>
        </div>
        <div className="absolute top-0 right-0">
          <button
            className="admin-btn admin-btn--primary whitespace-nowrap"
            onClick={() => setIsCreateBatchOpen(true)}
          >
            <Plus size={16} /> New Batch
          </button>
        </div>
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
      </div>

      {/* Batch Cards Section */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Recent Batches</h2>
          <button
            className="admin-btn admin-btn--secondary"
            style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setViewAllOpen(true)}
          >
            <ListOrdered size={15} /> View All ({batches.length})
          </button>
        </div>
        <div
          ref={recentBatchesRef}
          onMouseDown={onMouseDownBatches}
          onMouseLeave={onMouseLeaveBatches}
          onMouseUp={onMouseUpBatches}
          onMouseMove={onMouseMoveBatches}
          style={{
            display: 'flex',
            overflowX: 'auto',
            gap: 16,
            paddingBottom: 8,
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            cursor: 'grab'
          }}
          className="custom-scrollbar"
        >
          {sortedRecentBatches.slice(0, 7).map((batch) => (
            <div key={batch.id} style={{ minWidth: 300, flex: '0 0 auto', scrollSnapAlign: 'start' }}>
              <BatchCard
                batch={batch}
                onContinue={() => handleViewBatchBooks(batch.id)}
                onClose={(id) => handleBatchAction('close', id)}
                onArchive={(id) => handleBatchAction('archive', id)}
                onReopen={(id) => handleBatchAction('reopen', id)}
                onActivate={(id) => handleBatchAction('activate', id)}
                onViewBooks={handleViewBatchBooks}
                onViewAudit={(b) => setAuditBatch(b)}
                onEdit={(b) => setEditBatch(b)}
                onDelete={handleDeleteBatch}
              />
            </div>
          ))}
          {batches.length === 0 && (
            <div style={{ color: 'var(--color-gray-500)', width: '100%' }}>No batches found. Create one to get started.</div>
          )}
        </div>
      </div>

      {/* Current Selected Batch Books Section */}
      {currentBatch && (
        <div className="admin-table-wrapper" style={{ marginTop: 32 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-surface-container-highest)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              <button className={`admin-btn admin-btn--icon`} onClick={() => setViewMode('grid')} style={viewMode === 'grid' ? { background: 'var(--color-navy)', color: 'var(--color-white)' } : {}}>
                <LayoutGrid size={16} />
              </button>
              <button className={`admin-btn admin-btn--icon`} onClick={() => setViewMode('table')} style={viewMode === 'table' ? { background: 'var(--color-navy)', color: 'var(--color-white)' } : {}}>
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
                  {paginatedBooks.map((book) => (
                    <tr key={book.id}>
                      <td style={{ fontWeight: 500 }}>{book.title}</td>
                      <td>{book.author}</td>
                      <td style={{ fontFamily: 'monospace' }}>{book.accession_number || 'N/A'}</td>
                      <td><span className="admin-badge admin-badge--info">{book.category}</span></td>
                      <td style={{ color: 'var(--color-gray-500)' }}>{new Date(book.date_encoded).toLocaleDateString()}</td>
                      <td>
                        <div className="admin-table__actions">
                          <button className="admin-btn admin-btn--icon" onClick={() => { setEditingBook(book); setIsBookFormOpen(true); }}><Pencil size={15} /></button>
                          <button className="admin-btn admin-btn--icon" style={{ color: 'var(--color-red-600)' }} onClick={() => handleDeleteBook(book.id)}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredBooks.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--color-gray-500)' }}>No books in this batch match the filter.</td></tr>
                  )}
                </tbody>
              </table>
              {filteredBooks.length > itemsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredBooks.length}
                  itemsPerPage={itemsPerPage}
                />
              )}
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="admin-card-grid" style={{ padding: 20 }}>
              {paginatedBooks.map((book) => (
                <div className="admin-grid-card relative" key={book.id}>
                  {/* Kebab Menu */}
                  <div className="absolute top-2 right-2 z-10">
                    <div className="relative inline-block text-left">
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveBookDropdown(activeBookDropdown === book.id ? null : book.id); }}
                        className="p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-600 shadow-sm transition-colors border border-gray-100 cursor-pointer"
                        aria-label="Book actions"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeBookDropdown === book.id && (
                        <>
                          <div className="fixed inset-0 z-[9999] animate-modal-overlay" onClick={(e) => { e.stopPropagation(); setActiveBookDropdown(null); }}></div>
                          <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-100 z-[10000] py-1 animate-modal-card" onClick={e => e.stopPropagation()}>
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer border-none bg-transparent"
                              onClick={() => { setEditingBook(book); setIsBookFormOpen(true); setActiveBookDropdown(null); }}
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer border-none bg-transparent"
                              onClick={() => { handleDeleteBook(book.id); setActiveBookDropdown(null); }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ height: 140, background: 'var(--color-gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                    {book.cover_image ? (
                      <img src={book.cover_image} alt={book.title} style={{ height: '100%', objectFit: 'contain', borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
                    ) : (
                      <BookOpen size={40} color='var(--color-gray-400)' />
                    )}
                  </div>
                  <div className="admin-grid-card__body">
                    <div className="admin-grid-card__title">{book.title}</div>
                    <div className="admin-grid-card__meta">{book.author}</div>
                    <div style={{ marginTop: 8 }}><span className="admin-badge admin-badge--info">{book.category}</span></div>
                  </div>
                </div>
              ))}
              {filteredBooks.length > itemsPerPage && (
                <div className="col-span-full">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredBooks.length}
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              )}
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

      <EditBatchModal
        isOpen={!!editBatch}
        batch={editBatch}
        onClose={() => setEditBatch(null)}
        onSubmit={handleEditBatch}
      />

      <BookFormModal
        isOpen={isBookFormOpen}
        onClose={() => { setIsBookFormOpen(false); setEditingBook(undefined); }}
        onSubmit={handleAddOrUpdateBook}
        initialData={editingBook}
      />

      {/* View All Batches Modal */}
      {viewAllOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-modal-overlay z-[9999]" onClick={() => setViewAllOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden animate-modal-card" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><BookOpen size={20} className="text-navy" /> All Batches ({batches.length})</h2>
              <div className="flex items-center gap-4">
                <button
                  className="admin-btn admin-btn--primary flex items-center gap-1.5"
                  onClick={() => { setViewAllOpen(false); setIsCreateBatchOpen(true); }}
                  style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                >
                  <Plus size={16} /> New Batch
                </button>
                <button onClick={() => setViewAllOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={20} /></button>
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex gap-2 items-center">
              <span className="text-sm text-gray-600 font-medium mr-2">Bulk Actions:</span>
              <button
                onClick={() => handleBulkAction('CLOSE')}
                disabled={selectedBatchIds.size === 0}
                className="admin-btn admin-btn--secondary disabled:opacity-50"
                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
              >
                Close Selected
              </button>
              <button
                onClick={() => handleBulkAction('CONTINUE')}
                disabled={selectedBatchIds.size === 0}
                className="admin-btn admin-btn--primary disabled:opacity-50"
                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
              >
                Continue / Reopen Selected
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="admin-table w-full text-left">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) setSelectedBatchIds(new Set(batchesAscending.map(b => b.id)));
                          else setSelectedBatchIds(new Set());
                        }}
                        checked={selectedBatchIds.size > 0 && selectedBatchIds.size === batchesAscending.length}
                        className="rounded border-gray-300 text-blue-600"
                      />
                    </th>
                    <th>#</th>
                    <th>Batch Name</th>
                    <th>Status</th>
                    <th>Books</th>
                    <th>Opened</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batchesAscending.map((b, idx) => (
                    <tr key={b.id} className={selectedBatchIds.has(b.id) ? 'bg-blue-50/50' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedBatchIds.has(b.id)}
                          onChange={(e) => {
                            const next = new Set(selectedBatchIds);
                            if (e.target.checked) next.add(b.id);
                            else next.delete(b.id);
                            setSelectedBatchIds(next);
                          }}
                          className="rounded border-gray-300 text-blue-600"
                        />
                      </td>
                      <td style={{ color: 'var(--color-gray-400)', fontSize: '0.75rem' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 500 }}>{b.name}</td>
                      <td><span className={`admin-badge admin-badge--${b.status === 'open' ? 'info' : b.status === 'closed' ? 'success' : 'warning'}`}>{b.status.toUpperCase()}</span></td>
                      <td>{b.book_count || 0}</td>
                      <td style={{ color: 'var(--color-gray-500)', fontSize: '0.85rem' }}>{new Date(b.opened_at).toLocaleDateString()}</td>
                      <td className="text-right">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === b.id ? null : b.id); }}
                            className="p-1 rounded hover:bg-gray-100 text-gray-500"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {activeDropdown === b.id && (
                            <>
                              <div className="fixed inset-0 z-[9999] bg-transparent" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }}></div>
                              <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-100 z-[10000] py-1" onClick={e => e.stopPropagation()}>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  onClick={() => { setViewAllOpen(false); handleViewBatchBooks(b.id); setActiveDropdown(null); }}
                                >
                                  View Books
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  onClick={() => { handleViewAudit(b.id); setActiveDropdown(null); }}
                                >
                                  View Audit
                                </button>
                                {b.status === 'open' ? (
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    onClick={() => { updateBatchStatus(b.id, 'closed'); setActiveDropdown(null); }}
                                  >
                                    Close Batch
                                  </button>
                                ) : (
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                    onClick={() => { updateBatchStatus(b.id, 'open'); setActiveDropdown(null); }}
                                  >
                                    {b.status === 'closed' ? 'Reopen' : 'Continue'}
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {batches.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--color-gray-400)' }}>No batches yet.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setViewAllOpen(false)} className="admin-btn admin-btn--secondary">Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Audit Modal */}
      {auditBatch && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center ] p-4 animate-modal-overlay z-[9999]" onClick={() => setAuditBatch(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-modal-card" onClick={(e) => e.stopPropagation()}>
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
        </div>,
        document.body
      )}

      <UndoDeleteToast
        undoState={undoState}
        onUndo={cancelDelete}
        onExecuteNow={executeNow}
      />
    </>
  );
}
