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

  const allFiles = useMemo(() => collectFiles(eBooksTree), []);

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
            <TreeView nodes={eBooksTree} onFileSelect={setSelectedFile} />
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