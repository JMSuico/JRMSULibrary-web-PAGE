import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Clock, Search, FileArchive } from 'lucide-react';
import { recycleApi, RecycleBinItem } from '@/src/Endpoints/recycleApi';
import { useToast } from '@/src/Hooks/useToast';
import { ConfirmModal } from '@/src/Features/Admin/components/ConfirmModal';
import { useDebounce } from '@/src/Hooks/useDebounce';
import { Pagination } from '@/src/Components/Shared/Pagination';

export function RecycleBin() {
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedItems.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;
    try {
      setLoading(true);
      await Promise.all(selectedIds.map(id => recycleApi.restore(id)));
      showToast(`${selectedIds.length} items restored successfully`, 'success');
      setSelectedIds([]);
      fetchItems();
    } catch (err: any) {
      showToast('Failed to restore some items', 'error');
      fetchItems();
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: 'Delete Permanently',
      message: `Are you sure you want to permanently delete ${selectedIds.length} items? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setLoading(true);
          await Promise.all(selectedIds.map(id => recycleApi.deletePermanently(id)));
          showToast(`${selectedIds.length} items deleted permanently`, 'success');
          setSelectedIds([]);
          fetchItems();
        } catch (err: any) {
          showToast('Failed to delete some items', 'error');
          fetchItems();
        }
      }
    });
  };

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

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, moduleFilter]);

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
              <option value="REPORT">Generated Reports</option>
            </select>
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded hover:bg-blue-100 transition-colors"
              >
                <RotateCcw size={16} /> Restore All
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-white border border-red-200 rounded hover:bg-red-50 transition-colors"
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
                      checked={selectedIds.length > 0 && selectedIds.length === paginatedItems.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th>Item Name</th>
                  <th>Module</th>
                  <th>Deleted At</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <tr key={item.id} className={selectedIds.includes(item.id) ? 'bg-blue-50/50' : ''}>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleSelectOne(item.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
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
            
            {filteredItems.length > itemsPerPage && (
              <div className="p-4 border-t border-gray-100">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredItems.length}
                  itemsPerPage={itemsPerPage}
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


