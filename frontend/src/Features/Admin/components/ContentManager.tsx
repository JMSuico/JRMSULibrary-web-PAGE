import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cmsApi, PageContent, ManagedLink, ManagedFile } from '@/src/Endpoints/cmsApi';
import { personnelApi } from '@/src/Endpoints/personnelApi';
import { Save, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, RefreshCw, GripVertical, Check, X, Search } from 'lucide-react';
import { useToast } from '@/src/Hooks/useToast';
import { useAutoRefresh } from '@/src/Hooks/useAutoRefresh';
import { useUndoDelete } from '@/src/Hooks/useUndoDelete';
import { UndoDeleteToast } from '@/src/Components/Shared/UndoDeleteToast';
import { DragDropFileUpload } from '@/src/Components/Shared/DragDropFileUpload';
import { BlockTextEditor } from '@/src/Components/Shared/BlockTextEditor';
import { Pagination } from '@/src/Components/Shared/Pagination';
import { processInChunks } from '@/src/Libs/chunkUtils';
import { LayoutGrid, List } from 'lucide-react';
import { ResearchReferencesManager } from './ResearchReferencesManager';
import { PersonnelManager } from './PersonnelManager';
import { defaultExternalLinks } from '@/src/Libs/Assets/defaultLinks';

import { getImageUrl } from '@/src/Libs/apiClient';

