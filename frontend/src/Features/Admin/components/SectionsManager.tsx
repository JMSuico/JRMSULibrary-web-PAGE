import React, { useState, useEffect } from 'react';
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
import { useToast } from '@/src/Hooks/useToast';

import { galleryApi, GalleryImage } from '@/src/Endpoints/galleryApi';
import { useAutoRefresh } from '@/src/Hooks/useAutoRefresh';
import { useDebounce } from '@/src/Hooks/useDebounce';
import { useUndoDelete } from '@/src/Hooks/useUndoDelete';
import { Pagination } from '@/src/Components/Shared/Pagination';

type ViewMode = 'table' | 'grid';

export function SectionsManager() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { showToast } = useToast();
  const { undoState, triggerDelete, cancelDelete, executeNow } = useUndoDelete();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [viewingImage, setViewingImage] = useState<GalleryImage | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await galleryApi.getAllImages();
      setImages(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch images', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  useAutoRefresh(fetchImages, 60000);

  const handleDelete = (id: number) => {
    const imgToDelete = images.find(img => img.id === id);
    if (!imgToDelete) return;

    triggerDelete(
      imgToDelete.title || 'Image',
      async () => {
        try {
          await galleryApi.deleteImage(id);
          showToast('Image permanently deleted', 'success');
        } catch (err: any) {
          // Revert optimistic delete
          setImages(prev => [...prev, imgToDelete]);
          showToast(err.message || 'Failed to delete image', 'error');
        }
      },
      () => {
        // Undo logic
        setImages(prev => [...prev, imgToDelete]);
        showToast('Deletion undone', 'success');
      }
    );

    // Optimistic delete
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const fd = new FormData();
    const form = e.currentTarget;
    fd.append('title', (form.querySelector('[name=title]') as HTMLInputElement).value);
    fd.append('section_label', (form.querySelector('[name=section_label]') as HTMLInputElement).value);
    fd.append('is_active', (form.querySelector('[name=is_active_check]') as HTMLInputElement).checked ? 'true' : 'false');
    if (selectedFile) {
      fd.append('image', selectedFile);
    }

    try {
      if (editingImage) {
        await galleryApi.updateImage(editingImage.id, fd);
      } else {
        await galleryApi.createImage(fd);
      }
      showToast(`Image ${editingImage ? 'updated' : 'uploaded'} successfully`, 'success');
      setIsModalOpen(false);
      fetchImages();
    } catch (err: any) {
      showToast(err.message || 'An error occurred while saving image', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const openAddModal = () => {
    setEditingImage(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  const openEditModal = (img: GalleryImage) => {
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

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) return imagePath;
    
    // Dynamically compute the URL based on the current hostname to support Wi-Fi deployment
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
    const baseUrl = `http://${hostname}:8000`;
    
    if (imagePath.startsWith('/media/')) return `${baseUrl}${imagePath}`;
    if (imagePath.startsWith('/')) return `${baseUrl}/media${imagePath}`;
    return `${baseUrl}/media/${imagePath}`;
  };

  const debouncedSearch = useDebounce(searchQuery, 400);

  const filtered = images.filter(
    (img) =>
      img.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      img.section_label.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedSections = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const activeCount = images.filter((i) => i.is_active).length;

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
                      <th>Image</th>
                      <th>Title</th>
                      <th>Section Label</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSections.map((img) => (
                      <tr key={img.id}>
                        <td>
                          <img
                            src={getImageUrl(img.image)}
                            alt={img.title}
                            className="rounded-md object-cover"
                            style={{ width: 64, height: 48 }}
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
                            <button className="admin-btn admin-btn--icon" aria-label={`View ${img.title}`} onClick={() => setViewingImage(img)}>
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {viewMode === 'grid' && (
              <div className="admin-card-grid p-5">
                {paginatedSections.map((img) => (
                  <div className="admin-grid-card" key={img.id}>
                    <div style={{ height: 160, overflow: 'hidden', position: 'relative', background: 'var(--color-gray-100)', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                      <img
                        src={getImageUrl(img.image)}
                        alt={img.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
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
                      <button className="admin-btn admin-btn--icon" aria-label={`View ${img.title}`} onClick={() => setViewingImage(img)}>
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

            {filtered.length > itemsPerPage && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
              />
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 ] flex items-center justify-center p-4 backdrop-blur-sm animate-modal-overlay z-[9999]">
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
                        target: { files: [file] }
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
              >
                Cancel
              </button>
              <button
                type="submit"
                form="section-image-form"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-navy hover:bg-navy-dark rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : editingImage ? 'Update Image' : 'Upload Image'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* View Full Details Modal */}
      {viewingImage && createPortal(
<div className="fixed inset-0 bg-black/60 ] flex items-center justify-center p-4 backdrop-blur-sm animate-modal-overlay z-[9999]" onClick={() => setViewingImage(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-modal-card" onClick={e => e.stopPropagation()}>
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
document.body
)}

      {/* Undo Delete Toast */}
      {undoState && (
        <div className="fixed bottom-6 right-6 z-[60] bg-white rounded-lg shadow-xl border border-gray-100 p-4 w-80 flex flex-col gap-3 slide-in-from-bottom-5 animate-modal-card">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">Item deleted</p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">"{undoState.itemName}"</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={cancelDelete}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded transition-colors cursor-pointer"
              >
                Undo
              </button>
              <button onClick={executeNow} className="text-gray-400 hover:text-gray-600 cursor-pointer" aria-label="Close and delete now">
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gray-400 h-full transition-all ease-linear"
              style={{ width: `${(undoState.countdown / 3) * 100}%`, transitionDuration: '1s' }}
            />
          </div>
        </div>
      )}
    </>
  );
}


