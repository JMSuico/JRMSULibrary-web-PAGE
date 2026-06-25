import React, { useState, useMemo } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { TreeView } from './TreeView';
import { FileViewerModal } from './FileViewerModal';
import { openAccessLinks, resourcesLinks, acquiredELinks } from '../assets/data';
import { eBooksTree } from '../assets/treeData';
import type { TreeNodeData } from '../assets/treeData';

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

export const EResourcesPage: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [selectedFile, setSelectedFile] = useState<TreeNodeData | null>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'online'>('files');
  const [searchQuery, setSearchQuery] = useState('');

  const allFiles = useMemo(() => collectFiles(eBooksTree), []);
  const filteredTree = useMemo(() => filterTree(eBooksTree, searchQuery), [searchQuery]);

  return (
    <section id="e-resources" className={`py-section-py-desktop reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="max-w-max-width mx-auto px-4 md:px-gutter">
        <div className="text-center mb-10">
          <h2 className="font-headline-lg font-bold text-4xl mb-4" style={{ color: '#001851', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>E-Resources</h2>
          <p className="max-w-2xl mx-auto" style={{ color: '#001851', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            Access digital books, journals, and online research databases available to the JRMSU community.
          </p>
        </div>

        {/* Radio button tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { id: 'files', label: 'File Services' },
            { id: 'online', label: 'Online Access' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'files' | 'online')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all cursor-pointer border-2 ${
                activeTab === tab.id
                  ? 'bg-primary text-gold-light border-primary shadow-lg'
                  : 'bg-transparent text-primary border-primary/40 hover:border-primary hover:bg-primary/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'files' && (
          <div className="max-w-3xl mx-auto mb-12">
            <div className="mb-6 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50">search</span>
              <input
                type="text"
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/50 border border-primary/20 rounded-xl py-3 pl-12 pr-4 text-primary placeholder-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm backdrop-blur-sm"
              />
            </div>
            {filteredTree.length > 0 ? (
              <TreeView nodes={filteredTree} onFileSelect={setSelectedFile} />
            ) : (
              <div className="text-center py-10 bg-white/50 rounded-xl border border-primary/10">
                <span className="material-symbols-outlined text-4xl text-primary/30 mb-2">search_off</span>
                <p className="text-primary/70">No files found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'online' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <LinkTable title="Open Access Journals" links={openAccessLinks} />
            <LinkTable title="Resources" links={resourcesLinks} />
            <LinkTable title="Acquired E-Resources" links={acquiredELinks} />
          </div>
        )}
      </div>

      {/* File Viewer Modal */}
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
};