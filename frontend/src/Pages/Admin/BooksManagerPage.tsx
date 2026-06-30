import { useState, useEffect } from 'react';
import { BookOpen, Plus, Tag, RefreshCw, LayoutGrid, List, Eye, Pencil, Trash2 } from 'lucide-react';
import { MetricCard } from '@/src/Features/Admin/components/MetricCard';
import { batchApi, AcquisitionBatch, BatchBook } from '@/src/Endpoints/batchApi';
import { BatchCard } from '@/src/Features/Admin/components/BatchCard';
import { CreateBatchModal } from '@/src/Features/Admin/components/CreateBatchModal';
import { BookFormModal } from '@/src/Features/Admin/components/BookFormModal';

type ViewMode = 'table' | 'grid';

export default function BooksManagerPage() {
  const [batches, setBatches] = useState<AcquisitionBatch[]>([]);
  const [currentBatch, setCurrentBatch] = useState<AcquisitionBatch | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [isBookFormOpen, setIsBookFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BatchBook | undefined>(undefined);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  const handleCreateBatch = async (data: Partial<AcquisitionBatch>) => {
    try {
      const newBatch = await batchApi.createBatch(data);
      setIsCreateBatchOpen(false);
      // reload to get fresh data
      loadData();
    } catch (error) {
      alert('Failed to create batch');
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
      loadData();
    } catch (error) {
      alert(`Failed to ${action} batch`);
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
    try {
      if (editingBook) {
        // TODO: implement update API
        alert('Update not fully implemented in API yet, skipping...');
      } else {
        await batchApi.addBookToBatch(currentBatch.id, data);
      }
      setIsBookFormOpen(false);
      setEditingBook(undefined);
      handleViewBatchBooks(currentBatch.id); // reload current batch books
    } catch (error) {
      alert('Failed to save book');
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!currentBatch) return;
    if (confirm('Are you sure you want to remove this book from the batch?')) {
      try {
        await batchApi.deleteBook(currentBatch.id, bookId);
        handleViewBatchBooks(currentBatch.id);
      } catch (error) {
        alert('Failed to delete book');
      }
    }
  };

  // Derived state for filtering
  const displayBooks = currentBatch?.books || [];
  const filteredBooks = displayBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.accession_number && book.accession_number.toLowerCase().includes(searchQuery.toLowerCase()));
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
    </>
  );
}
