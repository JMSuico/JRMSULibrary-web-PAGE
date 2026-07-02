import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Clock, Search, FileArchive } from 'lucide-react';
import { recycleApi, RecycleBinItem } from '@/src/Endpoints/recycleApi';
import { useToast } from '@/src/Hooks/useToast';
import { ConfirmModal } from '@/src/Features/Admin/components/ConfirmModal';
import { useDebounce } from '@/src/Hooks/useDebounce';

export default function RecycleBinPage() {
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null);
  
  const { showToast } = useToast();
  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await recycleApi.getAll();
      setItems(data);
    } catch (err: any) {
      showToast('Failed to load recycle bin', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleRestore = async (id: number) => {
    try {
      await recycleApi.restore(id);
      showToast('Item restored successfully', 'success');
      fetchItems();
    } catch (err: any) {
      showToast(err.message || 'Failed to restore item', 'error');
    }
  };

  const handleDelete = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Permanently',
      message: 'Are you sure you want to permanently delete this item? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await recycleApi.deletePermanently(id);
          showToast('Item deleted permanently', 'success');
          fetchItems();
        } catch (err: any) {
          showToast('Failed to delete item', 'error');
        }
      }
    });
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesModule = moduleFilter === 'ALL' || item.source_module === moduleFilter;
    return matchesSearch && matchesModule;
  });

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
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="ALL">All Modules</option>
              <option value="BOOKS">Books</option>
              <option value="GALLERY">Sections</option>
              <option value="BATCH">Batches (Newly Acquired)</option>
            </select>
          </div>
        </div>

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
                  <th>Item Name</th>
                  <th>Module</th>
                  <th>Deleted At</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="font-medium text-gray-800">{item.item_name}</div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        item.source_module === 'BOOKS'
                          ? 'bg-blue-100 text-blue-800'
                          : item.source_module === 'BATCH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item.source_module === 'BATCH' ? 'Batch' : item.source_module.toLowerCase()}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock size={14} className="mr-1.5" />
                        {new Date(item.deleted_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: 'numeric', minute: '2-digit'
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
                ))}
              </tbody>
            </table>
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
