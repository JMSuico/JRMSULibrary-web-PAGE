import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntersectionObserver } from '@/src/Hooks/useIntersectionObserver';
import { NewlyAcquiredBooks } from '@/src/Features/Collection/components/NewlyAcquiredBooks';
import { TreeView } from '@/src/Components/Shared/TreeView';
import { FileViewerModal } from '@/src/Components/Modals/FileViewerModal';
import { openAccessLinks, resourcesLinks, acquiredELinks } from '@/src/Libs/Assets/data';
import { eBooksTree } from '@/src/Libs/Assets/treeData';
import type { TreeNodeData } from '@/src/Libs/Assets/treeData';

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

interface LinkTableProps {
  title: string;
  links: { name: string; url: string }[];
}

const LinkTable: React.FC<LinkTableProps> = ({ title, links }) => (
  <div className="rounded-2xl p-6 shadow-lg border border-gold-light/20" style={{ background: 'rgba(0,24,81,0.9)', backdropFilter: 'blur(8px)' }}>
    <h3 className="font-headline-md font-bold text-xl mb-4 text-gold-light">{title}</h3>
    <div className="space-y-1">
      {links.map((link, idx) => (
        <a
          key={idx}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/5 transition-colors group"
        >
          <span className="material-symbols-outlined text-primary text-lg">link</span>
          <span className="text-sm group-hover:text-gold-light transition-colors flex-1 text-white/90">
            {link.name}
          </span>
          <span className="material-symbols-outlined text-on-surface-variant/50 text-sm group-hover:translate-x-0.5 transition-transform">
            arrow_forward
          </span>
        </a>
      ))}
    </div>
  </div>
);

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

  const activeTab = tab === 'local-books' ? 'local-books' : tab === 'online' ? 'online' : 'newly-acquired';
  const allFiles = useMemo(() => collectFiles(eBooksTree), []);
  const filteredTree = useMemo(() => {
    const filtered = filterTree(eBooksTree, searchQuery);
    return sortTree(filtered, sortOrder);
  }, [searchQuery, sortOrder]);

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

        {/* Local Books (was File Services) — TreeView with search/sort */}
        {activeTab === 'local-books' && (
          <div className="max-w-3xl mx-auto mb-12">
            <TreeView
              nodes={filteredTree}
              onFileSelect={setSelectedFile}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortOrder={sortOrder}
              onSortChange={(s) => setSortOrder(s as any)}
            />
          </div>
        )}

        {/* Online Access — Link tables */}
        {activeTab === 'online' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <LinkTable title="Open Access Journals" links={openAccessLinks} />
            <LinkTable title="Resources" links={resourcesLinks} />
            <LinkTable title="Acquired E-Resources" links={acquiredELinks} />
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
