import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload } from 'lucide-react';
import { DragDropFileUpload } from '@/src/Components/Shared/DragDropFileUpload';
import { BatchBook } from '@/src/Endpoints/batchApi';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  initialData?: BatchBook;
}

const CATEGORIES = ['Technology', 'History', 'Health Sciences', 'Computer Science', 'Science', 'Literature', 'General Reference'];

export function BookFormModal({ isOpen, onClose, onSubmit, initialData }: BookFormModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [accessionNumber, setAccessionNumber] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  // Reset form fields whenever the modal opens or the book being edited changes
  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setAuthor(initialData?.author || '');
      setAccessionNumber(initialData?.accession_number || '');
      setCategory(initialData?.category || CATEGORIES[0]);
      setCoverImage(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('accession_number', accessionNumber);
    formData.append('category', category);
    if (coverImage) {
      formData.append('cover_image', coverImage);
    }
    onSubmit(formData);
  };

  return createPortal(
    <div className="fixed backdrop-blur-sm inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-admin-modal-overlay">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-admin-modal-card">
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
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Book Cover Image</label>
            
            {initialData && initialData.cover_image && !coverImage && (
              <div className="mb-3 flex items-center gap-3 p-2 border border-gray-200 rounded-md">
                <img src={initialData.cover_image} alt="Current cover" className="w-10 h-14 object-cover rounded" />
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
          
          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-navy text-white rounded-md hover:bg-blue-800 font-medium transition-colors"
            >
              {initialData ? 'Save Changes' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