export function ContentManager() {
  const [activeTab, setActiveTab] = useState<'content' | 'links' | 'files' | 'org_structure' | 'personnel' | 'excellence' | 'research_references'>('content');
  const [loading, setLoading] = useState(false);
  const { showToast, removeToast } = useToast();
  const [isRemoving, setIsRemoving] = useState(false);

  // Tab Dragging State
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingTabs, setIsDraggingTabs] = useState(false);
  const [startXTabs, setStartXTabs] = useState(0);
  const [scrollLeftTabs, setScrollLeftTabs] = useState(0);

  const onMouseDownTabs = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tabsContainerRef.current) return;
    setIsDraggingTabs(true);
    setStartXTabs(e.pageX - tabsContainerRef.current.offsetLeft);
    setScrollLeftTabs(tabsContainerRef.current.scrollLeft);
    tabsContainerRef.current.style.cursor = 'grabbing';
  };

  const onMouseLeaveTabs = () => {
    setIsDraggingTabs(false);
    if (tabsContainerRef.current) tabsContainerRef.current.style.cursor = 'grab';
  };

  const onMouseUpTabs = () => {
    setIsDraggingTabs(false);
    if (tabsContainerRef.current) tabsContainerRef.current.style.cursor = 'grab';
  };

  const onMouseMoveTabs = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingTabs || !tabsContainerRef.current) return;
    e.preventDefault(); // prevent text selection while dragging
    const x = e.pageX - tabsContainerRef.current.offsetLeft;
    const walk = (x - startXTabs) * 1.5;
    tabsContainerRef.current.scrollLeft = scrollLeftTabs - walk;
  };

  // Content State
  const [contents, setContents] = useState<PageContent[]>([]);
  const [editedContents, setEditedContents] = useState<Record<string, string>>({});
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [isSavingContent, setIsSavingContent] = useState(false);
  
  // Link State
  const [links, setLinks] = useState<ManagedLink[]>([]);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ManagedLink | null>(null);
  const [isSavingLink, setIsSavingLink] = useState(false);
  const [draggedLinkId, setDraggedLinkId] = useState<number | null>(null);
  const [linksPage, setLinksPage] = useState(1);
  const [linksViewMode, setLinksViewMode] = useState<'table' | 'card'>('table');
  const [selectedLinkIds, setSelectedLinkIds] = useState<Set<number>>(new Set());
  const linksPerPage = 10;

  // File State
  const [files, setFiles] = useState<ManagedFile[]>([]);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUploadCategory, setFileUploadCategory] = useState<'Manual' | 'OrgStructure' | 'Excellence'>('Manual');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const [personnelList, setPersonnelList] = useState<any[]>([]);
  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  const [personnelPhoto, setPersonnelPhoto] = useState<File | null>(null);
  const [personnelPhotoPreview, setPersonnelPhotoPreview] = useState<string | null>(null);
  const [editingPersonnelId, setEditingPersonnelId] = useState<number | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
  const [viewingManualFile, setViewingManualFile] = useState<ManagedFile | null>(null);
  
  const { undoState, triggerDelete, cancelDelete, executeNow } = useUndoDelete();

  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {
    setLoading(true);
    try {
      const [c, l, f, p] = await Promise.all([
        cmsApi.getAllContent(),
        cmsApi.getAllLinks(),
        cmsApi.getAllFiles(),
        personnelApi.getPersonnel()
      ]);
      setContents(c);
      setLinks(l);
      setFiles(f);
      setPersonnelList(p);
    } catch (err: any) {
      showToast(err.message || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(loadData, 60000);

  // --- Content Handlers ---
  const handleSaveContent = async (slug: string, content: string) => {
    if (isSavingContent) return;
    setIsSavingContent(true);
    showToast('Saving content...', 'info');
    try {
      await cmsApi.updateContent(slug, { content });
      showToast('Content saved successfully', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save content', 'error');
    } finally {
      setIsSavingContent(false);
    }
  };

  // --- Link Handlers ---
  const handleSaveLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get('name') as string,
      url: fd.get('url') as string,
      category: fd.get('category') as string,
      order: parseInt(fd.get('order') as string, 10),
      is_active: fd.get('is_active') === 'on'
    };

    if (isSavingLink) return;
    setIsSavingLink(true);
    showToast('Saving link...', 'info');
    try {
      if (editingLink) {
        await cmsApi.updateLink(editingLink.id, payload);
      } else {
        await cmsApi.createLink(payload);
      }
      showToast(`Link ${editingLink ? 'updated' : 'created'} successfully`, 'success');
      setIsLinkModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save link', 'error');
    } finally {
      setIsSavingLink(false);
    }
  };

  const handleDeleteLink = (id: number) => {
    const linkToDelete = links.find(l => l.id === id);
    if (!linkToDelete) return;

    triggerDelete(
      linkToDelete.name,
      async () => {
        try {
          await cmsApi.deleteLink(id);
        } catch (err: any) {
          setLinks(prev => [...prev, linkToDelete]);
          showToast(err.message || 'Failed to delete link', 'error');
        }
      },
      () => {
        setLinks(prev => [...prev, linkToDelete]);
        showToast('Link restoration undone', 'success');
      }
    );
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  const handleBulkDeleteLinks = () => {
    if (selectedLinkIds.size === 0) return;
    const count = selectedLinkIds.size;
    const linksToDelete = links.filter(l => selectedLinkIds.has(l.id));

    setLinks(prev => prev.filter(l => !selectedLinkIds.has(l.id)));
    setSelectedLinkIds(new Set());

    triggerDelete(
      `${count} selected link(s)`,
      async () => {
        setIsRemoving(true);
        const toastId = showToast(`${count} removing processing.`, 'loading');
        try {
          await processInChunks(
            Array.from(selectedLinkIds),
            10,
            (id: number) => cmsApi.deleteLink(id),
            (_, __, c) => {}
          );
          showToast(`Removed ${count} links successfully`, 'success');
        } catch (err: any) {
          setLinks(prev => [...prev, ...linksToDelete]);
          showToast('Failed to remove some links', 'error');
        } finally {
          setIsRemoving(false);
          removeToast(toastId);
        }
      },
      () => {
        setLinks(prev => [...prev, ...linksToDelete]);
        showToast('Bulk link restoration undone', 'success');
      }
    );
  };

  const handleSeedDefaultLinks = async () => {
    try {
      const res = await cmsApi.importDefaultLinks();
      showToast(res.message, res.imported > 0 ? 'success' : 'info');
      if (res.imported > 0) loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to import default links', 'error');
    }
  };

  const handleSeedDefaultTexts = async () => {
    try {
      const res = await cmsApi.importDefaultTexts();
      showToast(res.message, res.imported > 0 ? 'success' : 'info');
      if (res.imported > 0) loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to import default texts', 'error');
    }
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedLinkId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (draggedLinkId === null || draggedLinkId === targetId) return;

    const sortedLinks = [...links].sort((a, b) => a.order - b.order);
    const draggedIdx = sortedLinks.findIndex(l => l.id === draggedLinkId);
    const targetIdx = sortedLinks.findIndex(l => l.id === targetId);
    
    if (draggedIdx === -1 || targetIdx === -1) return;

    const newLinks = [...sortedLinks];
    const [draggedItem] = newLinks.splice(draggedIdx, 1);
    newLinks.splice(targetIdx, 0, draggedItem);

    // Update orders sequentially
    const updatedLinks = newLinks.map((l, idx) => ({ ...l, order: idx + 1 }));
    setLinks(updatedLinks);

    try {
      await Promise.all(
        updatedLinks.map(l => cmsApi.updateLink(l.id, { order: l.order }))
      );
      showToast('Sequence updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update sequence', 'error');
      loadData(); // Revert on failure
    }
    setDraggedLinkId(null);
  };

  // --- File Handlers ---
  const handleUploadFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Please select a file to upload', 'error');
      return;
    }
    if (isUploadingFile) return;
    setIsUploadingFile(true);
    showToast('Uploading file...', 'info');
    
    const fd = new FormData(e.currentTarget);
    
    fd.append('file', selectedFile);
    try {
      await cmsApi.createFile(fd);
      showToast('File uploaded successfully', 'success');
      setIsFileModalOpen(false);
      setSelectedFile(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to upload file', 'error');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDeleteFile = (id: number) => {
    const fileToDelete = files.find(f => f.id === id);
    if (!fileToDelete) return;

    triggerDelete(
      fileToDelete.name,
      async () => {
        try {
          await cmsApi.deleteFile(id);
        } catch (err: any) {
          setFiles(prev => [...prev, fileToDelete]);
          showToast(err.message || 'Failed to delete file', 'error');
        }
      },
      () => {
        setFiles(prev => [...prev, fileToDelete]);
        showToast('File restoration undone', 'success');
      }
    );
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  if (loading && contents.length === 0) {
    return <div className="p-8 text-center text-gray-500">Loading CMS...</div>;
  }

  return (
    <>
      <div className="admin-content__header">
        <h1>Content Manager</h1>
        <p>Manage the dynamic content, external links, and manual files.</p>
      </div>

      <div className="admin-table-wrapper" style={{ padding: 0 }}>
        {/* Tabs */}
        <div 
          ref={tabsContainerRef}
          onMouseDown={onMouseDownTabs}
          onMouseLeave={onMouseLeaveTabs}
          onMouseUp={onMouseUpTabs}
          onMouseMove={onMouseMoveTabs}
          style={{ 
            display: 'flex', 
            borderBottom: '1px solid var(--color-surface-container-highest)',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            WebkitOverflowScrolling: 'touch',
            cursor: 'grab'
          }}
          className="custom-scrollbar"
        >
          <button 
            onClick={() => setActiveTab('content')}
            style={{ padding: '16px 24px', fontWeight: 600, borderBottom: activeTab === 'content' ? '2px solid var(--color-navy)' : 'none', color: activeTab === 'content' ? 'var(--color-navy)' : 'var(--color-gray-500)' }}
          >
            Page Text Content
          </button>
          <button 
            onClick={() => setActiveTab('links')}
            style={{ padding: '16px 24px', fontWeight: 600, borderBottom: activeTab === 'links' ? '2px solid var(--color-navy)' : 'none', color: activeTab === 'links' ? 'var(--color-navy)' : 'var(--color-gray-500)' }}
          >
            External Links
          </button>
          <button 
            onClick={() => setActiveTab('files')}
            style={{ padding: '16px 24px', fontWeight: 600, borderBottom: activeTab === 'files' ? '2px solid var(--color-navy)' : 'none', color: activeTab === 'files' ? 'var(--color-navy)' : 'var(--color-gray-500)' }}
          >
            Manual Files
          </button>
          <button 
            onClick={() => setActiveTab('org_structure')}
            style={{ padding: '16px 24px', fontWeight: 600, borderBottom: activeTab === 'org_structure' ? '2px solid var(--color-navy)' : 'none', color: activeTab === 'org_structure' ? 'var(--color-navy)' : 'var(--color-gray-500)' }}
          >
            Org Structure
          </button>
          <button 
            onClick={() => setActiveTab('personnel')}
            style={{ padding: '16px 24px', fontWeight: 600, borderBottom: activeTab === 'personnel' ? '2px solid var(--color-navy)' : 'none', color: activeTab === 'personnel' ? 'var(--color-navy)' : 'var(--color-gray-500)' }}
          >
            Library Personnel
          </button>
          <button 
            onClick={() => setActiveTab('excellence')}
            style={{ padding: '16px 24px', fontWeight: 600, borderBottom: activeTab === 'excellence' ? '2px solid var(--color-navy)' : 'none', color: activeTab === 'excellence' ? 'var(--color-navy)' : 'var(--color-gray-500)' }}
          >
            Excellence in Information
          </button>
          <button 
            onClick={() => setActiveTab('research_references')}
            style={{ padding: '16px 24px', fontWeight: 600, borderBottom: activeTab === 'research_references' ? '2px solid var(--color-navy)' : 'none', color: activeTab === 'research_references' ? 'var(--color-navy)' : 'var(--color-gray-500)' }}
          >
            Research References
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '24px' }}>
          {activeTab === 'content' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="flex justify-end">
                <button 
                  className="admin-btn admin-btn--primary flex items-center gap-2"
                  style={{ background: 'var(--color-navy-mid)' }}
                  onClick={handleSeedDefaultTexts}
                >
                  <RefreshCw size={16} /> Import Defaults
                </button>
              </div>
              {contents.map((item) => (
                <div key={item.id} style={{ border: '1px solid var(--color-surface-container-highest)', padding: '16px', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{item.title}</h3>
                  <div className="mb-3">
                    {editingContentId === item.slug ? (
                      <BlockTextEditor 
                        key={item.slug}
                        value={editedContents[item.slug] ?? item.content} 
                        onChange={(v) => setEditedContents(prev => ({ ...prev, [item.slug]: v }))}
                        id={`content-${item.slug}`}
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700 min-h-[100px]" dangerouslySetInnerHTML={{ __html: item.content }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {editingContentId === item.slug ? (
                      <div className="flex gap-2">
                        <button 
                          className="admin-btn admin-btn--outline flex items-center gap-2"
                          onClick={() => {
                            setEditingContentId(null);
                            setEditedContents(prev => {
                              const newC = { ...prev };
                              delete newC[item.slug];
                              return newC;
                            });
                          }}
                        >
                          Cancel
                        </button>
                        <button 
                          className="admin-btn admin-btn--primary flex items-center gap-2"
                          disabled={isSavingContent}
                          onClick={async () => {
                             let val = editedContents[item.slug] ?? item.content;
                             await handleSaveContent(item.slug, val);
                             setEditingContentId(null);
                          }}
                        >
                          {isSavingContent ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <Save size={16} />} Save Changes
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="admin-btn admin-btn--primary flex items-center gap-2"
                        onClick={() => {
                          setEditingContentId(item.slug);
                        }}
                      >
                        <Edit2 size={16} /> Edit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'links' && (() => {
            const sortedLinks = [...links].sort((a,b) => a.order - b.order);
            const totalPages = Math.ceil(sortedLinks.length / linksPerPage) || 1;
            const currentLinksPage = Math.min(linksPage, totalPages);
            const currentLinks = sortedLinks.slice((currentLinksPage - 1) * linksPerPage, currentLinksPage * linksPerPage);

            return (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setLinksViewMode('table')}
                    className={`p-1.5 rounded flex items-center justify-center transition-colors ${linksViewMode === 'table' ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    title="Table View"
                  >
                    <List size={18} />
                  </button>
                  <button 
                    onClick={() => setLinksViewMode('card')}
                    className={`p-1.5 rounded flex items-center justify-center transition-colors ${linksViewMode === 'card' ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    title="Card View"
                  >
                    <LayoutGrid size={18} />
                  </button>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    className="admin-btn admin-btn--secondary text-sm w-full sm:w-auto"
                    onClick={() => {
                      if (selectedLinkIds.size > 0) {
                        setSelectedLinkIds(new Set());
                      } else {
                        setSelectedLinkIds(new Set(currentLinks.map(l => l.id)));
                      }
                    }}
                    disabled={isRemoving}
                  >
                    {selectedLinkIds.size > 0 ? "Unselect All" : "Select All"}
                  </button>
                  {selectedLinkIds.size > 0 && (
                    <button 
                      className="admin-btn w-full sm:w-auto" 
                      style={{ background: isRemoving ? 'var(--color-gray-400)' : 'var(--color-red-600)', color: 'white', border: 'none' }}
                      onClick={handleBulkDeleteLinks}
                      disabled={isRemoving}
                    >
                      <Trash2 size={16} /> Remove Selected ({selectedLinkIds.size})
                    </button>
                  )}
                  <button 
                    className="admin-btn admin-btn--primary flex items-center gap-2 w-full sm:w-auto justify-center"
                    style={{ background: 'var(--color-navy-mid)' }}
                    onClick={handleSeedDefaultLinks}
                  >
                    <RefreshCw size={16} /> Import Defaults
                  </button>
                  <button 
                    className="admin-btn admin-btn--primary flex items-center gap-2 w-full sm:w-auto justify-center"
                    onClick={() => { setEditingLink(null); setIsLinkModalOpen(true); }}
                  >
                    <Plus size={16} /> Add Link
                  </button>
                </div>
              </div>

              {linksViewMode === 'table' ? (
                <div className="admin-table-scroll">
                  <table className="admin-table min-w-full">
                    <thead>
                      <tr>
                        <th style={{ width: '40px', textAlign: 'center' }}>
                          <input 
                            type="checkbox" 
                            checked={currentLinks.length > 0 && currentLinks.every(l => selectedLinkIds.has(l.id))}
                            disabled={isRemoving}
                            onChange={(e) => {
                              const newSelected = new Set(selectedLinkIds);
                              if (e.target.checked) currentLinks.forEach(l => newSelected.add(l.id));
                              else currentLinks.forEach(l => newSelected.delete(l.id));
                              setSelectedLinkIds(newSelected);
                            }}
                          />
                        </th>
                        <th>Name</th>
                        <th>URL</th>
                        <th>Category</th>
                        <th>Order</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentLinks.map((link) => (
                        <tr 
                          key={link.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, link.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, link.id)}
                          style={{ cursor: 'move', backgroundColor: selectedLinkIds.has(link.id) ? 'var(--color-blue-50)' : (draggedLinkId === link.id ? 'var(--color-blue-50)' : undefined) }}
                          className={draggedLinkId === link.id ? 'opacity-50' : ''}
                        >
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="checkbox" 
                              checked={selectedLinkIds.has(link.id)}
                              disabled={isRemoving}
                              onChange={(e) => {
                                const newSelected = new Set(selectedLinkIds);
                                if (e.target.checked) newSelected.add(link.id);
                                else newSelected.delete(link.id);
                                setSelectedLinkIds(newSelected);
                              }}
                            />
                          </td>
                          <td style={{ fontWeight: 500 }}>
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-gray-400" style={{ cursor: 'grab' }}>drag_indicator</span>
                              {link.name}
                            </div>
                          </td>
                          <td><a href={link.url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-navy)' }} className="break-all line-clamp-1">{link.url}</a></td>
                          <td><span className="admin-badge admin-badge--info">{link.category}</span></td>
                          <td>{link.order}</td>
                          <td>
                            <span className={`admin-badge ${link.is_active ? 'admin-badge--success' : 'admin-badge--error'}`}>
                              {link.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => { setEditingLink(link); setIsLinkModalOpen(true); }} style={{ padding: '6px', backgroundColor: 'color-mix(in srgb, var(--color-blue) 10%, transparent)', color: 'var(--color-blue)', borderRadius: '4px' }}><Edit2 size={16}/></button>
                            <button onClick={() => handleDeleteLink(link.id)} style={{ padding: '6px', backgroundColor: 'var(--color-red-50)', color: 'var(--color-red-700)', borderRadius: '4px' }}><Trash2 size={16}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentLinks.map((link) => (
                    <div 
                      key={link.id} 
                      className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col gap-3 relative transition-all hover:shadow-md hover:border-blue-100 group"
                      style={{ border: selectedLinkIds.has(link.id) ? '2px solid var(--color-navy)' : undefined }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, link.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, link.id)}
                    >
                      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
                        <input 
                          type="checkbox" 
                          style={{ width: 16, height: 16, cursor: 'pointer' }}
                          checked={selectedLinkIds.has(link.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedLinkIds);
                            if (e.target.checked) newSelected.add(link.id);
                            else newSelected.delete(link.id);
                            setSelectedLinkIds(newSelected);
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-start pl-8">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-gray-300 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity absolute -left-2 bg-white rounded-full shadow-sm" title="Drag to reorder">drag_indicator</span>
                          <h3 className="font-bold text-gray-900 text-lg line-clamp-1 pl-2">{link.name}</h3>
                        </div>
                        <span className={`admin-badge text-[10px] px-2 py-0.5 ${link.is_active ? 'admin-badge--success' : 'admin-badge--error'}`}>
                          {link.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <span className="font-medium text-gray-700 w-16">Category:</span>
                        <span className="truncate">{link.category}</span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <span className="font-medium text-gray-700 w-16">Order:</span>
                        <span>{link.order}</span>
                      </div>
                      <div className="text-sm text-gray-500 flex flex-col gap-1 mt-1">
                        <span className="font-medium text-gray-700">URL:</span>
                        <a href={link.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all bg-gray-50 p-2 rounded text-xs">{link.url}</a>
                      </div>
                      
                      <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                        <button onClick={() => { setEditingLink(link); setIsLinkModalOpen(true); }} className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium">
                          <Edit2 size={14}/> Edit
                        </button>
                        <button onClick={() => handleDeleteLink(link.id)} className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors text-sm font-medium">
                          <Trash2 size={14}/> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-6 flex justify-center sm:justify-end border-t border-gray-100 pt-4">
                  <Pagination 
                    currentPage={currentLinksPage} 
                    totalPages={totalPages} 
                    onPageChange={setLinksPage}
                    totalItems={sortedLinks.length}
                    itemsPerPage={linksPerPage}
                  />
                </div>
              )}
            </div>
            );
          })()}

          {activeTab === 'files' && (() => {
            const manualFiles = files.filter(f => f.category === 'Manual');
            return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button 
                  className={`admin-btn flex items-center gap-2 ${manualFiles.length >= 1 ? 'bg-blue-300 text-white cursor-not-allowed border-none opacity-70' : 'admin-btn--primary'}`}
                  onClick={() => {
                    if (manualFiles.length < 1) {
                      setFileUploadCategory('Manual');
                      setIsFileModalOpen(true);
                    }
                  }}
                  disabled={manualFiles.length >= 1}
                  title={manualFiles.length >= 1 ? "Only 1 manual file allowed. Please delete the existing one first to upload a new one." : ""}
                >
                  {manualFiles.length >= 1 ? 'Maximum 1 file reached' : <><Plus size={16} /> Upload File</>}
                </button>
              </div>
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>File URL</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manualFiles.map((file) => (
                      <tr key={file.id}>
                        <td style={{ fontWeight: 500 }}>{file.name}</td>
                        <td><a href={file.file} target="_blank" rel="noreferrer" style={{ color: 'var(--color-navy)' }}>Download</a></td>
                        <td>
                          <span className={`admin-badge ${file.is_active ? 'admin-badge--success' : 'admin-badge--error'}`}>
                            {file.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setViewingManualFile(file)} style={{ padding: '6px', backgroundColor: 'var(--color-blue-50)', color: 'var(--color-blue-700)', borderRadius: '4px' }} title="Preview File"><Search size={16}/></button>
                            <button onClick={() => handleDeleteFile(file.id)} style={{ padding: '6px', backgroundColor: 'var(--color-red-50)', color: 'var(--color-red-700)', borderRadius: '4px' }} title="Delete File"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            );
          })()}

          {activeTab === 'org_structure' && (() => {
            const orgFiles = files.filter(f => f.category === 'OrgStructure');
            return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button 
                  className={`admin-btn flex items-center gap-2 ${orgFiles.length >= 1 ? 'bg-blue-300 text-white cursor-not-allowed border-none opacity-70' : 'admin-btn--primary'}`}
                  onClick={() => {
                    if (orgFiles.length < 1) {
                      setFileUploadCategory('OrgStructure');
                      setIsFileModalOpen(true);
                    }
                  }}
                  disabled={orgFiles.length >= 1}
                  title={orgFiles.length >= 1 ? "Maximum 1 image reached. Please delete the current image to upload a new one." : "Upload Image"}
                >
                  <Plus size={16} /> Add Image (Max 1)
                </button>
              </div>
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Preview</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orgFiles.length === 0 ? (
                      <tr className="bg-gray-50">
                        <td style={{ fontWeight: 500 }} className="text-gray-500">
                          Organizational Structure (Default)
                          <div className="text-xs text-gray-400 mt-1" style={{ fontSize: '0.75rem', marginTop: '4px' }}>Local asset actively displaying on website</div>
                        </td>
                        <td>
                          <img src="/assets/organizational structure library.png" alt="System Default" className="h-16 w-auto object-contain rounded border border-gray-300 opacity-70" />
                        </td>
                        <td>
                          <span className="admin-badge" style={{ backgroundColor: '#e5e7eb', color: '#4b5563' }}>
                            System Default
                          </span>
                        </td>
                        <td>
                          <div className="text-xs italic text-gray-400 text-center" style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic', textAlign: 'center' }}>
                            Upload to override
                          </div>
                        </td>
                      </tr>
                    ) : (
                      orgFiles.map((file) => (
                        <tr key={file.id}>
                          <td style={{ fontWeight: 500 }}>{file.name}</td>
                          <td>
                            <img src={getImageUrl(file.file)} alt={file.name} className="h-16 w-auto object-contain rounded border border-gray-200" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/file-placeholder.png'; }} />
                          </td>
                          <td>
                            <span className={`admin-badge ${file.is_active ? 'admin-badge--success' : 'admin-badge--error'}`}>
                              {file.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => setViewingManualFile(file)} style={{ padding: '6px', backgroundColor: 'var(--color-blue-50)', color: 'var(--color-blue-700)', borderRadius: '4px' }} title="Preview File"><Search size={16}/></button>
                              <button onClick={() => handleDeleteFile(file.id)} style={{ padding: '6px', backgroundColor: 'var(--color-red-50)', color: 'var(--color-red-700)', borderRadius: '4px' }} title="Delete File"><Trash2 size={16}/></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            );
          })()}

          {activeTab === 'excellence' && (() => {
            const excellenceFiles = files.filter(f => f.category === 'Excellence');
            return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button 
                  className={`admin-btn flex items-center gap-2 ${excellenceFiles.length >= 1 ? 'bg-blue-300 text-white cursor-not-allowed border-none opacity-70' : 'admin-btn--primary'}`}
                  onClick={() => {
                    if (excellenceFiles.length < 1) {
                      setFileUploadCategory('Excellence');
                      setIsFileModalOpen(true);
                    }
                  }}
                  disabled={excellenceFiles.length >= 1}
                  title={excellenceFiles.length >= 1 ? "Maximum 1 image reached. Please delete the existing one first to upload a new one." : "Upload Image"}
                >
                  {excellenceFiles.length >= 1 ? 'Maximum 1 image reached' : <><Plus size={16} /> Upload Image</>}
                </button>
              </div>
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Preview</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excellenceFiles.map((file) => (
                      <tr key={file.id}>
                        <td style={{ fontWeight: 500 }}>{file.name}</td>
                        <td>
                          <img src={getImageUrl(file.file)} alt={file.name} className="h-16 w-auto object-contain rounded border border-gray-200" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/file-placeholder.png'; }} />
                        </td>
                        <td>
                          <span className={`admin-badge ${file.is_active ? 'admin-badge--success' : 'admin-badge--error'}`}>
                            {file.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setViewingManualFile(file)} style={{ padding: '6px', backgroundColor: 'var(--color-blue-50)', color: 'var(--color-blue-700)', borderRadius: '4px' }} title="Preview File"><Search size={16}/></button>
                            <button onClick={() => handleDeleteFile(file.id)} style={{ padding: '6px', backgroundColor: 'var(--color-red-50)', color: 'var(--color-red-700)', borderRadius: '4px' }} title="Delete File"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            );
          })()}

          {activeTab === 'research_references' && (
            <ResearchReferencesManager />
          )}

          <PersonnelManager active={activeTab === 'personnel'} />
        </div>
      </div>

      {/* Link Modal */}
      {isLinkModalOpen && createPortal(
        <div className="fixed backdrop-blur-sm inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999] animate-modal-overlay">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-modal-card">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editingLink ? 'Edit Link' : 'Add Link'}</h2>
              <button onClick={() => setIsLinkModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleSaveLink} className="p-4 flex flex-col gap-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                <input required type="text" name="name" defaultValue={editingLink?.name || ''} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">URL</label>
                <input required type="url" name="url" defaultValue={editingLink?.url || ''} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category (e.g. 'Open Access Journals', 'Resources')</label>
                <input required type="text" name="category" defaultValue={editingLink?.category || ''} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Order Index</label>
                <input required type="number" name="order" defaultValue={editingLink?.order || 0} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input type="checkbox" name="is_active" defaultChecked={editingLink ? editingLink.is_active : true} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                <span className="text-sm font-medium text-gray-700">Link is Active</span>
              </label>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsLinkModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg" disabled={isSavingLink}>Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg flex items-center gap-2" disabled={isSavingLink}>
                  {isSavingLink ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {viewingManualFile && createPortal(
        <div className="fixed backdrop-blur-sm inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999] animate-modal-overlay" onClick={() => setViewingManualFile(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col animate-modal-card" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 truncate">Preview: {viewingManualFile.name}</h2>
              <button onClick={() => setViewingManualFile(null)} className="text-gray-400 hover:text-gray-600 bg-white p-1.5 rounded shadow-sm border border-gray-200 cursor-pointer transition-colors hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 bg-gray-100 overflow-hidden relative">
              {viewingManualFile.file.toLowerCase().endsWith('.pdf') ? (
                <object data={getImageUrl(viewingManualFile.file)} type="application/pdf" className="w-full h-full border-none bg-white">
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-500 p-6">
                    <span className="material-symbols-outlined text-6xl opacity-30">description</span>
                    <p className="text-lg text-center">PDF preview unavailable — the file may have been lost after a server restart.</p>
                    <a href={getImageUrl(viewingManualFile.file)} target="_blank" rel="noreferrer" className="admin-btn admin-btn--primary px-6 py-2">Try Download</a>
                  </div>
                </object>
              ) : viewingManualFile.file.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                <div className="w-full h-full flex items-center justify-center p-4 bg-gray-200">
                  <img src={getImageUrl(viewingManualFile.file)} alt="Preview" className="max-w-full max-h-full object-contain shadow-lg rounded" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/file-placeholder.png'; }} />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-500">
                  <span className="material-symbols-outlined text-6xl opacity-30">description</span>
                  <p className="text-lg">Browser preview is not available for this file type.</p>
                  <a href={getImageUrl(viewingManualFile.file)} target="_blank" rel="noreferrer" className="admin-btn admin-btn--primary px-6 py-2">Download File</a>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* File Modal */}
      {isFileModalOpen && createPortal(
        <div className="fixed backdrop-blur-sm inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999] animate-modal-overlay">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-modal-card">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Upload File</h2>
              <button onClick={() => { setIsFileModalOpen(false); setSelectedFile(null); }} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleUploadFile} className="p-4 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                <input required type="text" name="name" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
              </div>
              <input type="hidden" name="category" value={fileUploadCategory} />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">File</label>
                <DragDropFileUpload
                  accept={
                    fileUploadCategory === 'Manual'
                      ? '.doc,.docx,.pdf,.ppt,.pptx,.pub,.xls,.xlsx'
                      : ['OrgStructure', 'Excellence'].includes(fileUploadCategory)
                        ? 'image/*'
                        : '*/*'
                  }
                  multiple={false}
                  maxSizeMB={fileUploadCategory === 'Manual' ? 20 : 10}
                  onFilesSelected={(files) => setSelectedFile(files[0])}
                  label="Click to upload file or drag and drop"
                  subLabel={`Maximum file size: ${fileUploadCategory === 'Manual' ? '20MB' : '10MB'}`}
                />
                {selectedFile && (
                  <div className="mt-3 flex flex-col items-center">
                    {selectedFile.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="h-32 w-auto object-contain rounded border border-gray-200 shadow-sm animate-modal-card" />
                    ) : (
                       <p className="text-sm font-medium text-green-600">Selected: {selectedFile.name}</p>
                    )}
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input type="checkbox" name="is_active" defaultChecked={true} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                <span className="text-sm font-medium text-gray-700">File is Active</span>
              </label>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setIsFileModalOpen(false); setSelectedFile(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg flex items-center justify-center gap-2" disabled={!selectedFile || isUploadingFile}>
                  {isUploadingFile ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : null}
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




