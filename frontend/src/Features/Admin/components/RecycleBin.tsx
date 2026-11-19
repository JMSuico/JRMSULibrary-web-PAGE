import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Trash2, RotateCcw, Clock, Search } from 'lucide-react';
import { recycleApi, RecycleBinItem } from '@/src/Endpoints/recycleApi';
import { useToast } from '@/src/Hooks/useToast';
import { ConfirmModal } from '@/src/Features/Admin/components/ConfirmModal';
import { useCachedQuery, revalidateCacheByPrefix } from '@/src/Hooks/useCachedQuery';
import { useDebounce } from '@/src/Hooks/useDebounce';
import { bulkApi } from '@/src/Endpoints/bulkApi';
import { Pagination } from '@/src/Components/Shared/Pagination';
import { ScrollableSelect, type ScrollableSelectOption } from '@/src/Components/Shared/ScrollableSelect';
import { usePersistentState, useScrollRestoration, usePagination, useModalSafeCmsSync } from '@/src/Hooks';
import { PAGE_SIZE_OPTIONS } from '@/src/Hooks/usePagination';

const MODULE_FILTER_OPTIONS: ScrollableSelectOption[] = [
  { value: 'ALL', label: 'All Modules' },
  { value: 'BOOKS', label: 'Books' },
  { value: 'BATCH', label: 'Batches (Newly Acquired)' },
  { value: 'GALLERY', label: 'Sections' },
  { value: 'PERSONNEL', label: 'Library Personnel' },
  { value: 'RESEARCH_REF', label: 'Research References' },
  { value: 'CMS_FILE', label: 'Manual Files' },
  { value: 'CMS_LINK', label: 'External Links' },
  { value: 'ERESOURCE_DEPT', label: 'E-Resource Departments' },
  { value: 'ERESOURCE_FILE', label: 'E-Resource Files' },
  { value: 'REPORT', label: 'Generated Reports' },
];

