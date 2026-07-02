import React, { useState, useEffect } from 'react';
import { eresourceApi, EResourceDepartment, EResourceFile } from '@/src/Endpoints/eresourceApi';
import { Save, Plus, Trash2, Edit2, FolderOpen, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { useToast } from '@/src/Hooks/useToast';
import { useAutoRefresh } from '@/src/Hooks/useAutoRefresh';
import { useUndoDelete } from '@/src/Hooks/useUndoDelete';
import { DragDropFileUpload } from '@/src/Components/Shared/DragDropFileUpload';

export default function EResourcesManagerPage() {
  const [departments, setDepartments] = useState<EResourceDepartment[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);

  // Modals
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<EResourceDepartment | null>(null);
  
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { undoState, triggerDelete, cancelDelete, executeNow } = useUndoDelete();
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {
    setLoading(true);
    try {
      const data = await eresourceApi.getAllDepartments();
      setDepartments(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(loadData, 60000);

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
      showToast(`Department ${editingDept ? 'updated' : 'created'} successfully`, 'success');
      setIsDeptModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save department', 'error');
    }
  };

  const handleDeleteDept = (id: number) => {
    // Find department in tree recursively to get name
    let deptToDelete: EResourceDepartment | null = null;
    const findDept = (depts: EResourceDepartment[]) => {
      for (const d of depts) {
        if (d.id === id) {
          deptToDelete = d;
          return;
        }
        if (d.children) findDept(d.children);
      }
    };
    findDept(departments);

    if (!deptToDelete) return;

    triggerDelete(
      deptToDelete.name,
      async () => {
        try {
          await eresourceApi.deleteDepartment(id);
        } catch (err: any) {
          loadData(); // Revert optimistic delete by reloading
          showToast(err.message || 'Failed to delete department', 'error');
        }
      },
      () => {
        loadData(); // Reload to revert optimistic delete
        showToast('Department restoration undone', 'success');
      }
    );

    // Optimistic delete
    if (selectedDeptId === id) setSelectedDeptId(null);
    const filterDept = (depts: EResourceDepartment[]): EResourceDepartment[] => {
      return depts.filter(d => d.id !== id).map(d => ({
        ...d,
        children: d.children ? filterDept(d.children) : []
      }));
    };
    setDepartments(prev => filterDept(prev));
  };

  const handleUploadFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDeptId) return;
    if (!selectedFile) {
      showToast('Please select a file to upload', 'error');
      return;
    }

    const fd = new FormData(e.currentTarget);
    fd.append('department', selectedDeptId.toString());
    fd.append('file', selectedFile);

    try {
      await eresourceApi.createFile(fd);
      showToast('File uploaded successfully', 'success');
      setIsFileModalOpen(false);
      setSelectedFile(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to upload file', 'error');
    }
  };

  const handleDeleteFile = (id: number) => {
    // Need to find the file from the selected department
    let fileToDelete: EResourceFile | null = null;
    const findFile = (depts: EResourceDepartment[]) => {
      for (const d of depts) {
        if (d.files) {
          const f = d.files.find(file => file.id === id);
          if (f) fileToDelete = f;
        }
        if (d.children) findFile(d.children);
      }
    };
    findFile(departments);
    if (!fileToDelete) return;

    triggerDelete(
      fileToDelete.name,
      async () => {
        try {
          await eresourceApi.deleteFile(id);
        } catch (err: any) {
          loadData(); // Revert optimistic delete by reloading
          showToast(err.message || 'Failed to delete file', 'error');
        }
      },
      () => {
        loadData(); // Reload to revert optimistic delete
        showToast('File restoration undone', 'success');
      }
    );

    // Optimistic delete
    const removeFileFromDept = (depts: EResourceDepartment[]): EResourceDepartment[] => {
      return depts.map(d => ({
        ...d,
        files: d.files?.filter(f => f.id !== id),
        children: d.children ? removeFileFromDept(d.children) : []
      }));
    };
    setDepartments(prev => removeFileFromDept(prev));
  };

  const renderTree = (depts: EResourceDepartment[], level = 0) => {
    return depts.map(dept => {
      const isExpanded = expandedFolders.has(dept.id);
      const isSelected = selectedDeptId === dept.id;
      const hasChildren = dept.children && dept.children.length > 0;

      return (
        <div key={dept.id} style={{ marginLeft: `${level * 16}px`, marginBottom: '2px' }}>
          <div
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer group transition-colors ${
              isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
            }`}
            onClick={() => {
              setSelectedDeptId(dept.id);
              // Auto-expand when selecting a folder that has children
              if (hasChildren && !expandedFolders.has(dept.id)) {
                toggleFolder(dept.id);
              }
            }}
          >
            <div className="flex items-center gap-1 flex-1 overflow-hidden min-w-0">
              {/* Chevron toggles expand/collapse ONLY — stops propagation so row click still fires */}
              <span
                className="w-5 h-5 flex items-center justify-center shrink-0 rounded hover:bg-gray-200 transition-colors"
                onClick={(e) => { e.stopPropagation(); toggleFolder(dept.id); }}
              >
                {hasChildren ? (
                  isExpanded
                    ? <ChevronDown size={14} className="text-gray-500" />
                    : <ChevronRight size={14} className="text-gray-500" />
                ) : null}
              </span>
              <FolderOpen size={16} className={`shrink-0 ${isSelected ? 'text-yellow-500' : 'text-yellow-400'}`} />
              <span className="font-medium text-gray-800 truncate text-sm" title={dept.name}>{dept.name}</span>
              {dept.files && dept.files.length > 0 && (
                <span className="ml-1 text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full shrink-0">
                  {dept.files.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); setEditingDept(dept); setIsDeptModalOpen(true); }}
                className="p-1 text-blue-600 hover:bg-blue-100 rounded cursor-pointer border-none bg-transparent"
                title="Edit folder"
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteDept(dept.id); }}
                className="p-1 text-red-600 hover:bg-red-100 rounded cursor-pointer border-none bg-transparent"
                title="Delete folder"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          {isExpanded && dept.children && (
            <div className="border-l border-gray-200 ml-4 pl-1 mt-1">
              {renderTree(dept.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };


  const findDeptById = (depts: EResourceDepartment[], id: number): EResourceDepartment | null => {
    for (const d of depts) {
      if (d.id === id) return d;
      if (d.children) {
        const found = findDeptById(d.children, id);
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
              /* API now returns only root-level departments with nested children */
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
              <div className="p-4 overflow-y-auto" style={{ minHeight: '400px' }}>
                {!selectedDept.files || selectedDept.files.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No files in this folder.</p>
                    <p className="text-sm mt-1">Click "Upload File" to add files here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {selectedDept.files.map(file => {
                      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
                      const isPdf = ext === 'pdf';
                      const isDoc = ['doc', 'docx'].includes(ext);
                      const iconColor = isPdf ? 'text-red-500' : isDoc ? 'text-blue-600' : 'text-gray-500';
                      const createdLabel = file.created_at
                        ? new Date(file.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
                        : 'Migrated file';
                      return (
                        <div key={file.id} className={`border rounded-xl p-3 flex items-start gap-3 group transition-all hover:shadow-md ${
                          file.is_active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
                        }`}>
                          <div className={`shrink-0 mt-0.5 ${iconColor}`}>
                            <FileText size={22} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm leading-snug" style={{ wordBreak: 'break-word' }}>{file.name}</h4>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                isPdf ? 'bg-red-50 text-red-600' : isDoc ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                              }`}>{ext || 'file'}</span>
                              {!file.is_active && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-700">Hidden</span>
                              )}
                              <span className="text-[10px] text-gray-400">{createdLabel}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <a
                                href={file.file.startsWith('http') ? file.file : `http://127.0.0.1:8000${file.file}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100"
                                onClick={(e) => e.stopPropagation()}
                              >Open</a>
                              <button
                                onClick={() => handleDeleteFile(file.id)}
                                className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
                              >Delete</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">{editingDept ? 'Edit Folder' : 'Add Folder'}</h2>
              <button onClick={() => setIsDeptModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer">×</button>
            </div>
            <form onSubmit={handleSaveDept} className="p-4 flex flex-col gap-4 overflow-y-auto">
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Upload File to {selectedDept?.name}</h2>
              <button onClick={() => { setIsFileModalOpen(false); setSelectedFile(null); }} className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer">×</button>
            </div>
            <form onSubmit={handleUploadFile} className="p-4 flex flex-col gap-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                <input required type="text" name="name" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">File</label>
                <DragDropFileUpload
                  accept="*/*"
                  multiple={false}
                  maxSizeMB={25}
                  onFilesSelected={(files) => setSelectedFile(files[0])}
                  label="Click to upload file or drag and drop"
                  subLabel="Maximum file size: 25MB"
                />
                {selectedFile && (
                  <p className="text-sm font-medium text-green-600 mt-2">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input type="checkbox" name="is_active" defaultChecked={true} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                <span className="text-sm font-medium text-gray-700">File is Active</span>
              </label>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setIsFileModalOpen(false); setSelectedFile(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg" disabled={!selectedFile}>Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
        {/* Undo Delete Toast */}
      {undoState && (
        <div className="fixed bottom-6 right-6 z-[60] bg-white rounded-lg shadow-xl border border-gray-100 p-4 w-80 flex flex-col gap-3 animate-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Item deleted</p>
              <p className="text-xs text-gray-500 mt-0.5"><span className="font-medium text-gray-700">{undoState.itemName}</span> has been moved to the recycle bin.</p>
            </div>
            <button 
              onClick={() => cancelDelete()}
              className="text-sm font-bold text-[#002B7F] hover:text-[#001655] px-2 py-1 bg-blue-50 rounded"
            >
              Undo
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500"
              style={{ 
                width: `${(undoState.timeLeft / 3000) * 100}%`,
                transition: 'width 100ms linear'
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}