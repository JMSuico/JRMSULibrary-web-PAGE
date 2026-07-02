import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntersectionObserver } from '@/src/Hooks/useIntersectionObserver';
import { NewlyAcquiredBooks } from '@/src/Features/Collection/components/NewlyAcquiredBooks';
import { TreeView } from '@/src/Components/Shared/TreeView';
import { FileViewerModal } from '@/src/Components/Modals/FileViewerModal';
import { eBooksTree } from '@/src/Libs/Assets/treeData';
import type { TreeNodeData } from '@/src/Libs/Assets/treeData';
import { eresourceApi, EResourceDepartment } from '@/src/Endpoints/eresourceApi';
import { cmsApi, ManagedLink } from '@/src/Endpoints/cmsApi';
import { Loader2 } from 'lucide-react';

function collectFiles(nodes: TreeNodeData[]): TreeNodeData[] {
  const files: TreeNodeData[] = [];
  for (const node of nodes) {
    if (node.type === 'file' && node.path) {
      files.push(node);
    }
    if (node.children) {
      files.push(...collectFiles(node.children));
    }
  }
  return files;
}

function mapLinksToTree(links: ManagedLink[]): TreeNodeData[] {
  const groups: Record<string, ManagedLink[]> = {};
  links.forEach(link => {
    const group = link.category || 'Other Resources';
    if (!groups[group]) groups[group] = [];
    groups[group].push(link);
  });
  
  return Object.keys(groups).sort().map(group => ({
    name: group,
    type: 'folder' as const,
    children: groups[group].map(link => ({
      name: link.name,
      type: 'file' as const,
      path: link.url
    }))
  }));
}

function mapDepartmentsToTree(departments: EResourceDepartment[]): TreeNodeData[] {
  return departments.map(dept => ({
    name: dept.name,
    type: 'folder' as const,
    children: [
      ...mapDepartmentsToTree(dept.children || []),
      ...(dept.files || [])
        .filter(f => f.is_active)
        .map(f => ({
          name: f.name,
          type: 'file' as const,
          // API returns paths like "/media/e_resources/..." — prefix with backend base URL
          path: f.file.startsWith('http') ? f.file : `http://127.0.0.1:8000${f.file}`
        }))
    ]
  })).filter(node => node.children && node.children.length > 0);
}

