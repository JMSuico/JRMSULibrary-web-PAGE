import React, { useState, useEffect } from 'react';
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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <PackageOpen size={20} className="text-[#002B7F]" />
            <h2 className="text-lg font-bold text-gray-900">Edit Batch</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Batch Name <span className="text-red-500">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#002B7F] focus:border-transparent outline-none transition-all" placeholder="e.g. Q1 2026 Acquisitions" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#002B7F] focus:border-transparent outline-none transition-all resize-none" placeholder="Brief description of this batch..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium transition-colors cursor-pointer">Cancel</button>
            <button type="submit" disabled={saving || !name.trim()} className="px-5 py-2 bg-[#002B7F] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#001655] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
