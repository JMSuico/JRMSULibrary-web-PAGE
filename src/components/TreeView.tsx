import React, { useState } from 'react';
import type { TreeNodeData } from '../assets/treeData';

interface TreeViewProps {
  nodes: TreeNodeData[];
  onFileSelect: (node: TreeNodeData) => void;
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

export const TreeView: React.FC<TreeViewProps> = ({ nodes, onFileSelect }) => {
  return (
    <div className="border border-outline-variant rounded-xl bg-white overflow-hidden">
      <div className="p-4 border-b border-outline-variant bg-surface-container-low">
        <h3 className="font-headline-md font-bold text-primary">eBooks & Journals</h3>
        <p className="text-xs text-on-surface-variant mt-1">Browse by department and course</p>
      </div>
      <div className="p-2 max-h-[500px] overflow-y-auto">
        {nodes.map((node, idx) => (
          <TreeNode key={idx} node={node} depth={0} onFileSelect={onFileSelect} />
        ))}
      </div>
    </div>
  );
};