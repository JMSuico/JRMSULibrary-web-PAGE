import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  referenceApi,
  ResearchReference,
  PaginatedReferences,
  RESEARCH_DEPARTMENTS,
  ResearchDepartment,
} from '@/src/Endpoints/referenceApi';
import { Search, Plus, Edit2, Trash2, X, Save, Upload } from 'lucide-react';
import { useToast } from '@/src/Hooks/useToast';
import { useUndoDelete } from '@/src/Hooks/useUndoDelete';
import { UndoDeleteToast } from '@/src/Components/Shared/UndoDeleteToast';
import { useDebounce } from '@/src/Hooks/useDebounce';
import { Pagination } from '@/src/Components/Shared/Pagination';
import { ExcelUploadModal } from '@/src/Features/Admin/components/ExcelUploadModal';
import { DragDropFileUpload } from '@/src/Components/Shared/DragDropFileUpload';
import { Link, Loader2, CheckCircle2 } from 'lucide-react';
import { useDraggableScroll } from '@/src/Hooks/useDraggableScroll';
import { useChunkedSync } from '@/src/Hooks/useChunkedSync';

const DEPT_SHORT: Record<string, string> = {
  'Research of Bachelor of Science in Forestry (BSF)': 'BSF',
  'Research Books for Bachelor of Science in Computer Science': 'BSCS',
  'Research Books for Agri. Business Management': 'ABM',
  'Narrative Report of Secondary Education': 'Secondary Ed.',
};

