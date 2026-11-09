import { useState, useMemo, useCallback } from 'react';

export interface UsePaginationOptions<T> {
  items: T[];
  initialPage?: number;
  pageSize?: number;
}

export interface UsePaginationResult<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  startItem: number;
  endItem: number;
  pageNumbers: number[];
  paginatedItems: T[];
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canNextPage: boolean;
  canPrevPage: boolean;
}

/**
 * GLOBAL CALLING HOOK: usePagination
 * Universal table and list pagination calculation hook.
 * Handles slice math, page clamping, and windowed page numbers.
 */
export function usePagination<T>({
  items,
  initialPage = 1,
  pageSize = 10,
}: UsePaginationOptions<T>): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Auto-clamp page if items shrink
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  if (safePage !== currentPage && totalItems > 0) {
    setCurrentPage(safePage);
  }

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  const paginatedItems = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }, [items, safePage, pageSize]);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, safePage - 2);
      let end = Math.min(totalPages, safePage + 2);

      if (safePage <= 3) {
        end = 5;
      } else if (safePage >= totalPages - 2) {
        start = totalPages - 4;
      }

      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  }, [safePage, totalPages]);

  const setPage = useCallback(
    (page: number) => {
      const target = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(target);
    },
    [totalPages],
  );

  const nextPage = useCallback(() => {
    setPage(safePage + 1);
  }, [safePage, setPage]);

  const prevPage = useCallback(() => {
    setPage(safePage - 1);
  }, [safePage, setPage]);

  return {
    currentPage: safePage,
    totalPages,
    pageSize,
    totalItems,
    startItem,
    endItem,
    pageNumbers,
    paginatedItems,
    setPage,
    nextPage,
    prevPage,
    canNextPage: safePage < totalPages,
    canPrevPage: safePage > 1,
  };
}
