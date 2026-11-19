import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { getImageUrl, getThumbnailUrl } from '@/src/Libs/apiClient';
import { createPortal } from 'react-dom';
import { BookOpen, Plus, Tag, RefreshCw, LayoutGrid, List, Pencil, Trash2, X, ListOrdered, MoreVertical } from 'lucide-react';
import { MetricCard } from '@/src/Features/Admin/components/MetricCard';
import { batchApi, AcquisitionBatch, BatchBook } from '@/src/Endpoints/batchApi';
import { BatchCard } from '@/src/Features/Admin/components/BatchCard';
import { CreateBatchModal } from '@/src/Features/Admin/components/CreateBatchModal';
import { EditBatchModal } from '@/src/Features/Admin/components/EditBatchModal';
import { UndoDeleteToast } from '@/src/Components/Shared/UndoDeleteToast';
import { BookFormModal } from '@/src/Features/Admin/components/BookFormModal';
import { ScrollableSelect, type ScrollableSelectOption } from '@/src/Components/Shared/ScrollableSelect';
import { useToast } from '@/src/Hooks/useToast';
import { useCachedQuery, revalidateCacheByPrefix } from '@/src/Hooks/useCachedQuery';
import { useDebounce } from '@/src/Hooks/useDebounce';
import { useUndoDelete } from '@/src/Hooks/useUndoDelete';
import { Pagination } from '@/src/Components/Shared/Pagination';
import { usePersistentState, useScrollRestoration, usePagination } from '@/src/Hooks';
import { PAGE_SIZE_OPTIONS, findPageForItemIndex } from '@/src/Hooks/usePagination';
import { processInChunks } from '@/src/Libs/chunkUtils';

type ViewMode = 'table' | 'grid';

const isNullableNumber = (value: unknown): value is number | null =>
  value === null || (typeof value === 'number' && Number.isFinite(value));

const isViewMode = (value: unknown): value is ViewMode =>
  value === 'table' || value === 'grid';

const isString = (value: unknown): value is string =>
  typeof value === 'string';

