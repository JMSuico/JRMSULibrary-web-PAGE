import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { getImageUrl, getThumbnailUrl } from '@/src/Libs/apiClient';
import { createPortal } from 'react-dom';

import {
  Image as ImageIcon,
  Plus,
  Search,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  X,
  Upload,
  Eye,
} from 'lucide-react';
import { MetricCard } from '@/src/Features/Admin/components/MetricCard';
import { DragDropFileUpload } from '@/src/Components/Shared/DragDropFileUpload';
import { galleryApi, GalleryImage } from '@/src/Endpoints/galleryApi';
import {
  useCachedQuery,
  revalidateCacheByPrefix,
  useDebounce,
  useModalSafeCmsSync,
  usePagination,
  usePersistentState,
  useScrollRestoration,
  useToast,
  useUndoDelete,
} from '@/src/Hooks';
import { UndoDeleteToast } from '@/src/Components/Shared/UndoDeleteToast';
import { Pagination } from '@/src/Components/Shared/Pagination';
import { PAGE_SIZE_OPTIONS, findPageForItemIndex } from '@/src/Hooks/usePagination';
import { processInChunks } from '@/src/Libs/chunkUtils';

type ViewMode = 'table' | 'grid';

function handleThumbnailFallback(e: React.SyntheticEvent<HTMLImageElement>, rawImagePath: string) {
  const img = e.currentTarget;
  const fallbackUrl = getImageUrl(rawImagePath);
  if (img.dataset.fallbackApplied !== '1' && fallbackUrl) {
    img.dataset.fallbackApplied = '1';
    img.src = fallbackUrl;
  } else {
    img.style.display = 'none';
  }
}

