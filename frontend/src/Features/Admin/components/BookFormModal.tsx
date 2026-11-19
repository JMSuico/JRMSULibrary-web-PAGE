import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getImageUrl } from '@/src/Libs/apiClient';
import { createPortal } from 'react-dom';
import { X, Pencil, Trash2, Plus } from 'lucide-react';
import { DragDropFileUpload } from '@/src/Components/Shared/DragDropFileUpload';
import { ScrollableSelect, ScrollableSelectOption } from '@/src/Components/Shared/ScrollableSelect';
import { batchApi, BatchBook, BookCategoryItem } from '@/src/Endpoints/batchApi';
import { useCachedQuery } from '@/src/Hooks/useCachedQuery';
import { useToast } from '@/src/Hooks/useToast';
import { DefaultFloatingModalCard } from '@/src/Shared/DefaultFloatingModalCard';
import { ConfirmModal } from '@/src/Features/Admin/components/ConfirmModal';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void | Promise<void>;
  initialData?: BatchBook;
  onCategoriesChanged?: () => void | Promise<void>;
}

const extractErrorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error && err.message ? err.message : fallback;

const sortCategoriesByName = (items: BookCategoryItem[]): BookCategoryItem[] =>
  [...items].sort((a, b) => a.name.localeCompare(b.name));