export function BooksManager() {
  const [selectedBatchId, setSelectedBatchId] = usePersistentState<number | null>(
    'admin:books:selectedBatchId',
    null,
    { validate: isNullableNumber },
  );
  const [actionLoading, setActionLoading] = useState(false);

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
  const [selectedBookIds, setSelectedBookIds] = useState<Set<number>>(new Set());
  const [isRemoving, setIsRemoving] = useState(false);

  // View state
  const [viewMode, setViewMode] = usePersistentState<ViewMode>(
    'admin:books:viewMode',
    'table',
    { validate: isViewMode },
  );
  const [searchQuery, setSearchQuery] = usePersistentState<string>(
    'admin:books:search',
    '',
    { validate: isString },
  );
  const [selectedCategory, setSelectedCategory] = usePersistentState<string>(
    'admin:books:category',
    'All',
    { validate: isString },
  );

  const { showToast, removeToast } = useToast();
  const { undoState, triggerDelete, cancelDelete, executeNow } = useUndoDelete();

  const {
    data: cachedBatches,
    isLoading: batchesLoading,
    refetch: refetchBatches,
    mutate: mutateBatches,
  } = useCachedQuery<AcquisitionBatch[]>({
    key: 'admin:batches',
    fetcher: () => batchApi.getAllBatches(),
    staleTimeMs: 30_000,
    persistStorage: true,
    listenCmsUpdate: false,
  });

  const batches = cachedBatches ?? [];
  const batchesRef = useRef<AcquisitionBatch[]>(batches);
  batchesRef.current = batches;
  const lastValidBatchIdRef = useRef<number | null>(selectedBatchId);

  const effectiveBatchId = useMemo(() => {
    if (selectedBatchId !== null && batches.some((b) => b.id === selectedBatchId)) {
      lastValidBatchIdRef.current = selectedBatchId;
      return selectedBatchId;
    }
    const displayBatch = batches.find((b) => b.is_display_batch);
    const openBatch = batches.find((b) => b.status === 'open');
    const resolved = openBatch?.id ?? displayBatch?.id ?? (batches.length > 0 ? batches[0].id : null);
    if (resolved !== null) {
      lastValidBatchIdRef.current = resolved;
      return resolved;
    }
    if ((batchesLoading || cachedBatches === undefined) && lastValidBatchIdRef.current !== null) {
      return lastValidBatchIdRef.current;
    }
    lastValidBatchIdRef.current = null;
    return null;
  }, [batches, batchesLoading, cachedBatches, selectedBatchId]);

  const {
    data: currentBatchData,
    isLoading: currentBatchLoading,
    refetch: refetchCurrentBatch,
    mutate: mutateCurrentBatch,
  } = useCachedQuery<AcquisitionBatch | null>({
    key: effectiveBatchId !== null ? `admin:batch:${effectiveBatchId}` : 'admin:batch:none',
    fetcher: () => (effectiveBatchId !== null ? batchApi.getBatchById(effectiveBatchId) : Promise.resolve(null)),
    enabled: effectiveBatchId !== null,
    staleTimeMs: 30_000,
    persistStorage: effectiveBatchId !== null,
    listenCmsUpdate: false,
  });

  const currentBatch = effectiveBatchId !== null ? (currentBatchData ?? null) : null;
  const currentBatchRef = useRef<AcquisitionBatch | null>(currentBatch);
  currentBatchRef.current = currentBatch;

  // Mouse Drag to Scroll for Recent Batches
  const recentBatchesRef = useRef<HTMLDivElement>(null);
  const {
    captureNow,
    restoreNow,
    highlightedId,
    setLastAnchorId,
  } = useScrollRestoration({
    storageKey: 'admin:books',
    isReady: !batchesLoading && !currentBatchLoading && !actionLoading,
    horizontalRef: recentBatchesRef,
  });

  const isBookFormOpenRef = useRef<boolean>(isBookFormOpen);
  isBookFormOpenRef.current = isBookFormOpen;
  const wasBookFormOpenRef = useRef<boolean>(isBookFormOpen);
  const isSavingBookRef = useRef<boolean>(false);
  const pendingRemoteSyncRef = useRef<boolean>(false);
  const isSyncingRemoteRef = useRef<boolean>(false);
  const lastLocalSaveAtRef = useRef<number>(0);
  const lastSavedBookIdRef = useRef<number | null>(null);
  const pendingScrollBookIdRef = useRef<number | null>(null);

  const effectiveBatchIdRef = useRef<number | null>(effectiveBatchId);
  effectiveBatchIdRef.current = effectiveBatchId;
  const refetchBatchesRef = useRef(refetchBatches);
  refetchBatchesRef.current = refetchBatches;
  const refetchCurrentBatchRef = useRef(refetchCurrentBatch);
  refetchCurrentBatchRef.current = refetchCurrentBatch;
  const captureNowRef = useRef(captureNow);
  captureNowRef.current = captureNow;
  const restoreNowRef = useRef(restoreNow);
  restoreNowRef.current = restoreNow;

  const syncRemoteUpdate = useCallback(async (overrideAnchorId?: string | number | null) => {
    if (isSyncingRemoteRef.current) {
      pendingRemoteSyncRef.current = true;
      return;
    }
    isSyncingRemoteRef.current = true;
    try {
      captureNowRef.current(overrideAnchorId);
      await Promise.all([
        refetchBatchesRef.current(),
        effectiveBatchIdRef.current !== null ? refetchCurrentBatchRef.current() : Promise.resolve(),
      ]);
      if (typeof overrideAnchorId === 'number') {
        pendingScrollBookIdRef.current = overrideAnchorId;
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (
            typeof overrideAnchorId === 'number' &&
            pendingScrollBookIdRef.current === overrideAnchorId
          ) {
            pendingScrollBookIdRef.current = null;
          }
          restoreNowRef.current(overrideAnchorId);
        });
      });
    } finally {
      isSyncingRemoteRef.current = false;
      if (pendingRemoteSyncRef.current && !isBookFormOpenRef.current && !isSavingBookRef.current) {
        pendingRemoteSyncRef.current = false;
        void syncRemoteUpdate();
      }
    }
  }, []);

  useEffect(() => {
    const handleCmsUpdated = () => {
      if (isBookFormOpenRef.current || isSavingBookRef.current) {
        pendingRemoteSyncRef.current = true;
        return;
      }
      if (Date.now() - lastLocalSaveAtRef.current < 1500) {
        return;
      }
      void syncRemoteUpdate();
    };

    window.addEventListener('cms_updated', handleCmsUpdated);
    return () => window.removeEventListener('cms_updated', handleCmsUpdated);
  }, [syncRemoteUpdate]);

  useEffect(() => {
    const wasOpen = wasBookFormOpenRef.current;
    wasBookFormOpenRef.current = isBookFormOpen;
    if (wasOpen && !isBookFormOpen && !isSavingBookRef.current) {
      const savedBookId = lastSavedBookIdRef.current;
      lastSavedBookIdRef.current = null;
      if (pendingRemoteSyncRef.current) {
        pendingRemoteSyncRef.current = false;
        void syncRemoteUpdate(savedBookId ?? undefined);
      }
    }
  }, [isBookFormOpen, syncRemoteUpdate]);
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

  const refreshAll = async () => {
    revalidateCacheByPrefix('admin:batch');
    revalidateCacheByPrefix('admin:dashboard');
    await Promise.all([refetchBatches(), effectiveBatchId !== null ? refetchCurrentBatch() : Promise.resolve()]);
  };

  const handleCreateBatch = async (data: Partial<AcquisitionBatch>) => {
    try {
      await batchApi.createBatch(data);
      setIsCreateBatchOpen(false);
      showToast('Batch created successfully', 'success');
      await refreshAll();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create batch';
      showToast(msg, 'error');
    }
  };

  const handleBatchAction = async (action: 'close' | 'archive' | 'activate' | 'reopen', id: number) => {
    try {
      switch (action) {
        case 'close':
          await batchApi.closeBatch(id);
          break;
        case 'archive':
          await batchApi.archiveBatch(id);
          break;
        case 'activate':
          await batchApi.activateBatch(id);
          break;
        case 'reopen':
          await batchApi.reopenBatch(id);
          break;
      }
      showToast(`Batch ${action}d successfully`, 'success');
      await refreshAll();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : `Failed to ${action} batch`;
      showToast(msg, 'error');
    }
  };

  const handleEditBatch = async (id: number, data: Partial<AcquisitionBatch>) => {
    try {
      const updated = await batchApi.updateBatch(id, data);
      mutateBatches(batchesRef.current.map((b) => (b.id === id ? { ...b, ...updated } : b)));
      if (currentBatchRef.current?.id === id) {
        mutateCurrentBatch({ ...currentBatchRef.current, ...updated });
      }
      revalidateCacheByPrefix('admin:batch');
      revalidateCacheByPrefix('admin:dashboard');
      showToast('Batch updated successfully', 'success');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update batch';
      showToast(msg, 'error');
    }
  };

  const handleDeleteBatch = (batch: AcquisitionBatch) => {
    triggerDelete(
      `Batch "${batch.name}"`,
      async () => {
        try {
          await batchApi.deleteBatch(batch.id);
          if (selectedBatchId === batch.id) setSelectedBatchId(null);
          revalidateCacheByPrefix('admin:batch');
          revalidateCacheByPrefix('admin:dashboard');
        } catch (error: unknown) {
          mutateBatches([...batchesRef.current, batch]);
          const msg = error instanceof Error ? error.message : 'Failed to delete batch';
          showToast(msg, 'error');
        }
      },
      () => {
        mutateBatches([...batchesRef.current, batch]);
        showToast('Batch restoration undone', 'success');
      },
    );

    // Optimistic delete
    mutateBatches(batchesRef.current.filter((b) => b.id !== batch.id));
  };

  const handleViewAudit = async (id: number) => {
    setActionLoading(true);
    try {
      await batchApi.touchBatch(id);
      const history = await batchApi.getBatchHistory(id);
      const batch = batchesRef.current.find((b) => b.id === id);
      if (batch) {
        setAuditBatch({ ...batch, history });
      }
      await refreshAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load audit trail';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (action: 'CLOSE' | 'CONTINUE' | 'REOPEN') => {
    if (selectedBatchIds.size === 0) return;
    try {
      const status = (action === 'CLOSE' ? 'closed' : 'open') as 'open' | 'closed';
      await Promise.all(Array.from<number>(selectedBatchIds).map((id) => batchApi.updateBatch(id, { status })));
      showToast(`Successfully updated ${selectedBatchIds.size} batches`, 'success');
      setSelectedBatchIds(new Set());
      await refreshAll();
    } catch {
      showToast('Failed to update batches', 'error');
    }
  };

  const updateBatchStatus = async (id: number, status: 'open' | 'closed') => {
    try {
      await batchApi.updateBatch(id, { status });
      showToast(`Batch ${status === 'open' ? 'reopened' : 'closed'} successfully`, 'success');
      await refreshAll();
    } catch {
      showToast('Failed to update batch status', 'error');
    }
  };

  const handleViewBatchBooks = async (id: number) => {
    setActionLoading(true);
    try {
      await batchApi.touchBatch(id);
      setLastAnchorId(null);
      setSelectedBatchId(id);
      // Reset book-level filters so stale search/category doesn't carry over to a different batch
      setSearchQuery('');
      setSelectedCategory('All');
      booksPagination.setPage(1);
      revalidateCacheByPrefix('admin:batch');
      await refetchBatches();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCategoriesChanged = async () => {
    captureNow(editingBook?.id ?? null);
    revalidateCacheByPrefix('admin:batch');
    revalidateCacheByPrefix('admin:batches');
    await Promise.all([
      refetchBatches(),
      effectiveBatchId !== null ? refetchCurrentBatch() : Promise.resolve(),
    ]);
    const anchorId = editingBook?.id ?? null;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        restoreNow(anchorId);
      });
    });
  };

  const handleAddOrUpdateBook = async (data: FormData) => {
    const activeBatch = currentBatchRef.current;
    if (!activeBatch) return;
    const targetEditingBook = editingBook;
    isSavingBookRef.current = true;
    try {
      captureNow(targetEditingBook?.id ?? null);
      let targetBookId: number;
      let nextBooks: BatchBook[];
      if (targetEditingBook) {
        const updatedBook = await batchApi.updateBook(activeBatch.id, targetEditingBook.id, data);
        targetBookId = updatedBook.id;
        setLastAnchorId(targetBookId);
        const latestBatch = currentBatchRef.current ?? activeBatch;
        nextBooks = (latestBatch.books || []).map((b) =>
          b.id === targetEditingBook.id ? updatedBook : b,
        );
        // Optimistic update: replace the edited book in cached state
        mutateCurrentBatch({
          ...latestBatch,
          books: nextBooks,
        });
        showToast('Book updated successfully', 'success');
      } else {
        const newBook = await batchApi.addBookToBatch(activeBatch.id, data);
        targetBookId = newBook.id;
        setLastAnchorId(targetBookId);
        const latestBatch = currentBatchRef.current ?? activeBatch;
        const existingBooks = latestBatch.books || [];
        const alreadyExists = existingBooks.some((b) => b.id === newBook.id);
        nextBooks = alreadyExists ? existingBooks : [...existingBooks, newBook];
        // Optimistic update: append new book to cached state
        mutateCurrentBatch({
          ...latestBatch,
          books: nextBooks,
          book_count: alreadyExists
            ? (latestBatch.book_count ?? nextBooks.length)
            : (latestBatch.book_count || 0) + 1,
        });
        showToast('Book added successfully', 'success');
      }

      lastLocalSaveAtRef.current = Date.now();
      lastSavedBookIdRef.current = targetBookId;
      revalidateCacheByPrefix('admin:batches');
      revalidateCacheByPrefix('admin:dashboard');
      isSavingBookRef.current = false;
      setIsBookFormOpen(false);
      setEditingBook(undefined);
      pendingScrollBookIdRef.current = targetBookId;
      if (pendingRemoteSyncRef.current) {
        pendingRemoteSyncRef.current = false;
        lastSavedBookIdRef.current = null;
        void syncRemoteUpdate(targetBookId);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save book';
      showToast(message, 'error');
      await refetchCurrentBatch();
      isSavingBookRef.current = false;
      if (pendingRemoteSyncRef.current && !isBookFormOpenRef.current) {
        pendingRemoteSyncRef.current = false;
        void syncRemoteUpdate();
      }
    }
  };

  const handleDeleteBook = (bookId: number) => {
    const activeBatch = currentBatchRef.current;
    if (!activeBatch) return;
    const bookToDelete = activeBatch.books?.find((b) => b.id === bookId);
    if (!bookToDelete) return;

    // Optimistically remove immediately — keeps UI live
    mutateCurrentBatch({
      ...activeBatch,
      books: (activeBatch.books || []).filter((b) => b.id !== bookId),
      book_count: Math.max(0, (activeBatch.book_count || 0) - 1),
    });

    triggerDelete(
      bookToDelete.title,
      async () => {
        try {
          await batchApi.deleteBook(activeBatch.id, bookId);
          revalidateCacheByPrefix('admin:batch');
          revalidateCacheByPrefix('admin:dashboard');
        } catch (error: unknown) {
          const latest = currentBatchRef.current;
          if (latest) {
            mutateCurrentBatch({
              ...latest,
              books: [...(latest.books || []), bookToDelete],
              book_count: (latest.book_count || 0) + 1,
            });
          }
          const msg = error instanceof Error ? error.message : 'Failed to delete book';
          showToast(msg, 'error');
        }
      },
      () => {
        const latest = currentBatchRef.current;
        if (latest) {
          mutateCurrentBatch({
            ...latest,
            books: [...(latest.books || []), bookToDelete],
            book_count: (latest.book_count || 0) + 1,
          });
        }
        showToast('Deletion undone', 'success');
      },
    );
  };

  const handleBulkDeleteBooks = () => {
    const activeBatch = currentBatchRef.current;
    if (!activeBatch || selectedBookIds.size === 0) return;
    const idsToDelete = Array.from<number>(selectedBookIds);
    const count = idsToDelete.length;
    const booksToDelete = activeBatch.books?.filter((b) => selectedBookIds.has(b.id)) || [];

    // Optimistically remove immediately
    mutateCurrentBatch({
      ...activeBatch,
      books: (activeBatch.books || []).filter((b) => !selectedBookIds.has(b.id)),
      book_count: Math.max(0, (activeBatch.book_count || 0) - count),
    });
    setSelectedBookIds(new Set());

    triggerDelete(
      `${count} selected book(s)`,
      async () => {
        setIsRemoving(true);
        const toastId = showToast(`${count} removing processing.`, 'loading');
        try {
          await processInChunks(
            idsToDelete,
            10,
            (id: number) => batchApi.deleteBook(activeBatch.id, id),
            () => {},
          );
          revalidateCacheByPrefix('admin:batch');
          revalidateCacheByPrefix('admin:dashboard');
          showToast(`Successfully removed ${count} books`, 'success');
        } catch {
          const latest = currentBatchRef.current;
          if (latest) {
            mutateCurrentBatch({
              ...latest,
              books: [...(latest.books || []), ...booksToDelete],
              book_count: (latest.book_count || 0) + count,
            });
          }
          showToast('Failed to remove some books', 'error');
        } finally {
          setIsRemoving(false);
          removeToast(toastId);
        }
      },
      () => {
        const latest = currentBatchRef.current;
        if (latest) {
          mutateCurrentBatch({
            ...latest,
            books: [...(latest.books || []), ...booksToDelete],
            book_count: (latest.book_count || 0) + count,
          });
        }
        showToast('Bulk removal undone', 'success');
      },
    );
  };

  // Derived state for filtering
  const debouncedSearch = useDebounce(searchQuery, 400);
  const displayBooks = currentBatch?.books || [];
  const filteredBooks = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return displayBooks.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        (book.accession_number && book.accession_number.toLowerCase().includes(query));
      const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [displayBooks, debouncedSearch, selectedCategory]);

  const uniqueCategories = useMemo(
    () => ['All', ...new Set(displayBooks.map((b) => b.category))].filter(Boolean),
    [displayBooks],
  );

  const categoryFilterOptions = useMemo<ScrollableSelectOption[]>(() => {
    const opts = uniqueCategories.map((cat) => ({
      value: cat,
      label: cat,
    }));
    if (selectedCategory && !uniqueCategories.includes(selectedCategory)) {
      opts.push({ value: selectedCategory, label: selectedCategory });
    }
    return opts;
  }, [uniqueCategories, selectedCategory]);

  const booksPagination = usePagination<BatchBook>({
    items: filteredBooks,
    pageSize: 10,
    storageKey: 'jrmsu_admin_books_page_size',
    pageStorageKey: 'admin:books:page',
  });
  const paginatedBooks = booksPagination.paginatedItems;

  const { setPage: setBooksPage } = booksPagination;
  const prevBookFilterRef = useRef<{
    search: string;
    category: string;
    batchId: number;
  } | null>(null);

  useEffect(() => {
    if (currentBatch?.id === undefined) return;
    const nextFilter = {
      search: debouncedSearch,
      category: selectedCategory,
      batchId: currentBatch.id,
    };
    if (prevBookFilterRef.current === null) {
      prevBookFilterRef.current = nextFilter;
      return;
    }
    const prev = prevBookFilterRef.current;
    if (
      prev.search !== nextFilter.search ||
      prev.category !== nextFilter.category ||
      prev.batchId !== nextFilter.batchId
    ) {
      prevBookFilterRef.current = nextFilter;
      setBooksPage(1);
    }
  }, [debouncedSearch, selectedCategory, currentBatch?.id, setBooksPage]);

  useEffect(() => {
    const targetId = pendingScrollBookIdRef.current;
    if (targetId === null || isBookFormOpen) return;

    const matchIndex = filteredBooks.findIndex((b) => b.id === targetId);
    if (matchIndex === -1) {
      pendingScrollBookIdRef.current = null;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          restoreNow(null);
        });
      });
      return;
    }

    const targetPage = findPageForItemIndex(matchIndex, booksPagination.pageSize);
    if (targetPage !== booksPagination.currentPage) {
      setBooksPage(targetPage);
      return;
    }

    pendingScrollBookIdRef.current = null;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        restoreNow(targetId);
      });
    });
  }, [
    filteredBooks,
    isBookFormOpen,
    booksPagination.pageSize,
    booksPagination.currentPage,
    setBooksPage,
    restoreNow,
  ]);

  // Batches sorted ascending for View All modal
  const batchesAscending = useMemo(
    () => [...batches].sort((a, b) => new Date(a.opened_at).getTime() - new Date(b.opened_at).getTime()),
    [batches],
  );
  const sortedRecentBatches = useMemo(
    () =>
      [...batches].sort(
        (a, b) =>
          new Date(b.last_interacted_at || b.opened_at).getTime() -
          new Date(a.last_interacted_at || a.opened_at).getTime(),
      ),
    [batches],
  );

  const loading = (batchesLoading && batches.length === 0) || actionLoading;

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
          value={batches.find((b) => b.is_display_batch)?.book_count || 0}
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
            cursor: 'grab',
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
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="admin-btn admin-btn--secondary text-sm"
                onClick={() => {
                  if (selectedBookIds.size > 0) {
                    setSelectedBookIds(new Set());
                  } else {
                    setSelectedBookIds(new Set(filteredBooks.map((b) => b.id)));
                  }
                }}
                disabled={isRemoving}
              >
                {selectedBookIds.size > 0 ? 'Unselect All' : 'Select All'}
              </button>
              {selectedBookIds.size > 0 && (
                <button
                  className="admin-btn"
                  style={{ background: isRemoving ? 'var(--color-gray-400)' : 'var(--color-red-600)', color: 'white', border: 'none' }}
                  onClick={handleBulkDeleteBooks}
                  disabled={isRemoving}
                >
                  <Trash2 size={16} /> Remove Selected ({selectedBookIds.size})
                </button>
              )}
              {currentBatch.status === 'open' && (
                <button
                  className="admin-btn admin-btn--primary"
                  onClick={() => {
                    captureNow(null);
                    setEditingBook(undefined);
                    setIsBookFormOpen(true);
                  }}
                >
                  <Plus size={16} /> Add Book
                </button>
              )}
            </div>
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
              <ScrollableSelect
                value={selectedCategory}
                options={categoryFilterOptions}
                onChange={(nextCategory) => setSelectedCategory(nextCategory)}
                ariaLabel="Filter books by category"
                menuMaxHeightClass="max-h-56"
                className="h-9 min-w-[150px] max-w-[240px] rounded-lg font-medium"
              />
              <button className="admin-btn admin-btn--icon" onClick={() => setViewMode('grid')} style={viewMode === 'grid' ? { background: 'var(--color-navy)', color: 'var(--color-white)' } : {}}>
                <LayoutGrid size={16} />
              </button>
              <button className="admin-btn admin-btn--icon" onClick={() => setViewMode('table')} style={viewMode === 'table' ? { background: 'var(--color-navy)', color: 'var(--color-white)' } : {}}>
                <List size={16} />
              </button>
            </div>
          </div>

          {viewMode === 'table' && (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={paginatedBooks.length > 0 && paginatedBooks.every((b) => selectedBookIds.has(b.id))}
                        disabled={isRemoving}
                        onChange={(e) => {
                          const newSelected = new Set(selectedBookIds);
                          if (e.target.checked) {
                            paginatedBooks.forEach((b) => newSelected.add(b.id));
                          } else {
                            paginatedBooks.forEach((b) => newSelected.delete(b.id));
                          }
                          setSelectedBookIds(newSelected);
                        }}
                      />
                    </th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Accession No.</th>
                    <th>Category</th>
                    <th>Date Encoded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBooks.map((book) => {
                    const isHighlighted = highlightedId === String(book.id);
                    const isSelected = selectedBookIds.has(book.id);
                    return (
                      <tr
                        key={book.id}
                        data-cache-anchor-id={String(book.id)}
                        className={isHighlighted ? 'ring-2 ring-amber-400 bg-amber-50/40' : undefined}
                        style={{
                          backgroundColor: isSelected
                            ? 'var(--color-blue-50)'
                            : isHighlighted
                              ? undefined
                              : 'transparent',
                        }}
                      >
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isRemoving}
                            onChange={(e) => {
                              const newSelected = new Set(selectedBookIds);
                              if (e.target.checked) newSelected.add(book.id);
                              else newSelected.delete(book.id);
                              setSelectedBookIds(newSelected);
                            }}
                          />
                        </td>
                        <td style={{ fontWeight: 500 }}>{book.title}</td>
                        <td>{book.author}</td>
                        <td style={{ fontFamily: 'monospace' }}>{book.accession_number || 'N/A'}</td>
                        <td><span className="admin-badge admin-badge--info">{book.category}</span></td>
                        <td style={{ color: 'var(--color-gray-500)' }}>{new Date(book.date_encoded).toLocaleDateString()}</td>
                        <td>
                          <div className="admin-table__actions">
                            <button
                              className="admin-btn admin-btn--icon"
                              onClick={() => {
                                captureNow(book.id);
                                setLastAnchorId(book.id);
                                setEditingBook(book);
                                setIsBookFormOpen(true);
                              }}
                            >
                              <Pencil size={15} />
                            </button>
                            <button className="admin-btn admin-btn--icon" style={{ color: 'var(--color-red-600)' }} onClick={() => handleDeleteBook(book.id)}><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredBooks.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--color-gray-500)' }}>No books in this batch match the filter.</td></tr>
                  )}
                </tbody>
              </table>
              {booksPagination.totalItems > 0 && (
                <Pagination
                  currentPage={booksPagination.currentPage}
                  totalPages={booksPagination.totalPages}
                  onPageChange={booksPagination.setPage}
                  totalItems={booksPagination.totalItems}
                  itemsPerPage={booksPagination.pageSize}
                  onPageSizeChange={booksPagination.setPageSize}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                />
              )}
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="admin-card-grid" style={{ padding: 20 }}>
              {paginatedBooks.map((book) => {
                const isHighlighted = highlightedId === String(book.id);
                return (
                  <div
                    key={book.id}
                    data-cache-anchor-id={String(book.id)}
                    className={`admin-grid-card relative ${isHighlighted ? 'ring-2 ring-amber-400 bg-amber-50/40' : ''}`}
                  >
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
                            <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-100 z-[10000] py-1 animate-modal-card" onClick={(e) => e.stopPropagation()}>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer border-none bg-transparent"
                                onClick={() => {
                                  captureNow(book.id);
                                  setLastAnchorId(book.id);
                                  setEditingBook(book);
                                  setIsBookFormOpen(true);
                                  setActiveBookDropdown(null);
                                }}
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

                    <div style={{ height: 140, background: 'var(--color-gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: 12, borderTopRightRadius: 12, position: 'relative' }}>
                      <BookOpen size={40} color="var(--color-gray-400)" />
                      {book.cover_image && (
                        <img
                          src={getThumbnailUrl(book.cover_image)}
                          alt={book.title}
                          loading="lazy"
                          decoding="async"
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                          onError={(e) => {
                            const img = e.currentTarget;
                            const fallbackUrl = getImageUrl(book.cover_image);
                            if (img.dataset.fallbackApplied !== '1' && fallbackUrl) {
                              img.dataset.fallbackApplied = '1';
                              img.src = fallbackUrl;
                            } else {
                              img.style.display = 'none';
                            }
                          }}
                        />
                      )}
                    </div>
                    <div className="admin-grid-card__body">
                      <div className="admin-grid-card__title">{book.title}</div>
                      <div className="admin-grid-card__meta">{book.author}</div>
                      <div style={{ marginTop: 8 }}><span className="admin-badge admin-badge--info">{book.category}</span></div>
                    </div>
                  </div>
                );
              })}
              {booksPagination.totalItems > 0 && (
                <div className="col-span-full">
                  <Pagination
                    currentPage={booksPagination.currentPage}
                    totalPages={booksPagination.totalPages}
                    onPageChange={booksPagination.setPage}
                    totalItems={booksPagination.totalItems}
                    itemsPerPage={booksPagination.pageSize}
                    onPageSizeChange={booksPagination.setPageSize}
                    pageSizeOptions={PAGE_SIZE_OPTIONS}
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
        onCategoriesChanged={handleCategoriesChanged}
      />

      {/* View All Batches Modal */}
      {viewAllOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-modal-overlay z-[9999]" onClick={() => setViewAllOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden animate-modal-card" onClick={(e) => e.stopPropagation()}>
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
                          if (e.target.checked) setSelectedBatchIds(new Set(batchesAscending.map((b) => b.id)));
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
                              <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-100 z-[10000] py-1" onClick={(e) => e.stopPropagation()}>
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
        document.body,
      )}

      {/* Audit Modal */}
      {auditBatch && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-modal-overlay z-[9999]" onClick={() => setAuditBatch(null)}>
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
        document.body,
      )}

      <UndoDeleteToast
        undoState={undoState}
        onUndo={cancelDelete}
        onExecuteNow={executeNow}
      />
    </>
  );
}
