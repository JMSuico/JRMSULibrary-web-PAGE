import React, { useState } from 'react';
import type { TreeNodeData } from '@/src/Libs/Assets/treeData';

interface TreeViewProps {
  nodes: TreeNodeData[];
  onFileSelect: (node: TreeNodeData) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  sortOrder?: string;
  onSortChange?: (s: string) => void;
}

interface TreeNodeProps {
  node: TreeNodeData;
  depth: number;
  onFileSelect: (node: TreeNodeData) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, depth, onFileSelect }) => {
  const [isOpen, setIsOpen] = useState(depth < 1);

  if (node.type === 'file') {
    return (
      <div className="tree-node">
        <div
          className="tree-node-header file"
          onClick={() => node.path && onFileSelect(node)}
          style={{ paddingLeft: `${12 + depth * 20}px` }}
        >
          <span className="tree-icon file-icon material-symbols-outlined text-sm">description</span>
          <span className="text-sm truncate">{node.name}</span>
        </div>
      </div>
    );
  }

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="tree-node">
      <div
        className="tree-node-header"
        onClick={() => hasChildren && setIsOpen(!isOpen)}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        <span className={`tree-icon expand material-symbols-outlined ${isOpen ? 'open' : ''}`}>
          chevron_right
        </span>
        <span className={`tree-icon folder material-symbols-outlined`}>
          {isOpen ? 'folder_open' : 'folder'}
        </span>
        <span className="text-sm font-medium">{node.name}</span>
        {hasChildren && (
          <span className="text-xs text-on-surface-variant/60 ml-1">
            ({node.children!.length})
          </span>
        )}
      </div>
      {hasChildren && (
        <div
          className="tree-children"
          style={{ maxHeight: isOpen ? '10000px' : '0' }}
        >
          {node.children!.map((child, idx) => (
            <TreeNode key={idx} node={child} depth={depth + 1} onFileSelect={onFileSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export const TreeView: React.FC<TreeViewProps> = ({
  nodes,
  onFileSelect,
  searchQuery = '',
  onSearchChange,
  sortOrder = 'Folders First',
  onSortChange,
}) => {
  return (
    <div className="border border-outline-variant rounded-xl bg-white overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-outline-variant bg-surface-container-low">
        <h3 className="font-headline-md font-bold text-primary">eBooks & Journals</h3>
        <p className="text-xs text-on-surface-variant mt-1">Browse by department and course</p>
      </div>

      {/* Search + Sort Controls — always visible inside the card */}
      <div className="px-3 py-3 border-b border-outline-variant flex flex-col sm:flex-row gap-2" style={{ background: '#f4f3fa' }}>
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base" style={{ color: 'var(--color-primary)', opacity: 0.5 }}>search</span>
          <input
            type="text"
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => onSearchChange ? onSearchChange(e.target.value) : undefined}
            className="w-full rounded-lg py-2 pl-10 pr-9 text-sm focus:outline-none focus:ring-2"
            style={{
              background: 'var(--color-white)',
              border: '1px solid #c4c6d3',
              color: '#1a1b21',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange?.('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              style={{ color: '#444651' }}
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>
        <div className="relative shrink-0 w-full sm:w-44">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base" style={{ color: 'var(--color-primary)', opacity: 0.5 }}>sort</span>
          <select
            value={sortOrder}
            onChange={(e) => onSortChange?.(e.target.value)}
            className="w-full rounded-lg py-2 pl-9 pr-8 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2"
            style={{
              background: 'var(--color-white)',
              border: '1px solid #c4c6d3',
              color: '#1a1b21',
            }}
          >
            <option value="Folders First">Folders First</option>
            <option value="Files First">Files First</option>
            <option value="A-Z">A to Z</option>
            <option value="Z-A">Z to A</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-base" style={{ color: 'var(--color-primary)', opacity: 0.5 }}>expand_more</span>
        </div>
      </div>

      {/* Tree Content */}
      <div className="p-2 max-h-[500px] overflow-y-auto">
        {nodes.length > 0 ? (
          nodes.map((node, idx) => (
            <TreeNode key={idx} node={node} depth={0} onFileSelect={onFileSelect} />
          ))
        ) : (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">search_off</span>
            <p className="text-sm text-on-surface-variant/60 mt-2">No files match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};