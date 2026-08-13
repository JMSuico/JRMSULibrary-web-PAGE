import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { personnelApi } from '@/src/Endpoints/personnelApi';
import { Edit2, Plus, Search, Trash2, X } from 'lucide-react';
import { useToast } from '@/src/Hooks/useToast';
import { useUndoDelete } from '@/src/Hooks/useUndoDelete';
import { DragDropFileUpload } from '@/src/Components/Shared/DragDropFileUpload';
import { getImageUrl } from '@/src/Libs/apiClient';
import { UndoDeleteToast } from '@/src/Components/Shared/UndoDeleteToast';

export function PersonnelManager({ active }: { active: boolean }) {
  const [personnelList, setPersonnelList] = useState<any[]>([]);
  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  const [personnelPhoto, setPersonnelPhoto] = useState<File | null>(null);
  const [personnelPhotoPreview, setPersonnelPhotoPreview] = useState<string | null>(null);
  const [editingPersonnelId, setEditingPersonnelId] = useState<number | null>(null);
  const [isSavingPersonnel, setIsSavingPersonnel] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  const { showToast } = useToast();
  const { undoState, triggerDelete, cancelDelete, executeNow } = useUndoDelete();

  useEffect(() => {
    if (!active) return;
    loadPersonnel();
  }, [active]);

  const loadPersonnel = async () => {
    try {
      const data = await personnelApi.getPersonnel();
      setPersonnelList(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load personnel', 'error');
    }
  };

  const handleDeletePersonnel = async (id: number) => {
    const personToDelete = personnelList.find(p => p.id === id);
    if (!personToDelete) return;

    // Optimistic delete
    setPersonnelList(prev => prev.filter(p => p.id !== id));

    triggerDelete(
      personToDelete.name,
      async () => {
        try {
          await personnelApi.deletePersonnel(id);
        } catch (e: any) {
          setPersonnelList(prev => [...prev, personToDelete].sort((a,b) => a.order - b.order));
          showToast(e.message || 'Failed to delete personnel', 'error');
        }
      },
      () => {
        setPersonnelList(prev => [...prev, personToDelete].sort((a,b) => a.order - b.order));
        showToast('Personnel restoration undone', 'success');
      }
    );
  };

  const handlePersonnelSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSavingPersonnel) return;
    setIsSavingPersonnel(true);
    showToast('Saving personnel...', 'info');

    const formData = new FormData(e.currentTarget);
    
    try {
      if (personnelPhoto) {
        formData.append('photo', personnelPhoto);
      }

      if (editingPersonnelId) {
        const updated = await personnelApi.updatePersonnel(editingPersonnelId, formData);
        setPersonnelList(prev => prev.map(p => p.id === editingPersonnelId ? updated : p));
        showToast('Personnel updated successfully', 'success');
      } else {
        const created = await personnelApi.createPersonnel(formData);
        setPersonnelList(prev => [...prev, created].sort((a, b) => a.order - b.order));
        showToast('Personnel created successfully', 'success');
      }
      setIsPersonnelModalOpen(false);
      setEditingPersonnelId(null);
      setPersonnelPhoto(null);
      setPersonnelPhotoPreview(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to save personnel', 'error');
    } finally {
      setIsSavingPersonnel(false);
    }
  };

  const openEditPersonnel = (person: any) => {
    setEditingPersonnelId(person.id);
    setPersonnelPhoto(null);
    setPersonnelPhotoPreview(person.photo ? (getImageUrl(person.photo)) : null);
    setIsPersonnelModalOpen(true);
  };

  if (!active) return null;

  const chiefLibrarian = personnelList.find(p => p.order === 1) || { name: 'Kiara Keren M. Alavanza', title: 'Campus Librarian', photo: null };
  const staffList = personnelList.filter(p => p.order > 1).sort((a,b) => a.order - b.order);

  const renderConnectors = () => {
    const n = Math.min(staffList.length, 5);
    if (n === 0) return null;

    return (
      <div className="hidden lg:block w-full relative z-10 fade-up-entrance h-16 mb-4">
        {n > 1 && (
          <div className="absolute top-0 left-[calc(50%-1px)] w-[2px] h-[24px] bg-gold-light"></div>
        )}
        
        <div className={`grid ${getGridColsClass(n)} gap-4 w-full h-full`}>
          {Array.from({ length: n }).map((_, idx) => (
            <div key={idx} className="relative w-full h-full">
              
              {n === 1 ? (
                <div className="absolute top-0 left-[calc(50%-1px)] w-[2px] h-full bg-gold-light"></div>
              ) : (
                <>
                  {idx === 0 && (
                    <div 
                      className="absolute border-t-2 border-l-2 border-gold-light"
                      style={{
                        top: '24px',
                        right: '-24px',
                        left: 'calc(50% - 1px)',
                        height: '24px',
                        borderTopLeftRadius: '12px'
                      }}
                    ></div>
                  )}

                  {idx === n - 1 && (
                    <div 
                      className="absolute border-t-2 border-r-2 border-gold-light"
                      style={{
                        top: '24px',
                        left: '-24px',
                        right: 'calc(50% - 1px)',
                        height: '24px',
                        borderTopRightRadius: '12px'
                      }}
                    ></div>
                  )}

                  {idx > 0 && idx < n - 1 && (
                    <>
                      <div 
                        className="absolute bg-gold-light"
                        style={{
                          top: '24px',
                          left: '-24px',
                          right: '-24px',
                          height: '2px'
                        }}
                      ></div>
                      <div 
                        className="absolute bg-gold-light"
                        style={{
                          top: '24px',
                          left: 'calc(50% - 1px)',
                          width: '2px',
                          height: '24px'
                        }}
                      ></div>
                    </>
                  )}
                </>
              )}
              
              <span 
                className="material-symbols-outlined text-gold-light text-xl absolute left-1/2 -translate-x-1/2 leading-none bg-transparent rounded-full z-10 font-bold"
                style={{ top: '44px' }}
              >
                arrow_downward
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getGridColsClass = (n: number) => {
    if (n === 1) return 'grid-cols-1 lg:grid-cols-1 max-w-sm mx-auto';
    if (n === 2) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-2xl mx-auto';
    if (n === 3) return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-3 max-w-4xl mx-auto';
    if (n === 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto';
    if (n >= 5) return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5 max-w-7xl mx-auto';
    return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-3 max-w-4xl mx-auto';
  };

  return (
    <>
      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 relative">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', position: 'absolute', top: '16px', right: '16px' }}>
          <button 
            className={`admin-btn flex items-center gap-2 ${staffList.length >= 5 ? 'bg-blue-300 text-white cursor-not-allowed border-none opacity-70' : 'admin-btn--primary'}`}
            onClick={() => {
              if (staffList.length < 5) {
                setEditingPersonnelId(null);
                setPersonnelPhoto(null);
                setPersonnelPhotoPreview(null);
                setIsPersonnelModalOpen(true);
              }
            }}
            disabled={staffList.length >= 5}
            title={staffList.length >= 5 ? "Maximum 5 modals reached. Cannot add more." : `Add personnel modal (${5 - staffList.length} limit left)`}
          >
            <Plus size={16} /> Add personnel modal
          </button>
        </div>

        <div className="flex flex-col items-center mt-12">
          <div className="w-full mb-6 md:mb-10 max-w-5xl mx-auto">
            <div className="p-6 md:p-8 rounded-2xl shadow-lg border border-gold-light/20 hover-3d-tilt" style={{ background: 'var(--color-navy)', backdropFilter: 'blur(8px)' }}>
              <div className="flex flex-col items-center text-center">
                <h3 className="text-2xl font-bold font-headline-lg mb-6 text-white drop-shadow-sm">Campus Librarian</h3>
                
                <div className="w-40 h-40 rounded-full border-4 border-gold-light/40 overflow-hidden shadow-2xl mx-auto mb-4 relative group">
                  {chiefLibrarian.photo ? (
                    <img
                      alt={chiefLibrarian.name}
                      className="w-full h-full object-cover"
                      src={getImageUrl(chiefLibrarian.photo)}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/person-placeholder.png'; }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">No Photo</div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white font-semibold rounded-full gap-2">
                    <button className="flex items-center gap-1 hover:text-gold-light transition-colors" onClick={(e) => { e.stopPropagation(); setViewingPhoto(getImageUrl(chiefLibrarian.photo)); }}>
                      <Search size={16} /> View
                    </button>
                    <button className="flex items-center gap-1 hover:text-gold-light transition-colors" onClick={(e) => { e.stopPropagation(); openEditPersonnel(chiefLibrarian); }}>
                      <Edit2 size={16} /> Edit
                    </button>
                  </div>
                </div>
                
                <div className="bg-navy-dark px-4 py-3 rounded-xl border border-gold-light/20 shadow-lg min-w-[250px]">
                  <h3 className="font-headline-md font-bold text-lg mb-1" style={{ color: 'var(--color-gold-light)' }}>{chiefLibrarian.name}</h3>
                  <div className="h-0.5 w-12 bg-gold-light/50 mx-auto mb-2"></div>
                  <p className="text-white/90 font-bold tracking-widest text-xs uppercase">{chiefLibrarian.title}</p>
                </div>
              </div>
            </div>
          </div>

          {renderConnectors()}

          {staffList.length > 0 && (
            <div className="flex flex-col items-center md:hidden my-2 text-gold-light">
              <div className="w-0.5 h-6 bg-gold-light"></div>
              <span className="material-symbols-outlined text-lg leading-none -mt-1">arrow_downward</span>
            </div>
          )}

          <div className={`grid ${getGridColsClass(staffList.length)} gap-4 w-full justify-items-center`}>
            {staffList.map((person, idx) => (
              <React.Fragment key={person.id || idx}>
                {idx > 0 && (
                  <div className="flex flex-col items-center md:hidden my-2 text-gold-light col-span-full">
                    <div className="w-0.5 h-6 bg-gold-light"></div>
                    <span className="material-symbols-outlined text-lg leading-none -mt-1">arrow_downward</span>
                  </div>
                )}
                <div className="flex flex-col items-center w-full min-w-[200px]">
                  <div
                    className="border-2 border-gold-light/30 rounded-2xl p-4 text-center w-full shadow-md hover-3d-tilt flex-1 flex flex-col items-center justify-center relative overflow-hidden"
                    style={{ background: 'var(--color-navy)', backdropFilter: 'blur(8px)', paddingTop: '40px' }}
                  >
                    <div className="absolute top-0 left-0 w-full border-b border-gold-light/20 bg-black/20 p-2 flex justify-start gap-3 z-10">
                        <button className="flex items-center gap-1 text-white hover:text-gold-light text-xs transition-colors font-medium bg-black/30 px-2 py-1 rounded" onClick={() => setViewingPhoto(person.photo ? (getImageUrl(person.photo)) : null)}>
                          <Search size={12} /> View
                        </button>
                        <button className="flex items-center gap-1 text-white hover:text-gold-light text-xs transition-colors font-medium bg-black/30 px-2 py-1 rounded" onClick={() => openEditPersonnel(person)}>
                          <Edit2 size={12} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeletePersonnel(person.id)} 
                          className="ml-auto text-red-400 hover:text-red-500 hover:scale-110 transition-transform"
                          title="Delete Personnel"
                        >
                          <Trash2 size={14}/>
                        </button>
                    </div>

                    {person.photo ? (
                      <div className="w-24 h-24 rounded-full border-2 border-gold-light/40 overflow-hidden shadow-lg mx-auto mb-3 mt-2">
                        <img src={getImageUrl(person.photo)} alt={person.name} className="w-full h-full object-cover relative z-0" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/person-placeholder.png'; }} />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-navy-dark text-gold-light flex items-center justify-center text-xl font-bold mx-auto mb-3 mt-2 shadow-lg border-2 border-gold-light/20 relative z-0">
                        {person.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <h3 className="font-headline-md font-bold mb-1 text-base leading-tight uppercase relative z-0" style={{ color: 'var(--color-gold-light)' }}>
                      {person.name}
                    </h3>
                    <p className="font-label-caps font-semibold text-[10px] relative z-0 mb-2" style={{ color: 'var(--color-white-alpha-80)' }}>{person.title}</p>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {viewingPhoto && createPortal(
        <div className="fixed backdrop-blur-sm inset-0 bg-black/80 flex items-center justify-center p-4 z-[9999] animate-modal-overlay" onClick={() => setViewingPhoto(null)}>
          <div className="bg-navy-dark rounded-xl shadow-2xl overflow-hidden max-w-3xl max-h-[90vh] relative border border-gold-light/20 animate-modal-card" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setViewingPhoto(null)} 
              className="absolute top-4 right-4 text-white hover:text-gold-light transition-colors z-10 bg-black/50 p-1 rounded-full"
            >
              <X size={24} />
            </button>
            <div className="p-4 flex items-center justify-center">
               <img src={viewingPhoto} alt="Expanded View" className="max-w-full max-h-[80vh] object-contain rounded" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/person-placeholder.png'; }} />
            </div>
          </div>
        </div>,
        document.body
      )}

      {isPersonnelModalOpen && createPortal(
        <div className="fixed backdrop-blur-sm inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999] animate-modal-overlay">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-modal-card">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editingPersonnelId ? 'Edit Personnel' : 'Add Personnel'}</h2>
              <button onClick={() => { setIsPersonnelModalOpen(false); setPersonnelPhoto(null); setPersonnelPhotoPreview(null); }} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handlePersonnelSubmit} className="p-4 flex flex-col gap-4 overflow-y-auto">
              {editingPersonnelId ? (
                 <input type="hidden" name="order" value={personnelList.find(p => p.id === editingPersonnelId)?.order || 2} />
              ) : (
                 <input type="hidden" name="order" value={personnelList.length ? Math.max(...personnelList.map(s => s.order)) + 1 : 2} />
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input required type="text" name="name" maxLength={200} defaultValue={editingPersonnelId ? personnelList.find(p => p.id === editingPersonnelId)?.name : ''} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role (e.g. Staff, Library)</label>
                <input required type="text" name="title" maxLength={200} defaultValue={editingPersonnelId ? personnelList.find(p => p.id === editingPersonnelId)?.title : ''} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Photo (Max 10MB)</label>
                <DragDropFileUpload
                  accept="image/*"
                  multiple={false}
                  maxSizeMB={10}
                  onFilesSelected={(files) => {
                    setPersonnelPhoto(files[0]);
                    setPersonnelPhotoPreview(URL.createObjectURL(files[0]));
                  }}
                  label="Click to upload picture or drag and drop"
                  subLabel="Maximum file size: 10MB"
                />
                {personnelPhotoPreview && (
                  <div className="mt-4 flex flex-col items-center">
                    <img src={personnelPhotoPreview} alt="Preview" className="w-32 h-32 object-cover rounded-full border-4 border-gray-200 shadow-md animate-modal-card" />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setIsPersonnelModalOpen(false); setPersonnelPhoto(null); setPersonnelPhotoPreview(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg" disabled={isSavingPersonnel}>Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg flex items-center gap-2" disabled={isSavingPersonnel}>
                  {isSavingPersonnel ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : null}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <UndoDeleteToast 
        undoState={undoState} 
        onUndo={cancelDelete} 
        onExecuteNow={executeNow} 
      />
    </>
  );
}
