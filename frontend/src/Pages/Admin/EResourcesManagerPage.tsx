import React, { useState, useEffect } from 'react';
import { eresourceApi, EResourceDepartment, EResourceFile } from '@/src/Endpoints/eresourceApi';
import { Save, Plus, Trash2, Edit2, FolderOpen, FileText, ChevronRight, ChevronDown } from 'lucide-react';

export default function EResourcesManagerPage() {
  const [departments, setDepartments] = useState<EResourceDepartment[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);

  // Modals
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<EResourceDepartment | null>(null);
  
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await eresourceApi.getAllDepartments();
      setDepartments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = (id: number) => {
    const newSet = new Set(expandedFolders);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedFolders(newSet);
  };

  const handleSaveDept = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parentIdStr = fd.get('parent') as string;
    const payload = {
      name: fd.get('name') as string,
      parent: parentIdStr ? parseInt(parentIdStr, 10) : null
    };

    try {
      if (editingDept) {
        await eresourceApi.updateDepartment(editingDept.id, payload);
      } else {
        await eresourceApi.createDepartment(payload);
      }
      setIsDeptModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to save department.');
    }
  };

  const handleDeleteDept = async (id: number) => {
    if (!confirm('Delete this department and all its contents?')) return;
    try {
      await eresourceApi.deleteDepartment(id);
      if (selectedDeptId === id) setSelectedDeptId(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDeptId) return;

    const fd = new FormData(e.currentTarget);
    fd.append('department', selectedDeptId.toString());

    try {
      await eresourceApi.createFile(fd);
      setIsFileModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to upload file.');
    }
  };

  const handleDeleteFile = async (id: number) => {
    if (!confirm('Delete this file?')) return;
    try {
      await eresourceApi.deleteFile(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const renderTree = (depts: EResourceDepartment[], level = 0) => {
    return depts.map(dept => {
      const isExpanded = expandedFolders.has(dept.id);
      const isSelected = selectedDeptId === dept.id;
      return (
        <div key={dept.id} style={{ marginLeft: `${level * 16}px`, marginBottom: '4px' }}>
          <div 
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`}
            onClick={() => setSelectedDeptId(dept.id)}
          >
            <div className="flex items-center gap-2 flex-1 overflow-hidden" onClick={(e) => { e.stopPropagation(); toggleFolder(dept.id); }}>
              {dept.sub_departments && dept.sub_departments.length > 0 ? (
                isExpanded ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />
              ) : <span className="w-4" />}
              <FolderOpen size={18} className="text-yellow-500" />
              <span className="font-medium text-gray-800 truncate">{dept.name}</span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: isSelected ? 1 : undefined }}>
               <button 
                  onClick={(e) => { e.stopPropagation(); setEditingDept(dept); setIsDeptModalOpen(true); }} 
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
               ><Edit2 size={14}/></button>
               <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteDept(dept.id); }} 
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
               ><Trash2 size={14}/></button>
            </div>
          </div>
          {isExpanded && dept.sub_departments && (
            <div className="mt-1">
              {renderTree(dept.sub_departments, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const findDeptById = (depts: EResourceDepartment[], id: number): EResourceDepartment | null => {
    for (const d of depts) {
      if (d.id === id) return d;
      if (d.sub_departments) {
        const found = findDeptById(d.sub_departments, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedDept = selectedDeptId ? findDeptById(departments, selectedDeptId) : null;

  return (
    <>
      <div className="admin-content__header">
        <h1>E-Resources Manager</h1>
        <p>Manage the E-Resources tree view and external databases.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tree Sidebar */}
        <div className="w-full lg:w-1/3 bg-white border border-gray-200 rounded-xl flex flex-col shadow-sm" style={{ minHeight: '600px' }}>
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-xl">
            <h2 className="font-semibold text-gray-800">Departments</h2>
            <button 
              onClick={() => { setEditingDept(null); setIsDeptModalOpen(true); }}
              className="text-sm flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded text-gray-700 hover:bg-gray-50"
            >
              <Plus size={14} /> Add Folder
            </button>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            {departments.length === 0 ? (
              <p className="text-gray-500 text-sm text-center mt-8">No departments found.</p>
            ) : (
              renderTree(departments)
            )}
          </div>
        </div>

        {/* Files Area */}
        <div className="w-full lg:w-2/3 bg-white border border-gray-200 rounded-xl shadow-sm">
          {selectedDept ? (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-xl">
                <div>
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FolderOpen size={18} className="text-yellow-500" />
                    {selectedDept.name}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">{selectedDept.files?.length || 0} files in this folder</p>
                </div>
                <button 
                  onClick={() => setIsFileModalOpen(true)}
                  className="admin-btn admin-btn--primary flex items-center gap-2"
                >
                  <Plus size={16} /> Upload File
                </button>
              </div>
              <div className="p-6">
                {!selectedDept.files || selectedDept.files.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No files uploaded to this department yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {selectedDept.files.map(file => (
                      <div key={file.id} className="border border-gray-200 p-4 rounded-xl flex items-start gap-3 hover:border-blue-300 transition-colors group">
                        <FileText size={24} className="text-blue-500 shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate" title={file.title}>{file.title}</h4>
                          <p className="text-xs text-gray-500 mt-1 mb-3">{new Date(file.created_at).toLocaleDateString()}</p>
                          <div className="flex items-center gap-2">
                            <a href={file.file} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">Download</a>
                            <button onClick={() => handleDeleteFile(file.id)} className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-32">
              <FolderOpen size={64} className="mb-4 opacity-30" />
              <p className="text-lg font-medium text-gray-500">Select a folder</p>
              <p className="text-sm text-gray-400">Click a department on the left to view its files.</p>
            </div>
          )}
        </div>
      </div>

      {/* Dept Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editingDept ? 'Edit Folder' : 'Add Folder'}</h2>
              <button onClick={() => setIsDeptModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleSaveDept} className="p-4 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Folder Name</label>
                <input required type="text" name="name" defaultValue={editingDept?.name || ''} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Parent Folder (Optional)</label>
                <select name="parent" defaultValue={editingDept?.parent || ''} className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                  <option value="">-- None (Root Folder) --</option>
                  {/* Flatten all departments for the dropdown (simple version) */}
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select a parent folder to nest this department inside it.</p>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsDeptModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Modal */}
      {isFileModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Upload File to {selectedDept?.name}</h2>
              <button onClick={() => setIsFileModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleUploadFile} className="p-4 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input required type="text" name="title" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">File</label>
                <input required type="file" name="file" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input type="checkbox" name="is_active" defaultChecked={true} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                <span className="text-sm font-medium text-gray-700">File is Active</span>
              </label>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsFileModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}