import React, { useState, useEffect } from 'react';
import { cmsApi, PageContent, ManagedLink, ManagedFile } from '@/src/Endpoints/cmsApi';
import { Save, Plus, Trash2, Edit2 } from 'lucide-react';

export default function ContentManagerPage() {
  const [activeTab, setActiveTab] = useState<'content' | 'links' | 'files'>('content');
  const [loading, setLoading] = useState(false);

  // Content State
  const [contents, setContents] = useState<PageContent[]>([]);
  
  // Link State
  const [links, setLinks] = useState<ManagedLink[]>([]);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ManagedLink | null>(null);

  // File State
  const [files, setFiles] = useState<ManagedFile[]>([]);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, l, f] = await Promise.all([
        cmsApi.getAllContent(),
        cmsApi.getAllLinks(),
        cmsApi.getAllFiles()
      ]);
      setContents(c);
      setLinks(l);
      setFiles(f);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Content Handlers ---
  const handleSaveContent = async (slug: string, content: string) => {
    try {
      await cmsApi.updateContent(slug, { content });
      alert('Content saved!');
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to save content.');
    }
  };

  // --- Link Handlers ---
  const handleSaveLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      label: fd.get('label') as string,
      url: fd.get('url') as string,
      group: fd.get('group') as string,
      order: parseInt(fd.get('order') as string, 10),
      is_active: fd.get('is_active') === 'on'
    };

    try {
      if (editingLink) {
        await cmsApi.updateLink(editingLink.id, payload);
      } else {
        await cmsApi.createLink(payload);
      }
      setIsLinkModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to save link.');
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (!confirm('Delete this link?')) return;
    try {
      await cmsApi.deleteLink(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // --- File Handlers ---
  const handleUploadFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await cmsApi.createFile(fd);
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
      await cmsApi.deleteFile(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && contents.length === 0) {
    return <div className="p-8 text-center text-gray-500">Loading CMS...</div>;
  }

  return (
    <>
      <div className="admin-content__header">
        <h1>Content Manager</h1>
        <p>Manage the dynamic content, external links, and downloadable files.</p>
      </div>

      <div className="admin-table-wrapper" style={{ padding: 0 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          <button 
            onClick={() => setActiveTab('content')}
            style={{ padding: '16px 24px', fontWeight: 600, borderBottom: activeTab === 'content' ? '2px solid #002B7F' : 'none', color: activeTab === 'content' ? '#002B7F' : '#6b7280' }}
          >
            Page Text Content
          </button>
          <button 
            onClick={() => setActiveTab('links')}
            style={{ padding: '16px 24px', fontWeight: 600, borderBottom: activeTab === 'links' ? '2px solid #002B7F' : 'none', color: activeTab === 'links' ? '#002B7F' : '#6b7280' }}
          >
            External Links
          </button>
          <button 
            onClick={() => setActiveTab('files')}
            style={{ padding: '16px 24px', fontWeight: 600, borderBottom: activeTab === 'files' ? '2px solid #002B7F' : 'none', color: activeTab === 'files' ? '#002B7F' : '#6b7280' }}
          >
            Downloadable Files
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '24px' }}>
          {activeTab === 'content' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {contents.map((item) => (
                <div key={item.id} style={{ border: '1px solid #e5e7eb', padding: '16px', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{item.title}</h3>
                  <textarea 
                    defaultValue={item.content}
                    id={`content-${item.slug}`}
                    style={{ width: '100%', height: '100px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '4px', marginBottom: '12px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      className="admin-btn admin-btn--primary flex items-center gap-2"
                      onClick={() => {
                        const val = (document.getElementById(`content-${item.slug}`) as HTMLTextAreaElement).value;
                        handleSaveContent(item.slug, val);
                      }}
                    >
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'links' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button 
                  className="admin-btn admin-btn--primary flex items-center gap-2"
                  onClick={() => { setEditingLink(null); setIsLinkModalOpen(true); }}
                >
                  <Plus size={16} /> Add Link
                </button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Label</th>
                    <th>URL</th>
                    <th>Group</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => (
                    <tr key={link.id}>
                      <td style={{ fontWeight: 500 }}>{link.label}</td>
                      <td><a href={link.url} target="_blank" rel="noreferrer" style={{ color: '#002B7F' }}>{link.url}</a></td>
                      <td><span className="admin-badge admin-badge--info">{link.group}</span></td>
                      <td>{link.order}</td>
                      <td>
                        <span className={`admin-badge ${link.is_active ? 'admin-badge--success' : 'admin-badge--error'}`}>
                          {link.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { setEditingLink(link); setIsLinkModalOpen(true); }} style={{ padding: '6px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '4px' }}><Edit2 size={16}/></button>
                        <button onClick={() => handleDeleteLink(link.id)} style={{ padding: '6px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '4px' }}><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'files' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button 
                  className="admin-btn admin-btn--primary flex items-center gap-2"
                  onClick={() => setIsFileModalOpen(true)}
                >
                  <Plus size={16} /> Upload File
                </button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>File URL</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id}>
                      <td style={{ fontWeight: 500 }}>{file.title}</td>
                      <td><a href={file.file} target="_blank" rel="noreferrer" style={{ color: '#002B7F' }}>Download</a></td>
                      <td>
                        <span className={`admin-badge ${file.is_active ? 'admin-badge--success' : 'admin-badge--error'}`}>
                          {file.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleDeleteFile(file.id)} style={{ padding: '6px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '4px' }}><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editingLink ? 'Edit Link' : 'Add Link'}</h2>
              <button onClick={() => setIsLinkModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleSaveLink} className="p-4 flex flex-col gap-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Label</label>
                <input required type="text" name="label" defaultValue={editingLink?.label || ''} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">URL</label>
                <input required type="url" name="url" defaultValue={editingLink?.url || ''} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Group (e.g. 'e-journals', 'partners')</label>
                <input required type="text" name="group" defaultValue={editingLink?.group || ''} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
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
                <button type="button" onClick={() => setIsLinkModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg">Cancel</button>
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
              <h2 className="text-lg font-bold text-gray-900">Upload File</h2>
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