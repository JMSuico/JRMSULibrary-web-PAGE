import React, { useState, useEffect } from 'react';
import { getImageUrl } from '@/src/Libs/apiClient';
import { createPortal } from 'react-dom';
import { X, Upload } from 'lucide-react';
import { DragDropFileUpload } from '@/src/Components/Shared/DragDropFileUpload';
import { BatchBook } from '@/src/Endpoints/batchApi';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void | Promise<void>;
  initialData?: BatchBook;
}

const CATEGORIES = ['Technology', 'History', 'Health Sciences', 'Computer Science', 'Science', 'Literature', 'General Reference'];

export function BookFormModal({ isOpen, onClose, onSubmit, initialData }: BookFormModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [accessionNumber, setAccessionNumber] = useState('');
  const [category, setCategory] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [savedCategories, setSavedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('jrmsu_book_categories');
    if (stored) {
      setSavedCategories(JSON.parse(stored));
    } else {
      setSavedCategories(CATEGORIES);
    }
  }, []);

  const handleAddCategory = () => {
    if (newCategory.trim() && !savedCategories.includes(newCategory.trim())) {
      const updated = [...savedCategories, newCategory.trim()];
      setSavedCategories(updated);
      localStorage.setItem('jrmsu_book_categories', JSON.stringify(updated));
      setCategory(newCategory.trim());
      setNewCategory('');
      setIsAddingCategory(false);
    }
  };

  const handleRemoveCategory = (catToRemove: string) => {
    const updated = savedCategories.filter(c => c !== catToRemove);
    setSavedCategories(updated);
    localStorage.setItem('jrmsu_book_categories', JSON.stringify(updated));
    if (category === catToRemove) {
      setCategory(updated[0] || '');
    }
  };

  // Reset form fields whenever the modal opens or the book being edited changes
  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setAuthor(initialData?.author || '');
      setAccessionNumber(initialData?.accession_number || '');
      
      let fallbackCat = CATEGORIES[0];
      const stored = localStorage.getItem('jrmsu_book_categories');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) fallbackCat = parsed[0];
      }
      setCategory(initialData?.category || fallbackCat);
      
      setCoverImage(null);
      setIsAddingCategory(false);
      setNewCategory('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
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
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed backdrop-blur-sm inset-0 bg-black/60 ] flex items-center justify-center p-4 animate-modal-overlay z-[9999]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-modal-card">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 m-0">
            {initialData ? 'Edit Book' : 'Add New Book'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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

          <div className="grid grid-cols-2 gap-4">
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
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {savedCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {category && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveCategory(category)}
                        className="text-xs text-red-500 mt-1 hover:underline text-left"
                      >
                        Remove this category
                      </button>
                    )}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingCategory(true)}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 whitespace-nowrap"
                  >
                    + Add
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="New category name"
                    className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={handleAddCategory}
                    className="px-3 py-2 bg-navy text-white rounded hover:bg-blue-800"
                  >
                    Save
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setIsAddingCategory(false); setNewCategory(''); }}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Book Cover Image</label>
            
            {initialData && initialData.cover_image && !coverImage && (
              <div className="mb-3 flex items-center gap-3 p-2 border border-gray-200 rounded-md">
                <img src={getImageUrl(initialData.cover_image)} alt="Current cover" className="w-10 h-14 object-cover rounded" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/book-placeholder.png'; }} />
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
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-2"
              disabled={isSaving}
            >
              {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : null}
              {initialData ? 'Save Changes' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}


