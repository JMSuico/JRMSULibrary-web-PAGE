import { useState, useMemo, useCallback, useEffect } from 'react';

export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100] as const;

export interface UsePaginationOptions<T> {
  items: T[];
  initialPage?: number;
  pageSize?: number;
  storageKey?: string;
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
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canNextPage: boolean;
  canPrevPage: boolean;
}

function readStoredPageSize(storageKey: string | undefined, fallback: number): number {
  if (!storageKey || typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return fallback;
    const parsed = Number(raw);
    if (
      Number.isFinite(parsed) &&
      parsed > 0 &&
      (PAGE_SIZE_OPTIONS as readonly number[]).includes(parsed)
    ) {
      return parsed;
    }
  } catch {
    // Ignore storage access errors (private mode / blocked storage)
  }
  return fallback;
}

/**
 * GLOBAL CALLING HOOK: usePagination
 * Universal table and list pagination calculation hook.
 * Handles slice math, page size selection/persistence, page clamping, and windowed page numbers.
 */
export function usePagination<T>({
  items,
  initialPage = 1,
  pageSize: initialPageSize = 10,
  storageKey,
}: UsePaginationOptions<T>): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageSizeState, setPageSizeState] = useState<number>(() =>
    readStoredPageSize(storageKey, initialPageSize),
  );

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSizeState));

  const safePage = totalItems === 0 ? 1 : Math.min(Math.max(1, currentPage), totalPages);

  // Clamp currentPage after render if totalItems or pageSize shrinks
  useEffect(() => {
    if (safePage !== currentPage && totalItems > 0) {
      setCurrentPage(safePage);
    }
  }, [safePage, currentPage, totalItems]);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSizeState + 1;
  const endItem = Math.min(safePage * pageSizeState, totalItems);

  const paginatedItems = useMemo(() => {
    const startIndex = (safePage - 1) * pageSizeState;
    return items.slice(startIndex, startIndex + pageSizeState);
  }, [items, safePage, pageSizeState]);

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

  const setPageSize = useCallback(
    (size: number) => {
      if (!Number.isFinite(size) || size <= 0) return;
      setPageSizeState(size);
      setCurrentPage(1);
      if (storageKey && typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(storageKey, String(size));
        } catch {
          // Ignore storage write errors
        }
      }
    },
    [storageKey],
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
    pageSize: pageSizeState,
    totalItems,
    startItem,
    endItem,
    pageNumbers,
    paginatedItems,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    canNextPage: safePage < totalPages,
    canPrevPage: safePage > 1,
  };
}
