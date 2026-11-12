import { useState, useMemo, useEffect } from 'react';
import { eBooksTree, type TreeNodeData } from '@/src/Libs/Assets/treeData';
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

export function resolveResourceFilePath(rawPath: string | null | undefined): string {
  if (!rawPath) return '/assets/sample.pdf';
  
  // If already a full URL (e.g. S3, Supabase, or external proxy)
  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
    try {
      const parsed = new URL(rawPath);
      if (parsed.pathname.startsWith('/media/')) {
        return parsed.pathname;
      }
    } catch {
      // ignore invalid URL format
    }
    return rawPath;
  }

  // Already prefixed
  if (rawPath.startsWith('/media/') || rawPath.startsWith('/assets/')) {
    return rawPath;
  }

  // Relative Django e_resources paths
  if (rawPath.startsWith('e_resources/')) {
    return `/media/${rawPath}`;
  }
  if (rawPath.startsWith('/e_resources/')) {
    return `/media${rawPath}`;
  }
  if (rawPath.startsWith('media/')) {
    return `/${rawPath}`;
  }

  return rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
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
          path: resolveResourceFilePath(f.file)
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
      const [depsRes, linksRes] = await Promise.allSettled([
        eresourceApi.getAllDepartments(),
        cmsApi.getAllLinks()
      ]);
      
      if (depsRes.status === 'fulfilled' && Array.isArray(depsRes.value)) {
        setDepartments(depsRes.value);
      }
      
      if (linksRes.status === 'fulfilled' && Array.isArray(linksRes.value)) {
        setOnlineLinks(linksRes.value.filter(l => l.is_active));
      }

      // If backend is unreachable or returning 502, smoothly fallback to bundled catalog
      if (depsRes.status === 'rejected' && linksRes.status === 'rejected') {
        console.warn('Backend currently offline/restarting, smoothly serving bundled offline library catalog.');
      }
    } catch (e: any) {
      console.warn('Failed to load Collection resources, using offline fallback', e);
    } finally {
      setLoadingResources(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useAutoRefresh(load, 30000);

  const localTree = useMemo(() => {
    const dynamic = mapDepartmentsToTree(departments);
    return dynamic.length > 0 ? dynamic : eBooksTree;
  }, [departments]);
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
