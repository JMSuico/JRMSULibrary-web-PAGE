import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PackageOpen, X, Save } from 'lucide-react';
import { AcquisitionBatch } from '@/src/Endpoints/batchApi';

interface EditBatchModalProps {
  isOpen: boolean;
  batch: AcquisitionBatch | null;
  onClose: () => void;
  onSubmit: (id: number, data: Partial<AcquisitionBatch>) => Promise<void>;
}

export function EditBatchModal({ isOpen, batch, onClose, onSubmit }: EditBatchModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && batch) {
      setName(batch.name);
      setDescription(batch.description || '');
    }
  }, [isOpen, batch]);

  if (!isOpen || !batch) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSubmit(batch.id, { name: name.trim(), description: description.trim() });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="fixed backdrop-blur-sm inset-0 ] flex items-center justify-center p-4 bg-black/60 animate-modal-overlay z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 text-gray-900">
            <PackageOpen size={18} className="text-navy" />
            <h2 className="text-lg font-semibold m-0">Edit Batch Details</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-navy text-white rounded-md hover:bg-blue-800 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}


