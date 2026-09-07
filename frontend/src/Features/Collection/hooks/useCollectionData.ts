import { useState, useMemo, useEffect } from 'react';
import type { TreeNodeData } from '@/src/Libs/Assets/treeData';
import { eresourceApi, EResourceDepartment } from '@/src/Endpoints/eresourceApi';
import { cmsApi, ManagedLink } from '@/src/Endpoints/cmsApi';
import { defaultExternalLinks } from '@/src/Libs/Assets/defaultLinks';
import { useAutoRefresh } from '@/src/Hooks/useAutoRefresh';

export function collectFiles(nodes: TreeNodeData[]): TreeNodeData[] {
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

export function mapLinksToTree(links: ManagedLink[]): TreeNodeData[] {
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

export function mapDepartmentsToTree(departments: EResourceDepartment[]): TreeNodeData[] {
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
          // Use relative path so Vite proxy or Nginx handles it
          path: f.file.startsWith('http') ? f.file : f.file
        }))
    ]
  })).filter(node => node.children && node.children.length > 0);
}

export function filterTree(nodes: TreeNodeData[], query: string): TreeNodeData[] {
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

export function sortTree(nodes: TreeNodeData[], order: 'A-Z' | 'Z-A' | 'Folders First' | 'Files First'): TreeNodeData[] {
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

export function useCollectionData(activeTab: string) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'Folders First' | 'Files First' | 'A-Z' | 'Z-A'>('Folders First');
  const [departments, setDepartments] = useState<EResourceDepartment[]>([]);
  const [onlineLinks, setOnlineLinks] = useState<ManagedLink[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const displayLinks = onlineLinks.length > 0 ? onlineLinks : (defaultExternalLinks as any as ManagedLink[]);

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

  useEffect(() => {
    load();
  }, []);

  useAutoRefresh(load, 30000);

  const localTree = useMemo(() => mapDepartmentsToTree(departments), [departments]);
  const onlineTree = useMemo(() => mapLinksToTree(onlineLinks), [onlineLinks]);

  const currentTree = activeTab === 'online' ? onlineTree : localTree;
  const allFiles = useMemo(() => collectFiles(currentTree), [currentTree]);
  const filteredTree = useMemo(() => {
    const filtered = filterTree(currentTree, searchQuery);
    return sortTree(filtered, sortOrder);
  }, [currentTree, searchQuery, sortOrder]);

  return {
    departments,
    onlineLinks,
    displayLinks,
    loadingResources,
    errorMsg,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    allFiles,
    filteredTree,
    load,
  };
}
