import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';

interface BookModalItem {
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

interface BookListModalProps {
  books: BookModalItem[];
  isOpen: boolean;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 30;

export const BookListModal: React.FC<BookListModalProps> = ({ books, isOpen, onClose }) => {
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [selectedBook, setSelectedBook] = useState<BookModalItem | null>(null);

  const totalPages = Math.max(1, Math.ceil(books.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);

  const pageItems = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return books.slice(start, start + ITEMS_PER_PAGE);
  }, [books, currentPage]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 ] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-modal-overlay z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden animate-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-headline-md text-lg font-bold text-primary">All Books</h2>
          <div className="flex items-center gap-2">
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

        <div className="flex-1 overflow-y-auto p-6 relative">
          {viewMode === 'card' ? (
            <div className="grid gap-3">
              {pageItems.map((book, idx) => (
                <div
                  key={currentPage * ITEMS_PER_PAGE + idx}
                  className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => setSelectedBook(book)}
                >
                  {book.image ? (
                    <div className="w-12 h-12 flex-shrink-0 mt-0.5 rounded-lg overflow-hidden">
                      <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                    </div>
                  ) : book.icon ? (
                    <span className="material-symbols-outlined text-2xl text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      {book.icon}
                    </span>
                  ) : null}
                  <div>
                    <h3 className="font-headline-md font-bold text-sm text-primary group-hover:text-gold-dark transition-colors">{book.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{book.description}</p>
                  </div>
                </div>
              ))}
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
                    const realIdx = currentPage * ITEMS_PER_PAGE + idx + 1;
                    return (
                      <tr 
                        key={realIdx} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedBook(book)}
                      >
                        <td className="py-3 px-3 text-gray-400 text-xs">{realIdx}</td>
                        <td className="py-3 px-3">
                          {book.image ? (
                            <img src={book.image} alt={book.title} className="w-8 h-8 object-cover rounded" />
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
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-transparent"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
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
                  <img src={selectedBook.image} alt={selectedBook.title} className="w-full h-full object-cover" />
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
