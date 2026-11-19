import React, { useState, useMemo, useRef } from 'react';
import { getImageUrl } from '@/src/Libs/apiClient';
import { createPortal } from 'react-dom';
import { usePagination, usePersistentState, useScrollRestoration } from '@/src/Hooks';

interface BookModalItem {
  id?: number | string;
  title: string;
  description: string;
  category?: string;
  icon?: string;
  image?: string;
}

interface BookListModalProps {
  books: BookModalItem[];
  isOpen: boolean;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 30;

const isStringValue = (value: unknown): value is string => typeof value === 'string';
const isViewMode = (value: unknown): value is 'card' | 'table' =>
  value === 'card' || value === 'table';

export const BookListModal: React.FC<BookListModalProps> = ({ books, isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = usePersistentState<string>(
    'public:bookListModal:search',
    '',
    { validate: isStringValue },
  );
  const [categoryFilter, setCategoryFilter] = usePersistentState<string>(
    'public:bookListModal:category',
    'All',
    { validate: isStringValue },
  );
  const [viewMode, setViewMode] = usePersistentState<'card' | 'table'>(
    'public:bookListModal:viewMode',
    'card',
    { validate: isViewMode },
  );
  const [selectedBook, setSelectedBook] = useState<BookModalItem | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    books.forEach((book) => {
      if (book.category) set.add(book.category);
    });
    return ['All', ...Array.from(set).sort()];
  }, [books]);

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return books.filter((book) => {
      const matchesCategory =
        categoryFilter === 'All' || !book.category || book.category === categoryFilter;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        book.title.toLowerCase().includes(q) ||
        book.description.toLowerCase().includes(q) ||
        (book.category ? book.category.toLowerCase().includes(q) : false)
      );
    });
  }, [books, searchQuery, categoryFilter]);

  const {
    currentPage,
    totalPages,
    paginatedItems: pageItems,
    setPage,
    prevPage,
    nextPage,
    canPrevPage,
    canNextPage,
  } = usePagination<BookModalItem>({
    items: filteredBooks,
    pageSize: ITEMS_PER_PAGE,
    pageStorageKey: 'public:bookListModal:page',
    pageStorageKind: 'session',
  });

  const { setLastAnchorId, highlightedId } = useScrollRestoration({
    storageKey: 'public:bookListModal',
    isReady: isOpen && books.length > 0,
    containerRef,
  });

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-modal-overlay z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden animate-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-200">
          <h2 className="font-headline-md text-lg font-bold text-primary">All Books</h2>
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <div className="relative">
              <span className="material-symbols-outlined text-base text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search books..."
                aria-label="Search books"
                className="pl-8 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-44 sm:w-56"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPage(1);
                  }}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none p-0"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>
            {categories.length > 1 && (
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by category"
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            )}
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none ${
                  viewMode === 'card' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
                aria-label="Card view"
              >
                <span className="material-symbols-outlined text-base align-middle">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none ${
                  viewMode === 'table' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
                aria-label="Table view"
              >
                <span className="material-symbols-outlined text-base align-middle">table_rows</span>
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer bg-transparent border-none"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
        </div>

        <div ref={containerRef} className="flex-1 overflow-y-auto p-6 relative">
          {pageItems.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm">
              No books match your filters.
            </div>
          ) : viewMode === 'card' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pageItems.map((book, idx) => {
                const realIdx = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                const anchorId = String(book.id ?? `${book.title}-${realIdx}`);
                const isHighlighted = highlightedId === anchorId;
                return (
                  <div
                    key={anchorId}
                    data-cache-anchor-id={anchorId}
                    className={`flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-white border cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group ${
                      isHighlighted ? 'border-gold-light ring-2 ring-gold-light/60' : 'border-gray-200'
                    }`}
                    onClick={() => {
                      setLastAnchorId(anchorId);
                      setSelectedBook(book);
                    }}
                  >
                    {book.image ? (
                      <div className="w-32 h-40 rounded-lg overflow-hidden shadow-md">
                        <img src={getImageUrl(book.image)} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/book-placeholder.png'; }} />
                      </div>
                    ) : book.icon ? (
                      <span className="material-symbols-outlined text-[64px] text-primary group-hover:scale-110 transition-transform duration-500">
                        {book.icon}
                      </span>
                    ) : null}
                    <div>
                      <h3 className="font-headline-md font-bold text-lg text-primary group-hover:text-gold-dark transition-colors line-clamp-2">{book.title}</h3>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-3">{book.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs uppercase tracking-wider w-10">#</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs uppercase tracking-wider w-14">Image</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs uppercase tracking-wider">Title</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((book, idx) => {
                    const realIdx = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                    const anchorId = String(book.id ?? `${book.title}-${realIdx}`);
                    const isHighlighted = highlightedId === anchorId;
                    return (
                      <tr
                        key={anchorId}
                        data-cache-anchor-id={anchorId}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                          isHighlighted ? 'bg-gold-light/15' : ''
                        }`}
                        onClick={() => {
                          setLastAnchorId(anchorId);
                          setSelectedBook(book);
                        }}
                      >
                        <td className="py-3 px-3 text-gray-400 text-xs">{realIdx}</td>
                        <td className="py-3 px-3">
                          {book.image ? (
                            <img src={getImageUrl(book.image)} alt={book.title} className="w-8 h-8 object-cover rounded" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/book-placeholder.png'; }} />
                          ) : book.icon ? (
                            <span className="material-symbols-outlined text-lg text-primary">{book.icon}</span>
                          ) : null}
                        </td>
                        <td className="py-3 px-3 font-medium text-primary">{book.title}</td>
                        <td className="py-3 px-3 text-gray-500 text-xs hidden md:table-cell">{book.description}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <button
              onClick={prevPage}
              disabled={!canPrevPage}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-transparent"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={!canNextPage}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-transparent"
            >
              Next
            </button>
          </div>
        )}

        {/* Lightbox Overlay */}
        {selectedBook && (
          <div 
            className="fixed inset-0 ] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-modal-overlay z-[9999]" 
            onClick={() => setSelectedBook(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white hover:text-gold-light transition-colors z-[210] cursor-pointer"
              onClick={() => setSelectedBook(null)}
              aria-label="Close enlarged view"
            >
              <span className="material-symbols-outlined text-4xl">close</span>
            </button>
            <div 
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center flex flex-col items-center animate-modal-card" 
              onClick={(e) => e.stopPropagation()}
            >
              {selectedBook.image ? (
                <div className="w-48 h-64 mb-6 rounded-lg overflow-hidden shadow-lg mx-auto">
                  <img src={getImageUrl(selectedBook.image)} alt={selectedBook.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/book-placeholder.png'; }} />
                </div>
              ) : selectedBook.icon ? (
                <span className="material-symbols-outlined text-[120px] text-primary mb-6">{selectedBook.icon}</span>
              ) : null}
              <h3 className="font-headline-lg font-bold text-2xl text-primary mb-4">{selectedBook.title}</h3>
              <p className="text-gray-600 text-lg">{selectedBook.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