export function BookFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  onCategoriesChanged,
}: BookFormModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [accessionNumber, setAccessionNumber] = useState('');
  const [category, setCategory] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [isCategoryMutating, setIsCategoryMutating] = useState(false);

  const [editingCategory, setEditingCategory] = useState<BookCategoryItem | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryError, setEditCategoryError] = useState('');

  const [deletingCategory, setDeletingCategory] = useState<BookCategoryItem | null>(null);
  const submitSessionRef = useRef(0);

  const { showToast } = useToast();
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    mutate: mutateCategories,
  } = useCachedQuery<BookCategoryItem[]>({
    key: 'admin:book-categories',
    fetcher: () => batchApi.getCategories(),
    staleTimeMs: 30_000,
    persistStorage: true,
  });

  const categories = categoriesData ?? [];
  const selectedCat = categories.find((c) => c.name === category);
  const hasTemporaryInitialCategory = Boolean(
    initialData?.category && !categories.some((c) => c.name === initialData.category),
  );

  const categoryOptions = useMemo<ScrollableSelectOption[]>(() => {
    const opts: ScrollableSelectOption[] = [];
    if (categories.length === 0 && !hasTemporaryInitialCategory) {
      opts.push({
        value: '',
        label: categoriesLoading ? 'Loading categories...' : 'No categories available',
        disabled: true,
      });
    }
    if (hasTemporaryInitialCategory && initialData?.category) {
      opts.push({
        value: initialData.category,
        label: initialData.category,
      });
    }
    for (const c of categories) {
      opts.push({
        value: c.name,
        label: c.name,
      });
    }
    return opts;
  }, [categories, categoriesLoading, hasTemporaryInitialCategory, initialData?.category]);

  // Reset form fields whenever the modal opens or the book being edited changes
  useEffect(() => {
    submitSessionRef.current += 1;
    setIsSaving(false);
    if (isOpen) {
      setTitle(initialData?.title || '');
      setAuthor(initialData?.author || '');
      setAccessionNumber(initialData?.accession_number || '');
      setCategory(initialData?.category || categories[0]?.name || '');
      setCoverImage(null);
      setIsAddingCategory(false);
      setNewCategory('');
      setCategoryError('');
      setEditingCategory(null);
      setEditCategoryName('');
      setEditCategoryError('');
      setDeletingCategory(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  // Select first available backend category once loaded if none is selected yet
  useEffect(() => {
    if (isOpen && !category && categories.length > 0) {
      setCategory(categories[0].name);
    }
  }, [isOpen, category, categories]);

  const handleAddCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      setCategoryError('Category name cannot be empty.');
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setCategoryError('Category already exists.');
      return;
    }
    if (isCategoryMutating) return;

    setIsCategoryMutating(true);
    setCategoryError('');
    try {
      const created = await batchApi.createCategory(trimmed);
      mutateCategories((prev) => sortCategoriesByName([...(prev ?? []), created]));
      setCategory(created.name);
      setNewCategory('');
      setIsAddingCategory(false);
      await onCategoriesChanged?.();
      showToast(`Category "${created.name}" added`, 'success');
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Failed to add category');
      setCategoryError(msg);
      showToast(msg, 'error');
    } finally {
      setIsCategoryMutating(false);
    }
  };

  const handleOpenEditCategory = () => {
    if (!selectedCat || isCategoryMutating) return;
    setEditingCategory(selectedCat);
    setEditCategoryName(selectedCat.name);
    setEditCategoryError('');
  };

  const handleSaveEditCategory = async () => {
    if (!editingCategory || isCategoryMutating) return;
    const trimmed = editCategoryName.trim();
    if (!trimmed) {
      setEditCategoryError('Category name cannot be empty.');
      return;
    }
    if (
      categories.some(
        (c) => c.id !== editingCategory.id && c.name.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      setEditCategoryError('A category with this name already exists.');
      return;
    }
    if (trimmed === editingCategory.name) {
      setEditingCategory(null);
      setEditCategoryError('');
      return;
    }

    setIsCategoryMutating(true);
    setEditCategoryError('');
    try {
      const updated = await batchApi.updateCategory(editingCategory.id, trimmed);
      mutateCategories((prev) =>
        sortCategoriesByName((prev ?? []).map((c) => (c.id === updated.id ? updated : c))),
      );
      if (category === editingCategory.name) {
        setCategory(updated.name);
      }
      setEditingCategory(null);
      setEditCategoryName('');
      await onCategoriesChanged?.();
      showToast(`Category renamed to "${updated.name}"`, 'success');
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Failed to update category');
      setEditCategoryError(msg);
      showToast(msg, 'error');
    } finally {
      setIsCategoryMutating(false);
    }
  };

  const handleConfirmDeleteCategory = async (target: BookCategoryItem) => {
    if (isCategoryMutating) return;
    setIsCategoryMutating(true);
    try {
      await batchApi.deleteCategory(target.id);
      const remaining = categories.filter((c) => c.id !== target.id);
      mutateCategories(remaining);
      if (category === target.name) {
        setCategory(remaining[0]?.name || '');
      }
      await onCategoriesChanged?.();
      showToast(`Category "${target.name}" deleted`, 'success');
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Failed to delete category');
      showToast(msg, 'error');
    } finally {
      setIsCategoryMutating(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    const sessionId = submitSessionRef.current;
    setIsSaving(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('accession_number', accessionNumber);
    formData.append('category', category);
    if (coverImage) {
      formData.append('cover_image', coverImage);
    }
    try {
      await onSubmit(formData);
    } finally {
      if (submitSessionRef.current === sessionId) {
        setIsSaving(false);
      }
    }
  };

  return (
    <>
      {createPortal(
        <div className="fixed backdrop-blur-sm inset-0 bg-black/60 flex items-center justify-center p-4 animate-modal-overlay z-[9999]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-modal-card">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 m-0">
                {initialData ? 'Edit Book' : 'Add New Book'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accession Number</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={accessionNumber}
                  onChange={(e) => setAccessionNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                {!isAddingCategory ? (
                  <div className="flex items-center gap-2">
                    <ScrollableSelect
                      value={category}
                      options={categoryOptions}
                      onChange={(nextCategory) => {
                        setCategory(nextCategory);
                        setCategoryError('');
                      }}
                      placeholder={categoriesLoading ? 'Loading categories...' : 'No categories available'}
                      required
                      ariaLabel="Category"
                      className="flex-1 min-w-0"
                      menuMaxHeightClass="max-h-48"
                    />
                    <button
                      type="button"
                      onClick={handleOpenEditCategory}
                      disabled={!selectedCat || isCategoryMutating}
                      title="Edit selected category"
                      aria-label="Edit selected category"
                      className="p-2 border border-gray-300 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedCat && !isCategoryMutating) {
                          setDeletingCategory(selectedCat);
                        }
                      }}
                      disabled={!selectedCat || isCategoryMutating}
                      title="Delete selected category"
                      aria-label="Delete selected category"
                      className="p-2 border border-gray-300 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCategory(true);
                        setCategoryError('');
                      }}
                      disabled={isCategoryMutating}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap transition-colors cursor-pointer shrink-0"
                    >
                      <Plus size={15} />
                      Add
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        maxLength={100}
                        placeholder="New category name"
                        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newCategory}
                        onChange={(e) => {
                          setNewCategory(e.target.value);
                          if (categoryError) setCategoryError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            void handleAddCategory();
                          }
                        }}
                        disabled={isCategoryMutating}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => void handleAddCategory()}
                        disabled={isCategoryMutating}
                        className="px-3 py-2 bg-navy text-white text-sm font-medium rounded-md hover:bg-blue-800 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                      >
                        {isCategoryMutating ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingCategory(false);
                          setNewCategory('');
                          setCategoryError('');
                        }}
                        disabled={isCategoryMutating}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
                        aria-label="Cancel adding category"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    {categoryError && (
                      <p className="text-xs text-red-600 font-medium">{categoryError}</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Book Cover Image</label>

                {initialData && initialData.cover_image && !coverImage && (
                  <div className="mb-3 flex items-center gap-3 p-2 border border-gray-200 rounded-md">
                    <img
                      src={getImageUrl(initialData.cover_image)}
                      alt="Current cover"
                      className="w-10 h-14 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="text-sm text-gray-600">Current cover image</span>
                  </div>
                )}

                <DragDropFileUpload
                  accept="image/*"
                  multiple={false}
                  maxSizeMB={5}
                  onFilesSelected={(files) => setCoverImage(files[0])}
                  label="Click to upload or drag and drop"
                  subLabel="PNG, JPG up to 5MB"
                />
                {coverImage && (
                  <p className="text-sm font-medium text-green-600 mt-2">
                    Selected: {coverImage.name}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : null}
                  {initialData ? 'Save Changes' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )}

      <DefaultFloatingModalCard
        isOpen={editingCategory !== null}
        onClose={() => {
          if (!isCategoryMutating) {
            setEditingCategory(null);
            setEditCategoryError('');
          }
        }}
        title="Edit Category"
        size="sm"
        overlayClassName="z-[10050]"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              maxLength={100}
              value={editCategoryName}
              onChange={(e) => {
                setEditCategoryName(e.target.value);
                if (editCategoryError) setEditCategoryError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleSaveEditCategory();
                }
              }}
              placeholder="Enter category name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCategoryMutating}
              autoFocus
            />
            {editCategoryError && (
              <p className="text-xs text-red-600 font-medium mt-1.5">{editCategoryError}</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setEditingCategory(null);
                setEditCategoryError('');
              }}
              disabled={isCategoryMutating}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSaveEditCategory()}
              disabled={isCategoryMutating}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isCategoryMutating ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </DefaultFloatingModalCard>

      <ConfirmModal
        isOpen={deletingCategory !== null}
        overlayClassName="z-[10050]"
        type="danger"
        title="Delete Category"
        message={
          deletingCategory
            ? `Do you want to delete "${deletingCategory.name}" category? This deletion is permanent.`
            : ''
        }
        confirmText="Yes"
        cancelText="No"
        onConfirm={() => {
          if (deletingCategory) {
            void handleConfirmDeleteCategory(deletingCategory);
          }
        }}
        onCancel={() => setDeletingCategory(null)}
      />
    </>
  );
}