export function ResearchReferencesManager() {
  const [data, setData] = useState<PaginatedReferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingRef, setEditingRef] = useState<ResearchReference | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { state: syncState, startSync, cancelSync, resetSync } = useChunkedSync(() => {
    loadData();
    setTimeout(() => {
      resetSync();
      setIsUploadModalOpen(false);
    }, 3000); // clear toast after 3 seconds
  });

  // Controlled category inside the Add/Edit form (to drive department enable/disable)
  const [formCategory, setFormCategory] = useState<string>('Research for College Student in JRMSU');
  
  // Access type fields
  const [accessType, setAccessType] = useState<'none' | 'link' | 'file'>('none');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const { showToast } = useToast();
  const { undoState, triggerDelete, cancelDelete, executeNow } = useUndoDelete();
  const scrollRef = useDraggableScroll<HTMLDivElement>();

  const limit = 20;

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await referenceApi.getAllReferences(page, limit, debouncedSearch, filterCategory, filterDepartment);
      setData(result);
      // Clear selections when page changes
      setSelectedIds(new Set());
    } catch (err: any) {
      showToast(err.message || 'Failed to load references', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, debouncedSearch, filterCategory, filterDepartment]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterCategory(e.target.value);
    setFilterDepartment('All');
    setPage(1);
  };

  const handleFilterDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterDepartment(e.target.value);
    setPage(1);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const catValue = fd.get('category') as string;
    const deptValue = fd.get('department') as string;

    const payload: Partial<ResearchReference> = {
      category: catValue as any,
      department: (catValue === 'Research for College Student in JRMSU' && deptValue)
        ? deptValue as ResearchDepartment
        : null,
      no: fd.get('no') ? parseInt(fd.get('no') as string) : null,
      acc_no: fd.get('acc_no') as string || null,
      call_number: fd.get('call_number') as string || null,
      title: fd.get('title') as string,
      author: fd.get('author') as string || null,
      copyright: fd.get('copyright') as string || null,
      remarks: fd.get('remarks') as string || null,
      resource_status: fd.get('resource_status') as string || null,
      inventory_year: fd.get('inventory_year') as string || null,
      access_type: accessType,
      access_link: accessType === 'link' ? fd.get('access_link') as string : null,
    };

    setIsSaving(true);
    try {
      let savedRef: ResearchReference;
      
      if (editingRef) {
        // If changing access type from file to something else, remove file explicitly
        if (editingRef.access_type === 'file' && accessType !== 'file') {
          await referenceApi.removeReferenceFile(editingRef.id);
        }
        savedRef = await referenceApi.updateReference(editingRef.id, payload);
        showToast('Reference updated successfully', 'success');
      } else {
        savedRef = await referenceApi.createReference(payload);
        showToast('Reference created successfully', 'success');
      }

      // Handle file upload if type is file and a new file was selected
      if (accessType === 'file' && selectedFile) {
        const fileData = new FormData();
        fileData.append('access_file', selectedFile);
        await referenceApi.uploadReferenceFile(savedRef.id, fileData);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save reference', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (ref: ResearchReference) => {
    // Optimistic delete
    if (data) {
      setData({
        ...data,
        results: data.results.filter(r => r.id !== ref.id)
      });
    }

    triggerDelete(
      ref.title,
      async () => {
        try {
          await referenceApi.deleteReference(ref.id);
          loadData();
        } catch (err: any) {
          showToast(err.message || 'Failed to delete reference', 'error');
          loadData();
        }
      },
      () => {
        showToast('Deletion undone', 'success');
        loadData();
      }
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && data) {
      setSelectedIds(new Set(data.results.map(r => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    
    // Optimistic delete
    if (data) {
      setData({
        ...data,
        results: data.results.filter(r => !selectedIds.has(r.id))
      });
    }

    triggerDelete(
      `${selectedIds.size} references`,
      async () => {
        try {
          setIsDeletingBulk(true);
          await referenceApi.bulkDeleteReferences(Array.from(selectedIds));
          setSelectedIds(new Set());
          loadData();
        } catch (err: any) {
          showToast(err.message || 'Failed to delete references', 'error');
          loadData();
        } finally {
          setIsDeletingBulk(false);
        }
      },
      () => {
        showToast('Bulk deletion undone', 'success');
        loadData();
      }
    );
  };

  const openModal = (ref: ResearchReference | null = null) => {
    setEditingRef(ref);
    setFormCategory(ref?.category || 'Research for College Student in JRMSU');
    setAccessType(ref?.access_type || 'none');
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const isStudentResearch = formCategory === 'Research for College Student in JRMSU';

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search title, author..."
              value={search}
              onChange={handleSearch}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56 text-sm"
            />
          </div>

          <select
            value={filterCategory}
            onChange={handleFilterCategoryChange}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="All">All Categories</option>
            <option value="Research for College Student in JRMSU">Student Research</option>
            <option value="Thesis and Dissertation">Thesis & Dissertation</option>
          </select>

          {/* Department filter — only meaningful when category is Student Research */}
          <select
            value={filterDepartment}
            onChange={handleFilterDepartmentChange}
            disabled={filterCategory === 'Thesis and Dissertation'}
            className={`px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-opacity ${
              filterCategory === 'Thesis and Dissertation' ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <option value="All">All Departments</option>
            {RESEARCH_DEPARTMENTS.map(d => (
              <option key={d} value={d}>{DEPT_SHORT[d] ?? d}</option>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex gap-2 items-center">
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isDeletingBulk}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeletingBulk ? <><Loader2 size={16} className="animate-spin" /> Deleting...</> : <><Trash2 size={16} /> Delete Selected ({selectedIds.size})</>}
              </button>
            )}
            <button
              disabled={syncState.isActive}
              onClick={() => setIsUploadModalOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${syncState.isActive ? 'text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed' : 'text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'}`}
            >
              <Upload size={16} />
              {syncState.isActive ? 'Sync in Progress...' : 'Upload Excel / CSV'}
            </button>
            {syncState.isActive && !isUploadModalOpen && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
              >
                View Sync Progress
              </button>
            )}
            <button
              onClick={() => openModal()}
              className="admin-btn admin-btn--primary flex items-center gap-2"
            >
              <Plus size={16} /> Add Reference
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-scroll" ref={scrollRef}>
        <table className="admin-table min-w-[1300px]">
          <thead>
            <tr>
              <th className="w-10 text-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  checked={data?.results.length ? selectedIds.size === data.results.length : false}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="w-12">No.</th>
              <th className="w-24">Acc No.</th>
              <th className="w-24">Call No.</th>
              <th className="w-64">Title</th>
              <th className="w-40">Author</th>
              <th className="w-28">Category</th>
              <th className="w-24">Dept.</th>
              <th className="w-20">Copyright</th>
              <th className="w-28">Status</th>
              <th className="w-32">Access</th>
              <th className="w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && !data ? (
              <tr><td colSpan={10} className="text-center py-8 text-gray-500">Loading references...</td></tr>
            ) : data?.results.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-8 text-gray-500">No references found.</td></tr>
            ) : (
              data?.results.map((ref) => (
                <tr key={ref.id} className="hover:bg-gray-50">
                  <td className="text-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={selectedIds.has(ref.id)}
                      onChange={() => handleSelectOne(ref.id)}
                    />
                  </td>
                  <td>{ref.no || '-'}</td>
                  <td>{ref.acc_no || '-'}</td>
                  <td>{ref.call_number || '-'}</td>
                  <td className="font-medium text-gray-900">{ref.title}</td>
                  <td>{ref.author || '-'}</td>
                  <td>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                      ref.category === 'Thesis and Dissertation'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {ref.category === 'Thesis and Dissertation' ? 'Thesis' : 'Research'}
                    </span>
                  </td>
                  <td>
                    {ref.department ? (
                      <span className="text-[10px] px-2 py-1 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                        {DEPT_SHORT[ref.department] ?? ref.department}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td>{ref.copyright || '-'}</td>
                  <td>
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {ref.resource_status || 'Available'}
                    </span>
                  </td>
                  <td>
                    {ref.access_type === 'none' && (
                      <span className="text-[10px] px-2 py-1 rounded bg-gray-100 text-gray-500 font-medium whitespace-nowrap">Not Available</span>
                    )}
                    {ref.access_type === 'link' && (
                      <a href={ref.access_link || '#'} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200 flex items-center gap-1 w-max">
                        <Link size={10} /> Link Available
                      </a>
                    )}
                    {ref.access_type === 'file' && (
                      <span className="text-[10px] px-2 py-1 rounded bg-blue-50 text-blue-700 font-medium border border-blue-200 whitespace-nowrap">
                        File Attached
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => openModal(ref)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors cursor-pointer" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(ref)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors cursor-pointer" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.total_pages > 0 && (
        <div className="mt-6 flex justify-end">
          <Pagination
            currentPage={data.current_page}
            totalPages={data.total_pages}
            totalItems={data.count}
            itemsPerPage={limit}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-modal-overlay z-[9999]" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-modal-card" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 z-10 p-6 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-gray-900">{editingRef ? 'Edit Reference' : 'Add New Reference'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Category */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-sm"
                  >
                    <option value="Research for College Student in JRMSU">Research for College Student in JRMSU</option>
                    <option value="Thesis and Dissertation">Thesis and Dissertation</option>
                  </select>
                </div>

                {/* Department — enabled only for student research */}
                <div className="col-span-1 md:col-span-2">
                  <label className={`block text-sm font-semibold mb-2 transition-colors ${isStudentResearch ? 'text-gray-700' : 'text-gray-300'}`}>
                    Department {isStudentResearch ? '*' : '(not applicable for Thesis)'}
                  </label>
                  <select
                    name="department"
                    defaultValue={editingRef?.department || ''}
                    disabled={!isStudentResearch}
                    required={isStudentResearch}
                    className={`w-full px-4 py-2.5 border rounded-lg outline-none text-sm transition-all ${
                      isStudentResearch
                        ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900'
                        : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <option value="">Select department...</option>
                    {RESEARCH_DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {!isStudentResearch && (
                    <p className="text-xs text-gray-400 mt-1">Department is only available for student research records.</p>
                  )}
                </div>

                {/* Title */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                  <input type="text" name="title" defaultValue={editingRef?.title} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="Enter title" />
                </div>

                {/* Author */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Author</label>
                  <input type="text" name="author" defaultValue={editingRef?.author || ''} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="Enter author(s)" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Accession No.</label>
                  <input type="text" name="acc_no" defaultValue={editingRef?.acc_no || ''} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="e.g. 12345" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Call Number</label>
                  <input type="text" name="call_number" defaultValue={editingRef?.call_number || ''} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="e.g. QA 76.73" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">No.</label>
                  <input type="number" name="no" defaultValue={editingRef?.no || ''} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="Numeric identifier" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Copyright Year</label>
                  <input type="text" name="copyright" defaultValue={editingRef?.copyright || ''} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="e.g. 2023" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Resource Status</label>
                  <input type="text" name="resource_status" defaultValue={editingRef?.resource_status || ''} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="e.g. Available, Lost, Damaged" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Inventory Year</label>
                  <input type="text" name="inventory_year" defaultValue={editingRef?.inventory_year || ''} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="e.g. 2026" />
                </div>

                <div className="col-span-1 md:col-span-2 pt-4 border-t border-gray-100 mt-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Soft Copy / Link Access</label>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="access_type_radio" checked={accessType === 'none'} onChange={() => setAccessType('none')} className="text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm font-medium text-gray-700">No Access</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="access_type_radio" checked={accessType === 'link'} onChange={() => setAccessType('link')} className="text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm font-medium text-gray-700">Online Link</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="access_type_radio" checked={accessType === 'file'} onChange={() => setAccessType('file')} className="text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm font-medium text-gray-700">Upload File</span>
                    </label>
                  </div>

                  {accessType === 'link' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <input type="url" name="access_link" defaultValue={editingRef?.access_link || ''} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="https://example.com/document" />
                    </div>
                  )}

                  {accessType === 'file' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <DragDropFileUpload
                        onFileSelect={(file) => setSelectedFile(file)}
                        selectedFile={selectedFile}
                        onClear={() => setSelectedFile(null)}
                        accept=".pdf,.ppt,.pptx,.docx,.pub"
                        maxSizeMB={50}
                        helperText="Accepts PDF, DOCX, PPTX, PUB up to 50MB"
                      />
                      {editingRef?.access_file && !selectedFile && (
                        <p className="text-xs text-blue-600 mt-2 font-medium">Currently attached: {editingRef.access_file.split('/').pop()}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
                  <textarea name="remarks" defaultValue={editingRef?.remarks || ''} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm" placeholder="Any additional notes..." />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-gray-700 font-medium bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-6 py-2.5 text-white font-medium bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm cursor-pointer">
                  <Save size={18} /> {isSaving ? 'Saving...' : 'Save Reference'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Excel/CSV Upload Modal */}
      {isUploadModalOpen && (
        <ExcelUploadModal
          onClose={() => {
            setIsUploadModalOpen(false);
            if (!syncState.isActive && syncState.finalResult) {
              resetSync();
            }
          }}
          syncState={syncState}
          startSync={startSync}
          cancelSync={cancelSync}
        />
      )}

      {/* Sync Toast Notification */}
      {syncState.message && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`shadow-lg rounded-xl border p-4 flex items-center gap-3 ${syncState.isCancelled ? 'bg-red-50 border-red-200' : syncState.isActive ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200'}`}>
            {syncState.isActive ? (
              <Loader2 className="animate-spin text-blue-600" size={24} />
            ) : syncState.isCancelled ? (
              <X className="text-red-600" size={24} />
            ) : (
              <CheckCircle2 className="text-emerald-600" size={24} />
            )}
            <div>
              <p className={`font-semibold text-sm ${syncState.isCancelled ? 'text-red-800' : syncState.isActive ? 'text-blue-800' : 'text-emerald-800'}`}>
                {syncState.message}
              </p>
              {syncState.totalRecords > 0 && syncState.isActive && (
                <p className="text-xs text-blue-600/80 mt-0.5">
                  Processing chunked records in background...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <UndoDeleteToast 
        undoState={undoState} 
        onUndo={cancelDelete} 
        onExecuteNow={executeNow} 
      />
    </div>
  );
}
