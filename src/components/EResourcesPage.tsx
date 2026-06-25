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
  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-outline-variant">
    <h3 className="font-headline-md font-bold text-xl text-primary mb-4">{title}</h3>
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
          <span className="text-sm text-on-surface group-hover:text-primary transition-colors flex-1">
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

  const allFiles = useMemo(() => collectFiles(eBooksTree), []);

  return (
    <section id="e-resources" className={`py-section-py-desktop reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="max-w-max-width mx-auto px-4 md:px-gutter">
        <div className="text-center mb-10">
          <h2 className="font-headline-lg font-bold text-4xl text-primary mb-4">E-Resources</h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto">
            Access digital books, journals, and online research databases available to the JRMSU community.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Tree View */}
          <div>
            <TreeView nodes={eBooksTree} onFileSelect={setSelectedFile} />
          </div>

          {/* Online Access Tables */}
          <div className="space-y-6">
            <LinkTable title="Open Access Journals" links={openAccessLinks} />
            <LinkTable title="Resources" links={resourcesLinks} />
            <LinkTable title="Acquired E-Resources" links={acquiredELinks} />
          </div>
        </div>
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