function filterTree(nodes: TreeNodeData[], query: string): TreeNodeData[] {
  if (!query.trim()) return nodes;
  const lowerQuery = query.toLowerCase();
  
  return nodes.map(node => {
    const isMatch = node.name.toLowerCase().includes(lowerQuery);
    
    if (node.children) {
      const filteredChildren = filterTree(node.children, query);
      if (isMatch || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
      return null;
    }
    
    return isMatch ? node : null;
  }).filter((node): node is TreeNodeData => node !== null);
}

function sortTree(nodes: TreeNodeData[], order: 'A-Z' | 'Z-A' | 'Folders First' | 'Files First'): TreeNodeData[] {
  const sorted = nodes.map(node => ({
    ...node,
    children: node.children ? sortTree(node.children, order) : undefined
  }));

  return sorted.sort((a, b) => {
    if (order === 'Folders First') {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    }
    if (order === 'Files First') {
      if (a.type !== b.type) return a.type === 'file' ? -1 : 1;
      return a.name.localeCompare(b.name);
    }
    
    const comp = a.name.localeCompare(b.name);
    return order === 'A-Z' ? comp : -comp;
  });
}


const tabOptions = [
  { id: 'newly-acquired', label: 'Newly Acquired Books' },
  { id: 'local-books', label: 'Local Books' },
  { id: 'online', label: 'Online Access' },
];

export default function CollectionPage() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [selectedFile, setSelectedFile] = useState<TreeNodeData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'Folders First' | 'Files First' | 'A-Z' | 'Z-A'>('Folders First');
  const [departments, setDepartments] = useState<EResourceDepartment[]>([]);
  const [onlineLinks, setOnlineLinks] = useState<ManagedLink[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [onlineViewMode, setOnlineViewMode] = useState<'grid' | 'table'>('grid');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoadingResources(true);
      setErrorMsg(null);
      try {
        console.log('Fetching Collection resources...');
        const [deps, links] = await Promise.all([
          eresourceApi.getAllDepartments(),
          cmsApi.getAllLinks()
        ]);
        console.log('Fetched deps:', deps);
        console.log('Fetched links:', links);
        setDepartments(deps);
        setOnlineLinks(links.filter(l => l.is_active));
      } catch (e: any) {
        console.error('Failed to load Collection resources', e);
        setErrorMsg(e.message || 'Failed to load');
      } finally {
        setLoadingResources(false);
      }
    };
    load();
  }, []);

  const activeTab = tab === 'online' ? 'online' : tab === 'newly-acquired' ? 'newly-acquired' : 'local-books';
  
  const localTree = useMemo(() => mapDepartmentsToTree(departments), [departments]);
  const onlineTree = useMemo(() => mapLinksToTree(onlineLinks), [onlineLinks]);
  
  const currentTree = activeTab === 'online' ? onlineTree : localTree;
  const allFiles = useMemo(() => collectFiles(currentTree), [currentTree]);
  const filteredTree = useMemo(() => {
    const filtered = filterTree(currentTree, searchQuery);
    return sortTree(filtered, sortOrder);
  }, [currentTree, searchQuery, sortOrder]);

  const setActiveTab = (t: string) => {
    navigate(`/collection/${t}`, { replace: true });
  };

  return (
    <section id="collection" className={`pt-28 pb-20 reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="max-w-max-width mx-auto px-4 md:px-gutter">
        <div className="text-center mb-10">
          <h2 className="font-headline-lg font-bold text-2xl sm:text-3xl md:text-4xl mb-4" style={{ color: '#001851', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>Collection</h2>
          <p className="max-w-2xl mx-auto" style={{ color: '#001851', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            Browse the library's print and digital collections — newly acquired books, local eBooks, and online research databases.
          </p>
        </div>

        {/* Dropdown / Tab selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabOptions.map((t) => (
            <button
              key={t.id}
              className={`tab-pill ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Newly Acquired Books — renders the existing component as-is */}
        {activeTab === 'newly-acquired' && (
          <NewlyAcquiredBooks />
        )}

        {/* Local Books — TreeView with search/sort */}
        {activeTab === 'local-books' && (
          <div className="max-w-3xl mx-auto mb-12">
            {loadingResources ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-gold-light w-8 h-8" />
              </div>
            ) : errorMsg ? (
              <div className="text-center text-red-500 py-12">
                Error: {errorMsg}
              </div>
            ) : filteredTree.length > 0 ? (
              <TreeView
                nodes={filteredTree}
                onFileSelect={setSelectedFile}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortOrder={sortOrder}
                onSortChange={(s) => setSortOrder(s as any)}
              />
            ) : (
              <div className="text-center text-white/70 py-12">
                No E-Resources available at the moment.
              </div>
            )}
          </div>
        )}

        {/* Online Access — Categorized with Grid/Table View */}
        {activeTab === 'online' && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <span className="text-navy-mid text-sm font-medium">Browse online resources by category</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setOnlineViewMode('grid')}
                  className={`p-2.5 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${onlineViewMode === 'grid' ? 'bg-navy-mid text-white border-navy-mid shadow-lg' : 'bg-white text-navy-mid border-navy-mid/40 hover:bg-navy-mid hover:text-white'}`}
                  title="Grid View"
                >
                  <span className="material-symbols-outlined text-xl">grid_view</span>
                </button>
                <button 
                  onClick={() => setOnlineViewMode('table')}
                  className={`p-2.5 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${onlineViewMode === 'table' ? 'bg-navy-mid text-white border-navy-mid shadow-lg' : 'bg-white text-navy-mid border-navy-mid/40 hover:bg-navy-mid hover:text-white'}`}
                  title="Table View"
                >
                  <span className="material-symbols-outlined text-xl">table_chart</span>
                </button>
              </div>
            </div>

            {loadingResources ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-gold-light w-8 h-8" />
              </div>
            ) : errorMsg ? (
              <div className="text-center text-red-500 py-12">
                Error: {errorMsg}
              </div>
            ) : onlineLinks.length > 0 ? (
              <div className="space-y-12">
                {(Object.entries(
                  onlineLinks.reduce((acc, link) => {
                    const cat = link.category || 'Other Resources';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(link);
                    return acc;
                  }, {} as Record<string, ManagedLink[]>)
                ) as [string, ManagedLink[]][]).map(([category, links]) => (
                  <div key={category} className="animate-fade-in">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1.5 h-8 rounded-full bg-navy-mid" />
                      <h3 className="font-headline-md font-bold text-2xl text-navy-mid" style={{ textShadow: 'none' }}>
                        {category}
                      </h3>
                      <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full bg-navy-mid/80 text-white border border-white/20">
                        {links.length} resource{links.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {onlineViewMode === 'grid' ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {links.map((link) => (
                          <div key={link.id} className="bg-primary/85 backdrop-blur-md rounded-2xl p-6 border border-gold-light/30 flex flex-col items-center text-center shadow-2xl hover:-translate-y-1 transition-transform">
                            <div className="w-16 h-16 bg-white/10 text-gold-light rounded-full flex items-center justify-center mb-4 border border-white/5">
                              <span className="material-symbols-outlined text-3xl">public</span>
                            </div>
                            <h4 className="font-bold text-xl text-gold-light mb-6">{link.name}</h4>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary mt-auto w-full inline-flex items-center justify-center gap-2 px-6 py-2 rounded-full font-bold shadow-lg text-sm"
                            >
                              Visit Website
                              <span className="material-symbols-outlined text-base">open_in_new</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-primary/85 backdrop-blur-md rounded-2xl border border-gold-light/30 overflow-hidden shadow-2xl">
                        <table className="w-full text-left text-white/90">
                          <thead className="bg-black/20 border-b border-gold-light/20">
                            <tr>
                              <th className="px-6 py-4 font-bold text-gold-light">Resource Name</th>
                              <th className="px-6 py-4 font-bold text-gold-light text-right">Link</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gold-light/10">
                            {links.map(link => (
                              <tr key={link.id} className="hover:bg-white/10 transition-colors">
                                <td className="px-6 py-4 font-medium flex items-center gap-3">
                                  <span className="material-symbols-outlined text-gold-light">public</span>
                                  {link.name}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-end gap-1 text-gold-light hover:text-white transition-colors text-sm font-bold bg-white/5 hover:bg-white/20 px-4 py-2 rounded-lg"
                                  >
                                    Visit
                                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-white/70 py-12">
                No External Links available.
              </div>
            )}
          </div>
        )}
      </div>

      {/* File Viewer Modal for Local Books */}
      {selectedFile && (
        <FileViewerModal
          file={selectedFile}
          fileList={allFiles}
          onClose={() => setSelectedFile(null)}
          onNavigate={setSelectedFile}
        />
      )}
    </section>
  );
}
