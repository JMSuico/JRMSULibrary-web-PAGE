import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { personnelApi, PERSONNEL_CACHE_KEY, Personnel } from '@/src/Endpoints/personnelApi';
import { Edit2, Plus, Search, Trash2, X } from 'lucide-react';
import { useToast } from '@/src/Hooks/useToast';
import { useUndoDelete } from '@/src/Hooks/useUndoDelete';
import { useCachedQuery } from '@/src/Hooks/useCachedQuery';
import { useModalSafeCmsSync, useScrollRestoration } from '@/src/Hooks';
import { DragDropFileUpload } from '@/src/Components/Shared/DragDropFileUpload';
import { UndoDeleteToast } from '@/src/Components/Shared/UndoDeleteToast';
import {
  getPersonnelGridColsClass,
  getPersonnelPhotoUrl,
  getSequentialArrowHiddenClass,
  getTopConnectorArrowHiddenClass,
  PersonnelAvatar,
  renderOrgBranchConnectors,
  resolvePersonnelHierarchy,
} from '@/src/Libs/personnelOrgUtils';

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

export function PersonnelManager({ active }: { active: boolean }) {
  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  const [personnelPhoto, setPersonnelPhoto] = useState<File | null>(null);
  const [personnelPhotoPreview, setPersonnelPhotoPreview] = useState<string | null>(null);
  const [editingPersonnelId, setEditingPersonnelId] = useState<number | null>(null);
  const [editingChiefOrder, setEditingChiefOrder] = useState(false);
  const [isSavingPersonnel, setIsSavingPersonnel] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  const lastReportedErrorRef = useRef<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const { showToast } = useToast();
  const { undoState, triggerDelete, cancelDelete, executeNow } = useUndoDelete();

  const {
    data: personnelData,
    isLoading,
    error: personnelError,
    refetch,
    mutate,
  } = useCachedQuery<Personnel[]>({
    key: PERSONNEL_CACHE_KEY,
    fetcher: () => personnelApi.getPersonnel({ fresh: true }),
    staleTimeMs: 15_000,
    persistStorage: true,
    listenCmsUpdate: false,
    enabled: active,
  });

  const {
    captureNow,
    restoreNow,
    highlightedId,
    setLastAnchorId,
  } = useScrollRestoration({
    storageKey: 'admin:content:personnel',
    isReady: active && !isLoading,
  });

  const { markLocalSave } = useModalSafeCmsSync({
    enabled: active,
    isBusy: isPersonnelModalOpen || isSavingPersonnel || Boolean(viewingPhoto) || Boolean(undoState?.isOpen),
    captureNow,
    restoreNow,
    onSync: () => refetch(),
  });

  useEffect(() => {
    if (!active || !personnelError) {
      lastReportedErrorRef.current = null;
      return;
    }
    const msg = getErrorMessage(personnelError, 'Failed to load personnel');
    if (lastReportedErrorRef.current !== msg) {
      lastReportedErrorRef.current = msg;
      showToast(msg, 'error');
    }
  }, [active, personnelError, showToast]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const clearPhotoSelection = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPersonnelPhoto(null);
    setPersonnelPhotoPreview(null);
  };

  const closePersonnelModal = () => {
    setIsPersonnelModalOpen(false);
    setEditingPersonnelId(null);
    setEditingChiefOrder(false);
    clearPhotoSelection();
  };

  const personnelList = useMemo(() => personnelData ?? [], [personnelData]);

  const { chiefLibrarian, staffList } = useMemo(
    () => resolvePersonnelHierarchy(personnelList, { allowStaticFallback: false }),
    [personnelList]
  );

  const handleDeletePersonnel = async (id?: number) => {
    if (id === undefined) return;
    const personToDelete = personnelList.find((p) => p.id === id);
    if (!personToDelete) return;

    captureNow(null);
    // Optimistic delete
    mutate((prev = []) => prev.filter((p) => p.id !== id));

    triggerDelete(
      personToDelete.name,
      async () => {
        try {
          await personnelApi.deletePersonnel(id);
          markLocalSave();
        } catch (err: unknown) {
          mutate((prev = []) => [...prev, personToDelete].sort((a, b) => a.order - b.order));
          showToast(getErrorMessage(err, 'Failed to delete personnel'), 'error');
          setLastAnchorId(id);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              restoreNow(id);
            });
          });
        }
      },
      () => {
        mutate((prev = []) => [...prev, personToDelete].sort((a, b) => a.order - b.order));
        showToast('Personnel restoration undone', 'success');
        setLastAnchorId(id);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            restoreNow(id);
          });
        });
      }
    );
  };

  const handlePersonnelSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSavingPersonnel) return;
    const targetAnchorId = editingPersonnelId ?? (editingChiefOrder ? chiefLibrarian.id ?? null : null);
    captureNow(targetAnchorId);
    setIsSavingPersonnel(true);
    showToast('Saving personnel...', 'info');

    const formData = new FormData(e.currentTarget);

    try {
      if (personnelPhoto) {
        formData.append('photo', personnelPhoto);
      }

      let savedId: number | undefined;

      if (editingPersonnelId !== null) {
        const updated = await personnelApi.updatePersonnel(editingPersonnelId, formData);
        savedId = updated.id ?? editingPersonnelId;
        mutate((prev = []) =>
          prev
            .map((p) => (p.id === editingPersonnelId ? updated : p))
            .sort((a, b) => a.order - b.order)
        );
        showToast('Personnel updated successfully', 'success');
      } else {
        const created = await personnelApi.createPersonnel(formData);
        savedId = created.id;
        mutate((prev = []) => [...prev, created].sort((a, b) => a.order - b.order));
        showToast('Personnel created successfully', 'success');
      }

      markLocalSave();
      closePersonnelModal();
      if (savedId !== undefined) {
        setLastAnchorId(savedId);
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          restoreNow(savedId ?? null);
        });
      });
    } catch (err: unknown) {
      showToast(getErrorMessage(err, 'Failed to save personnel'), 'error');
    } finally {
      setIsSavingPersonnel(false);
    }
  };

  const openEditPersonnel = (person: Personnel, isChief: boolean = false) => {
    clearPhotoSelection();
    setEditingPersonnelId(person.id ?? null);
    setEditingChiefOrder(isChief || person.order === 1);
    const photoUrl = getPersonnelPhotoUrl(person);
    setPersonnelPhotoPreview(photoUrl || null);
    setIsPersonnelModalOpen(true);
  };

  const openAddPersonnel = () => {
    if (staffList.length >= 5) return;
    clearPhotoSelection();
    setEditingPersonnelId(null);
    setEditingChiefOrder(false);
    setIsPersonnelModalOpen(true);
  };

  if (!active) return null;

  const chiefPhotoUrl = isLoading ? null : getPersonnelPhotoUrl(chiefLibrarian);
  const displayedStaffCount = Math.min(staffList.length, 5);
  const editingTarget =
    editingPersonnelId !== null
      ? personnelList.find((p) => p.id === editingPersonnelId) ??
        (editingChiefOrder ? chiefLibrarian : null)
      : editingChiefOrder
        ? chiefLibrarian
        : null;
  const nextStaffOrder = Math.max(1, ...personnelList.map((s) => s.order)) + 1;
  const formOrderValue = editingChiefOrder ? 1 : (editingTarget?.order ?? nextStaffOrder);
  const modalTitle = editingChiefOrder
    ? 'Edit Campus Librarian'
    : editingPersonnelId !== null
      ? 'Edit Personnel'
      : 'Add Personnel';

  return (
    <>
      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 relative">
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '16px',
            position: 'absolute',
            top: '16px',
            right: '16px',
          }}
        >
          <button
            className={`admin-btn flex items-center gap-2 ${
              staffList.length >= 5
                ? 'bg-blue-300 text-white cursor-not-allowed border-none opacity-70'
                : 'admin-btn--primary'
            }`}
            onClick={openAddPersonnel}
            disabled={staffList.length >= 5}
            title={
              staffList.length >= 5
                ? 'Maximum 5 modals reached. Cannot add more.'
                : `Add personnel modal (${5 - staffList.length} limit left)`
            }
          >
            <Plus size={16} /> Add personnel modal
          </button>
        </div>

        <div className="flex flex-col items-center mt-12">
          <div className="w-full mb-6 md:mb-10 max-w-5xl mx-auto">
            <div
              data-cache-anchor-id={chiefLibrarian.id ? String(chiefLibrarian.id) : undefined}
              className={`p-6 md:p-8 rounded-2xl shadow-lg border hover-3d-tilt ${
                chiefLibrarian.id && highlightedId === String(chiefLibrarian.id)
                  ? 'border-amber-400 ring-2 ring-amber-400'
                  : 'border-gold-light/20'
              }`}
              style={{ background: 'var(--color-navy)', backdropFilter: 'blur(8px)' }}
            >
              <div className="flex flex-col items-center text-center">
                <h3 className="text-2xl font-bold font-headline-lg mb-6 text-white drop-shadow-sm">
                  Campus Librarian
                </h3>

                <div className="w-40 h-40 rounded-full border-4 border-gold-light/40 overflow-hidden shadow-2xl mx-auto mb-4 relative group">
                  <PersonnelAvatar
                    src={chiefPhotoUrl}
                    name={chiefLibrarian.name}
                    isSkeleton={isLoading}
                    containerClassName="w-full h-full"
                    imageClassName="w-full h-full object-cover"
                    initialsClassName="text-3xl"
                  />
                  <div className="absolute inset-0 z-20 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white font-semibold rounded-full gap-2">
                    <button
                      type="button"
                      className="flex items-center gap-1 hover:text-gold-light transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (chiefPhotoUrl) {
                          setViewingPhoto(chiefPhotoUrl);
                        } else {
                          showToast('No photo available to preview', 'info');
                        }
                      }}
                    >
                      <Search size={16} /> View
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1 hover:text-gold-light transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditPersonnel(chiefLibrarian, true);
                      }}
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                  </div>
                </div>

                <div className="bg-navy-dark px-4 py-3 rounded-xl border border-gold-light/20 shadow-lg w-full max-w-[280px]">
                  <h3
                    className="font-headline-md font-bold text-lg mb-1"
                    style={{ color: 'var(--color-gold-light)' }}
                  >
                    {chiefLibrarian.name}
                  </h3>
                  <div className="h-0.5 w-12 bg-gold-light/50 mx-auto mb-2" />
                  <p className="text-white/90 font-bold tracking-widest text-xs uppercase">
                    {chiefLibrarian.title}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {renderOrgBranchConnectors({
            count: displayedStaffCount,
            gapClass: 'gap-4',
            halfGapPx: 8,
          })}

          {displayedStaffCount > 0 && (
            <div
              className={`flex flex-col items-center ${getTopConnectorArrowHiddenClass(
                displayedStaffCount
              )} my-2 text-gold-light`}
            >
              <div className="w-0.5 h-6 bg-gold-light" />
              <span className="material-symbols-outlined text-lg leading-none -mt-1">
                arrow_downward
              </span>
            </div>
          )}

          <div
            className={`grid ${getPersonnelGridColsClass(
              staffList.length
            )} gap-4 w-full justify-items-center`}
          >
            {staffList.map((person, idx) => {
              const photoUrl = getPersonnelPhotoUrl(person);
              return (
                <React.Fragment key={person.id ?? `${person.order}-${person.name}-${idx}`}>
                  {idx > 0 && (
                    <div
                      className={`flex flex-col items-center ${getSequentialArrowHiddenClass(
                        staffList.length
                      )} my-2 text-gold-light`}
                    >
                      <div className="w-0.5 h-6 bg-gold-light" />
                      <span className="material-symbols-outlined text-lg leading-none -mt-1">
                        arrow_downward
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col items-center w-full max-w-[260px] min-w-0">
                    <div
                      data-cache-anchor-id={person.id ? String(person.id) : undefined}
                      className={`border-2 rounded-2xl p-4 text-center w-full shadow-md hover-3d-tilt flex-1 flex flex-col items-center justify-center relative overflow-hidden ${
                        person.id && highlightedId === String(person.id)
                          ? 'border-amber-400 ring-2 ring-amber-400'
                          : 'border-gold-light/30'
                      }`}
                      style={{ background: 'var(--color-navy)', backdropFilter: 'blur(8px)', paddingTop: '40px' }}
                    >
                      <div className="absolute top-0 left-0 w-full border-b border-gold-light/20 bg-black/20 p-2 flex justify-start gap-3 z-10">
                        <button
                          type="button"
                          className="flex items-center gap-1 text-white hover:text-gold-light text-xs transition-colors font-medium bg-black/30 px-2 py-1 rounded"
                          onClick={() => {
                            if (photoUrl) {
                              setViewingPhoto(photoUrl);
                            } else {
                              showToast('No photo available to preview', 'info');
                            }
                          }}
                        >
                          <Search size={12} /> View
                        </button>
                        <button
                          type="button"
                          className="flex items-center gap-1 text-white hover:text-gold-light text-xs transition-colors font-medium bg-black/30 px-2 py-1 rounded"
                          onClick={() => openEditPersonnel(person, false)}
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePersonnel(person.id)}
                          className="ml-auto text-red-400 hover:text-red-500 hover:scale-110 transition-transform"
                          title="Delete Personnel"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <PersonnelAvatar
                        src={photoUrl}
                        name={person.name}
                        containerClassName="w-24 h-24 border-2 border-gold-light/40 shadow-lg mx-auto mb-3 mt-2 relative z-0"
                        imageClassName="w-full h-full object-cover"
                        initialsClassName="text-xl"
                      />
                      <h3
                        className="font-headline-md font-bold mb-1 text-base leading-tight uppercase relative z-0"
                        style={{ color: 'var(--color-gold-light)' }}
                      >
                        {person.name}
                      </h3>
                      <p
                        className="font-label-caps font-semibold text-[10px] relative z-0 mb-2"
                        style={{ color: 'var(--color-white-alpha-80)' }}
                      >
                        {person.title}
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {viewingPhoto &&
        createPortal(
          <div
            className="fixed backdrop-blur-sm inset-0 bg-black/80 flex items-center justify-center p-4 z-[9999] animate-modal-overlay"
            onClick={() => setViewingPhoto(null)}
          >
            <div
              className="bg-navy-dark rounded-xl shadow-2xl overflow-hidden max-w-3xl max-h-[90vh] relative border border-gold-light/20 animate-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setViewingPhoto(null)}
                className="absolute top-4 right-4 text-white hover:text-gold-light transition-colors z-10 bg-black/50 p-1 rounded-full"
              >
                <X size={24} />
              </button>
              <div className="p-4 flex items-center justify-center">
                <img
                  src={viewingPhoto}
                  alt="Expanded View"
                  className="max-w-full max-h-[80vh] object-contain rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>,
          document.body
        )}

      {isPersonnelModalOpen &&
        createPortal(
          <div className="fixed backdrop-blur-sm inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999] animate-modal-overlay">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-modal-card">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">{modalTitle}</h2>
                <button
                  type="button"
                  onClick={closePersonnelModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <form
                key={editingPersonnelId ?? (editingChiefOrder ? 'chief' : 'new')}
                onSubmit={handlePersonnelSubmit}
                className="p-4 flex flex-col gap-4 overflow-y-auto"
              >
                <input type="hidden" name="order" value={formOrderValue} />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    name="name"
                    defaultValue={editingTarget?.name ?? ''}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Role (e.g. Staff, Library)
                  </label>
                  <input
                    required
                    type="text"
                    name="title"
                    defaultValue={editingTarget?.title ?? ''}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Photo (Max 10MB)
                  </label>
                  <DragDropFileUpload
                    accept="image/*"
                    multiple={false}
                    maxSizeMB={10}
                    onFilesSelected={(files) => {
                      if (objectUrlRef.current) {
                        URL.revokeObjectURL(objectUrlRef.current);
                      }
                      const nextUrl = URL.createObjectURL(files[0]);
                      objectUrlRef.current = nextUrl;
                      setPersonnelPhoto(files[0]);
                      setPersonnelPhotoPreview(nextUrl);
                    }}
                    label="Click to upload picture or drag and drop"
                    subLabel="Maximum file size: 10MB"
                  />
                  {personnelPhotoPreview && (
                    <div className="mt-4 flex flex-col items-center">
                      <img
                        src={personnelPhotoPreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-full border-4 border-gray-200 shadow-md animate-modal-card"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closePersonnelModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg"
                    disabled={isSavingPersonnel}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg flex items-center gap-2"
                    disabled={isSavingPersonnel}
                  >
                    {isSavingPersonnel ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : null}
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