export function SectionsManager() {
  const [viewMode, setViewMode] = usePersistentState<ViewMode>('admin:sections:viewMode', 'grid', { storage: 'session' });
  const [searchQuery, setSearchQuery] = usePersistentState<string>('admin:sections:search', '', { storage: 'session' });
  const { undoState, triggerDelete, cancelDelete, executeNow } = useUndoDelete();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [viewingImage, setViewingImage] = useState<GalleryImage | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSectionIds, setSelectedSectionIds] = useState<Set<number>>(new Set());
  const [isRemoving, setIsRemoving] = useState(false);
  const { showToast, removeToast } = useToast();

  const {
    data: cachedImages,
    isLoading,
    error,
    refetch,
    mutate,
  } = useCachedQuery<GalleryImage[]>({
    key: 'admin:sections',
    fetcher: () => galleryApi.getAllImages(),
    staleTimeMs: 30_000,
    persistStorage: true,
    listenCmsUpdate: false,
  });

  const images = cachedImages ?? [];
  const imagesRef = useRef<GalleryImage[]>(images);
  imagesRef.current = images;

  const { captureNow, restoreNow, highlightedId, setLastAnchorId } = useScrollRestoration({
    storageKey: 'admin:sections',
    isReady: !isLoading || images.length > 0,
  });

  const pendingScrollSectionIdRef = useRef<number | null>(null);

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
    isBusy: isModalOpen || Boolean(viewingImage) || isSaving || isRemoving,
    captureNow,
    restoreNow,
    onSync: () => refetch(),
  });

  useEffect(() => {
    if (error) {
      showToast(error.message || 'Failed to fetch images', 'error');
    }
  }, [error, showToast]);

  const handleDelete = (id: number) => {
    const imgToDelete = imagesRef.current.find((img) => img.id === id);
    if (!imgToDelete) return;
    captureNow(id);

    triggerDelete(
      imgToDelete.title || 'Image',
      async () => {
        try {
          await galleryApi.deleteImage(id);
          markLocalSave();
          revalidateCacheByPrefix('admin:sections');
          showToast('Image permanently deleted', 'success');
          await refetch();
          scheduleDoubleRafRestore(null);
        } catch (err: unknown) {
          mutate([...imagesRef.current, imgToDelete]);
          const message = err instanceof Error ? err.message : 'Failed to delete image';
          showToast(message, 'error');
          scheduleDoubleRafRestore(id);
        }
      },
      () => {
        mutate([...imagesRef.current, imgToDelete]);
        setLastAnchorId(id);
        pendingScrollSectionIdRef.current = id;
        showToast('Deletion undone', 'success');
      },
    );

    // Optimistic delete
    mutate(imagesRef.current.filter((img) => img.id !== id));
  };

  const handleBulkDeleteSections = () => {
    if (selectedSectionIds.size === 0) return;
    captureNow();
    const idsToDelete = Array.from<number>(selectedSectionIds);
    const count = idsToDelete.length;
    const imagesToDelete = imagesRef.current.filter((img) => selectedSectionIds.has(img.id));

    // Optimistic remove
    mutate(imagesRef.current.filter((img) => !selectedSectionIds.has(img.id)));
    setSelectedSectionIds(new Set());

    triggerDelete(
      `${count} selected image(s)`,
      async () => {
        setIsRemoving(true);
        const toastId = showToast(`${count} removing processing.`, 'loading');
        try {
          await processInChunks(
            idsToDelete,
            10,
            (id: number) => galleryApi.deleteImage(id),
            () => {},
          );
          markLocalSave();
          revalidateCacheByPrefix('admin:sections');
          showToast(`Permanently removed ${count} images`, 'success');
          await refetch();
          scheduleDoubleRafRestore(null);
        } catch {
          mutate([...imagesRef.current, ...imagesToDelete]);
          showToast('Failed to remove some images', 'error');
          scheduleDoubleRafRestore(null);
        } finally {
          setIsRemoving(false);
          removeToast(toastId);
        }
      },
      () => {
        mutate([...imagesRef.current, ...imagesToDelete]);
        scheduleDoubleRafRestore(null);
        showToast('Bulk deletion undone', 'success');
      },
    );
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSaving) return;
    captureNow(editingImage?.id ?? null);
    setIsSaving(true);
    showToast('Saving image...', 'info');

    const fd = new FormData();
    const form = e.currentTarget;
    fd.append('title', (form.querySelector('[name=title]') as HTMLInputElement).value);
    fd.append('section_label', (form.querySelector('[name=section_label]') as HTMLInputElement).value);
    fd.append('is_active', (form.querySelector('[name=is_active_check]') as HTMLInputElement).checked ? 'true' : 'false');
    if (selectedFile) {
      fd.append('image', selectedFile);
    }

    try {
      const saved = editingImage
        ? await galleryApi.updateImage(editingImage.id, fd)
        : await galleryApi.createImage(fd);
      markLocalSave();
      revalidateCacheByPrefix('admin:sections');
      showToast(`Image ${editingImage ? 'updated' : 'uploaded'} successfully`, 'success');
      setIsModalOpen(false);
      if (saved?.id != null) {
        setLastAnchorId(saved.id);
        pendingScrollSectionIdRef.current = saved.id;
      }
      await refetch();
      if (saved?.id == null) {
        scheduleDoubleRafRestore(null);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while saving image';
      showToast(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const openAddModal = () => {
    captureNow(null);
    setEditingImage(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  const openEditModal = (img: GalleryImage) => {
    captureNow(img.id);
    setLastAnchorId(img.id);
    setEditingImage(img);
    setSelectedFile(null);
    setPreviewUrl(getImageUrl(img.image));
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const debouncedSearch = useDebounce(searchQuery, 400);

  const filtered = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return images.filter(
      (img) =>
        img.title.toLowerCase().includes(query) ||
        img.section_label.toLowerCase().includes(query),
    );
  }, [images, debouncedSearch]);

  const {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    paginatedItems: paginatedSections,
    setPage,
    setPageSize,
  } = usePagination<GalleryImage>({
    items: filtered,
    pageSize: 10,
    storageKey: 'jrmsu_admin_sections_page_size',
    pageStorageKey: 'admin:sections:page',
  });

  const prevSearchRef = useRef<string>(debouncedSearch);
  useEffect(() => {
    if (prevSearchRef.current !== debouncedSearch) {
      prevSearchRef.current = debouncedSearch;
      setPage(1);
    }
  }, [debouncedSearch, setPage]);

  useEffect(() => {
    const targetId = pendingScrollSectionIdRef.current;
    if (targetId === null || isModalOpen) return;

    const matchIndex = filtered.findIndex((img) => img.id === targetId);
    if (matchIndex === -1) {
      pendingScrollSectionIdRef.current = null;
      scheduleDoubleRafRestore(null);
      return;
    }

    const targetPage = findPageForItemIndex(matchIndex, pageSize);
    if (targetPage !== currentPage) {
      setPage(targetPage);
      return;
    }

    pendingScrollSectionIdRef.current = null;
    scheduleDoubleRafRestore(targetId);
  }, [filtered, isModalOpen, pageSize, currentPage, setPage, scheduleDoubleRafRestore]);

  const activeCount = images.filter((i) => i.is_active).length;
  const loading = isLoading && images.length === 0;

  return (
    <>
      <div className="admin-content__header">
        <h1>Library Section Pictures</h1>
        <p>Manage section images. Changes sync directly to the public website gallery.</p>
      </div>

      <div className="admin-metrics">
        <MetricCard
          label="Total Images"
          value={images.length}
          icon={<ImageIcon size={22} />}
          variant="blue"
        />
        <MetricCard
          label="Active / Visible"
          value={activeCount}
          icon={<ImageIcon size={22} />}
          variant="green"
        />
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <div className="admin-table-toolbar__search">
            <Search size={16} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search sections"
            />
          </div>
          <div className="admin-table-toolbar__actions">
            <button
              className="admin-btn admin-btn--secondary text-sm"
              onClick={() => {
                if (selectedSectionIds.size > 0) {
                  setSelectedSectionIds(new Set());
                } else {
                  setSelectedSectionIds(new Set(filtered.map((img) => img.id)));
                }
              }}
              disabled={isRemoving}
            >
              {selectedSectionIds.size > 0 ? 'Unselect All' : 'Select All'}
            </button>
            {selectedSectionIds.size > 0 && (
              <button
                className="admin-btn"
                style={{ background: isRemoving ? 'var(--color-gray-400)' : 'var(--color-red-600)', color: 'white', border: 'none' }}
                onClick={handleBulkDeleteSections}
                disabled={isRemoving}
              >
                <Trash2 size={16} /> Remove Selected ({selectedSectionIds.size})
              </button>
            )}
            <button
              className="admin-btn admin-btn--icon"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              style={viewMode === 'grid' ? { background: 'var(--color-navy)', color: 'var(--color-white)' } : {}}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className="admin-btn admin-btn--icon"
              onClick={() => setViewMode('table')}
              aria-label="Table view"
              style={viewMode === 'table' ? { background: 'var(--color-navy)', color: 'var(--color-white)' } : {}}
            >
              <List size={16} />
            </button>
            <button className="admin-btn admin-btn--primary cursor-pointer" onClick={openAddModal} aria-label="Add section image">
              <Plus size={16} />
              Add Image
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading sections...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No images found. Add your first one!</div>
        ) : (
          <>
            {viewMode === 'table' && (
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={paginatedSections.length > 0 && paginatedSections.every((s) => selectedSectionIds.has(s.id))}
                          disabled={isRemoving}
                          onChange={(e) => {
                            const newSelected = new Set(selectedSectionIds);
                            if (e.target.checked) {
                              paginatedSections.forEach((s) => newSelected.add(s.id));
                            } else {
                              paginatedSections.forEach((s) => newSelected.delete(s.id));
                            }
                            setSelectedSectionIds(newSelected);
                          }}
                        />
                      </th>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Section Label</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSections.map((img) => {
                      const isHighlighted = highlightedId === String(img.id);
                      return (
                      <tr
                        key={img.id}
                        data-cache-anchor-id={String(img.id)}
                        className={isHighlighted ? 'ring-2 ring-amber-400 bg-amber-50/40' : undefined}
                        style={{
                          backgroundColor: isHighlighted
                            ? undefined
                            : (selectedSectionIds.has(img.id) ? 'var(--color-blue-50)' : 'transparent'),
                        }}
                      >
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={selectedSectionIds.has(img.id)}
                            disabled={isRemoving}
                            onChange={(e) => {
                              const newSelected = new Set(selectedSectionIds);
                              if (e.target.checked) newSelected.add(img.id);
                              else newSelected.delete(img.id);
                              setSelectedSectionIds(newSelected);
                            }}
                          />
                        </td>
                        <td>
                          <img
                            src={getThumbnailUrl(img.image)}
                            alt={img.title}
                            loading="lazy"
                            decoding="async"
                            className="rounded-md object-cover"
                            style={{ width: 64, height: 48 }}
                            onError={(e) => handleThumbnailFallback(e, img.image)}
                          />
                        </td>
                        <td style={{ fontWeight: 500, color: 'var(--color-gray-900)' }}>{img.title || '—'}</td>
                        <td>{img.section_label || '—'}</td>
                        <td>
                          <span className={`admin-badge ${img.is_active ? 'admin-badge--success' : 'admin-badge--warning'}`}>
                            {img.is_active ? 'Visible' : 'Hidden'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-table__actions">
                            <button
                              className="admin-btn admin-btn--icon"
                              aria-label={`View ${img.title}`}
                              onClick={() => {
                                captureNow(img.id);
                                setLastAnchorId(img.id);
                                setViewingImage(img);
                              }}
                            >
                              <Eye size={15} />
                            </button>
                            <button className="admin-btn admin-btn--icon" aria-label={`Edit ${img.title}`} onClick={() => openEditModal(img)}>
                              <Pencil size={15} />
                            </button>
                            <button
                              className="admin-btn admin-btn--icon"
                              aria-label={`Delete ${img.title}`}
                              style={{ color: 'var(--color-red-600)' }}
                              onClick={() => handleDelete(img.id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {viewMode === 'grid' && (
              <div className="admin-card-grid p-5">
                {paginatedSections.map((img) => (
                  <div
                    className={`admin-grid-card relative ${highlightedId === String(img.id) ? 'ring-2 ring-amber-400 bg-amber-50/40' : ''}`}
                    data-cache-anchor-id={String(img.id)}
                    key={img.id}
                    style={{ border: selectedSectionIds.has(img.id) ? '2px solid var(--color-navy)' : '1px solid var(--color-gray-200)' }}
                  >
                    <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
                      <input
                        type="checkbox"
                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                        checked={selectedSectionIds.has(img.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedSectionIds);
                          if (e.target.checked) newSelected.add(img.id);
                          else newSelected.delete(img.id);
                          setSelectedSectionIds(newSelected);
                        }}
                      />
                    </div>
                    <div style={{ height: 160, overflow: 'hidden', position: 'relative', background: 'var(--color-gray-100)', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                      <img
                        src={getThumbnailUrl(img.image)}
                        alt={img.title}
                        loading="lazy"
                        decoding="async"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                        onError={(e) => handleThumbnailFallback(e, img.image)}
                      />
                      {!img.is_active && (
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'var(--color-black-alpha-50)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span className="text-white text-xs font-bold uppercase tracking-wide">Hidden</span>
                        </div>
                      )}
                    </div>
                    <div className="admin-grid-card__body">
                      <div className="admin-grid-card__title">{img.title || '(Untitled)'}</div>
                      <div className="admin-grid-card__meta">{img.section_label || 'No Section Label'}</div>
                      <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span className={`admin-badge ${img.is_active ? 'admin-badge--success' : 'admin-badge--warning'}`}>
                          {img.is_active ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                    </div>
                    <div className="admin-grid-card__actions">
                      <button
                        className="admin-btn admin-btn--icon"
                        aria-label={`View ${img.title}`}
                        onClick={() => {
                          captureNow(img.id);
                          setLastAnchorId(img.id);
                          setViewingImage(img);
                        }}
                      >
                        <Eye size={15} />
                      </button>
                      <button className="admin-btn admin-btn--icon" aria-label={`Edit ${img.title}`} onClick={() => openEditModal(img)}>
                        <Pencil size={15} />
                      </button>
                      <button
                        className="admin-btn admin-btn--icon"
                        aria-label={`Delete ${img.title}`}
                        style={{ color: 'var(--color-red-600)' }}
                        onClick={() => handleDelete(img.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalItems > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={totalItems}
                itemsPerPage={pageSize}
                onPageSizeChange={setPageSize}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
              />
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-modal-overlay z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-modal-card">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-900">
                {editingImage ? 'Edit Image' : 'Upload New Image'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer transition">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="section-image-form" onSubmit={handleSave} className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Image {editingImage ? '(Leave blank to keep current)' : '*'}
                  </label>
                  <DragDropFileUpload
                    accept="image/*"
                    multiple={false}
                    maxSizeMB={5}
                    onFilesSelected={(files) => {
                      const file = files[0];
                      const event = {
                        target: { files: [file] },
                      } as unknown as React.ChangeEvent<HTMLInputElement>;
                      handleFileChange(event);
                    }}
                    className="p-0"
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-36 gap-2 text-gray-400">
                        <Upload size={28} />
                        <span className="text-sm">Click to upload image or drag and drop</span>
                        <span className="text-xs text-gray-500">Max 5MB</span>
                      </div>
                    )}
                  </DragDropFileUpload>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
                  <input
                    name="title"
                    type="text"
                    maxLength={200}
                    defaultValue={editingImage?.title}
                    placeholder="e.g., Circulation Section"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Section Label</label>
                  <input
                    name="section_label"
                    type="text"
                    maxLength={100}
                    defaultValue={editingImage?.section_label}
                    placeholder="e.g., Filipiniana"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active_check"
                      defaultChecked={editingImage ? editingImage.is_active : true}
                      className="w-4 h-4 text-navy rounded focus:ring-navy"
                    />
                    <span className="text-sm font-medium text-gray-700">Visible on public website</span>
                  </label>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 mt-auto">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="section-image-form"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-navy hover:bg-navy-dark rounded-lg shadow-sm transition cursor-pointer flex items-center gap-2"
              >
                {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : null}
                {editingImage ? 'Update Image' : 'Upload Image'}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* View Full Details Modal */}
      {viewingImage && createPortal(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-modal-overlay z-[9999]" onClick={() => setViewingImage(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ImageIcon size={22} className="text-navy" /> Section Details
              </h2>
              <button onClick={() => setViewingImage(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={22} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="bg-gray-100 rounded-xl overflow-hidden mb-6 flex items-center justify-center" style={{ minHeight: '300px' }}>
                <img
                  src={getImageUrl(viewingImage.image)}
                  alt={viewingImage.title}
                  className="max-w-full max-h-[50vh] object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Title</p>
                  <p className="text-lg font-semibold text-gray-900">{viewingImage.title || '(Untitled)'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Section Label</p>
                  <p className="text-lg font-semibold text-gray-900">{viewingImage.section_label || '(None)'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Visibility Status</p>
                  <span className={`admin-badge ${viewingImage.is_active ? 'admin-badge--success' : 'admin-badge--warning'}`}>
                    {viewingImage.is_active ? 'Visible on Website' : 'Hidden from Website'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Added On</p>
                  <p className="text-base text-gray-800">{new Date(viewingImage.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setViewingImage(null)}
                className="px-6 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Exit
              </button>
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