export function RecycleBin() {
  const [searchQuery, setSearchQuery] = usePersistentState<string>('admin:recycle:search', '', {
    storage: 'session',
  });
  const [moduleFilter, setModuleFilter] = usePersistentState<string>('admin:recycle:module', 'ALL', {
    storage: 'session',
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isRemoving, setIsRemoving] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);

  const { showToast, removeToast } = useToast();
  const debouncedSearch = useDebounce(searchQuery, 300);

  const {
    data: cachedItems,
    isLoading,
    error,
    refetch: fetchItems,
    mutate: mutateItems,
  } = useCachedQuery<RecycleBinItem[]>({
    key: 'admin:recycle-bin',
    fetcher: () => recycleApi.getAll(),
    staleTimeMs: 30_000,
    listenCmsUpdate: false,
    persistStorage: true,
  });

  const items = cachedItems ?? [];
  const itemsRef = useRef<RecycleBinItem[]>(items);
  itemsRef.current = items;

  const loading = isLoading && items.length === 0;

  const { captureNow, restoreNow, highlightedId } = useScrollRestoration({
    storageKey: 'admin:recycle-bin',
    isReady: !loading,
  });

  const scheduleDoubleRafRestore = useCallback(
    (anchorId?: string | number | null) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          restoreNow(anchorId);
        });
      });
    },
    [restoreNow],
  );

  const { markLocalSave } = useModalSafeCmsSync({
    isBusy: Boolean(confirmModal?.isOpen) || isRemoving,
    captureNow,
    restoreNow,
    onSync: () => fetchItems(),
  });

  useEffect(() => {
    if (error) {
      showToast('Failed to load recycle bin', 'error');
    }
  }, [error, showToast]);

  const filteredItems = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return items.filter((item) => {
      const matchesSearch = item.item_name.toLowerCase().includes(query);
      const matchesModule = moduleFilter === 'ALL' || item.source_module === moduleFilter;
      return matchesSearch && matchesModule;
    });
  }, [items, debouncedSearch, moduleFilter]);

  const {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    paginatedItems,
    setPage,
    setPageSize,
  } = usePagination<RecycleBinItem>({
    items: filteredItems,
    pageSize: 10,
    storageKey: 'jrmsu_admin_recycle_page_size',
    pageStorageKey: 'admin:recycle:page',
  });

  const prevRecycleFiltersRef = useRef({ debouncedSearch, moduleFilter });
  useEffect(() => {
    const prev = prevRecycleFiltersRef.current;
    if (prev.debouncedSearch === debouncedSearch && prev.moduleFilter === moduleFilter) {
      return;
    }
    prevRecycleFiltersRef.current = { debouncedSearch, moduleFilter };
    setPage(1);
  }, [debouncedSearch, moduleFilter, setPage]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedItems.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;
    captureNow();
    try {
      setIsRemoving(true);
      const count = selectedIds.length;
      mutateItems(itemsRef.current.filter((i) => !selectedIds.includes(i.id)));
      const toastId = showToast(`${count} items restoring in background...`, 'loading');
      await bulkApi.restore(selectedIds);
      markLocalSave();
      revalidateCacheByPrefix('admin:');
      showToast(`${count} items queued for restoration`, 'success');
      setSelectedIds([]);
      removeToast(toastId);
      await fetchItems();
      scheduleDoubleRafRestore(null);
    } catch {
      showToast('Failed to queue restoration', 'error');
      await fetchItems();
      scheduleDoubleRafRestore(null);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    captureNow();
    const idsSnapshot = [...selectedIds];
    setConfirmModal({
      isOpen: true,
      title: 'Delete Permanently',
      message: `Are you sure you want to permanently delete ${idsSnapshot.length} items? This action cannot be undone.`,
      onConfirm: async () => {
        captureNow();
        try {
          setIsRemoving(true);
          const count = idsSnapshot.length;
          mutateItems(itemsRef.current.filter((i) => !idsSnapshot.includes(i.id)));
          const toastId = showToast(`${count} items deleting in background...`, 'loading');
          await bulkApi.hardDelete(idsSnapshot);
          markLocalSave();
          revalidateCacheByPrefix('admin:recycle-bin');
          showToast(`${count} items queued for permanent deletion`, 'success');
          setSelectedIds([]);
          removeToast(toastId);
          await fetchItems();
          scheduleDoubleRafRestore(null);
        } catch {
          showToast('Failed to queue permanent deletion', 'error');
          await fetchItems();
          scheduleDoubleRafRestore(null);
        } finally {
          setIsRemoving(false);
        }
      },
    });
  };

  const handleRestore = async (id: number) => {
    captureNow(id);
    try {
      await recycleApi.restore(id);
      markLocalSave();
      revalidateCacheByPrefix('admin:');
      showToast('Item restored successfully', 'success');
      await fetchItems();
      scheduleDoubleRafRestore(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to restore item';
      showToast(message, 'error');
      scheduleDoubleRafRestore(id);
    }
  };

  const handleDelete = (id: number) => {
    captureNow(id);
    setConfirmModal({
      isOpen: true,
      title: 'Delete Permanently',
      message: 'Are you sure you want to permanently delete this item? This action cannot be undone.',
      onConfirm: async () => {
        captureNow(id);
        try {
          await recycleApi.deletePermanently(id);
          markLocalSave();
          revalidateCacheByPrefix('admin:recycle-bin');
          showToast('Item deleted permanently', 'success');
          await fetchItems();
          scheduleDoubleRafRestore(null);
        } catch {
          showToast('Failed to delete item', 'error');
          scheduleDoubleRafRestore(id);
        }
      },
    });
  };

  return (
    <>
      <div className="admin-content__header">
        <h1>Recycle Bin</h1>
        <p>Recover recently deleted books and sections. Items are kept for 30 days before permanent deletion.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex gap-4 items-center w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search deleted items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <ScrollableSelect
              value={moduleFilter}
              options={MODULE_FILTER_OPTIONS}
              onChange={(nextModule) => setModuleFilter(nextModule)}
              ariaLabel="Filter deleted items by module"
              menuMaxHeightClass="max-h-56"
              className="h-[42px] min-w-[210px] max-w-[280px] rounded-lg"
            />
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex justify-between items-center animate-in slide-in-from-top-2">
            <span className="text-sm font-medium text-blue-800">
              {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkRestore}
                disabled={isRemoving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <RotateCcw size={16} /> Restore All
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isRemoving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-white border border-red-200 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} /> Delete All
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-gray-500 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
            Loading deleted items...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Trash2 size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700">Recycle Bin is empty</h3>
            <p className="text-gray-500 mt-1 max-w-sm mx-auto">Deleted items will appear here and can be restored within 30 days.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="w-12 text-center">
                    <input
                      type="checkbox"
                      checked={paginatedItems.length > 0 && selectedIds.length === paginatedItems.length}
                      onChange={handleSelectAll}
                      disabled={isRemoving}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                    />
                  </th>
                  <th>Item Name</th>
                  <th>Module</th>
                  <th>Deleted At</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => {
                  const sourceModule: string = item.source_module;
                  const isAnchored = highlightedId === String(item.id);
                  return (
                  <tr
                    key={item.id}
                    data-cache-anchor-id={String(item.id)}
                    className={
                      selectedIds.includes(item.id)
                        ? 'bg-blue-50/50'
                        : isAnchored
                          ? 'bg-blue-50/70 transition-colors'
                          : ''
                    }
                  >
                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleSelectOne(item.id)}
                        disabled={isRemoving}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                      />
                    </td>
                    <td>
                      <div className="font-medium text-gray-800">{item.item_name}</div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        sourceModule === 'BOOKS' ? 'bg-blue-100 text-blue-800' :
                        sourceModule === 'BATCH' ? 'bg-amber-100 text-amber-800' :
                        sourceModule === 'PERSONNEL' ? 'bg-emerald-100 text-emerald-800' :
                        sourceModule === 'RESEARCH_REF' ? 'bg-teal-100 text-teal-800' :
                        sourceModule.startsWith('CMS_') ? 'bg-indigo-100 text-indigo-800' :
                        sourceModule.startsWith('ERESOURCE_') ? 'bg-cyan-100 text-cyan-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {sourceModule === 'BATCH' ? 'Batch' :
                         sourceModule === 'RESEARCH_REF' ? 'Research Ref' :
                         sourceModule === 'CMS_FILE' ? 'Manual File' :
                         sourceModule === 'CMS_LINK' ? 'External Link' :
                         sourceModule.replace('_', ' ').toLowerCase()}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock size={14} className="mr-1.5" />
                        {new Date(item.deleted_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: 'numeric', minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleRestore(item.id)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          title="Restore Item"
                        >
                          <RotateCcw size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Permanently"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>

            {totalItems > 0 && (
              <div className="p-4 border-t border-gray-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={totalItems}
                  itemsPerPage={pageSize}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!confirmModal}
        title={confirmModal?.title || ''}
        message={confirmModal?.message || ''}
        confirmText="Empty Bin"
        type="danger"
        onConfirm={() => {
          confirmModal?.onConfirm();
          setConfirmModal(null);
        }}
        onCancel={() => setConfirmModal(null)}
      />
    </>
  );
}
