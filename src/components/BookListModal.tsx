import React, { useState, useMemo } from 'react';

interface BookModalItem {
  title: string;
  description: string;
  icon?: string;
}

interface BookListModalProps {
  books: BookModalItem[];
  isOpen: boolean;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 30;

export const BookListModal: React.FC<BookListModalProps> = ({ books, isOpen, onClose }) => {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(books.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);

  const pageItems = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return books.slice(start, start + ITEMS_PER_PAGE);
  }, [books, currentPage]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-headline-md text-lg font-bold text-primary">All Books</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer bg-transparent border-none"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-3">
            {pageItems.map((book, idx) => (
              <div
                key={currentPage * ITEMS_PER_PAGE + idx}
                className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100"
              >
                {book.icon && (
                  <span className="material-symbols-outlined text-2xl text-primary flex-shrink-0 mt-0.5">
                    {book.icon}
                  </span>
                )}
                <div>
                  <h3 className="font-headline-md font-bold text-sm text-primary">{book.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{book.description}</p>
                </div>
              </div>
            ))}
          </div>
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
      </div>
    </div>
  );
};
