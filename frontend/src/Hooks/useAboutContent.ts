import { useState, useEffect } from 'react';
import { cmsApi, PageContent } from '@/src/Endpoints/cmsApi';

export function extractTextBlocksFromHtml(html: string): string[] {
  if (!html) return [];
  // Parse HTML and extract inner text of li or p elements
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const items = Array.from(doc.querySelectorAll('li, p'))
    .map(el => el.textContent?.trim() || '')
    .filter(text => text.length > 0);
  
  // If no structured tags were found, fallback to just splitting by line breaks or returning the raw text
  if (items.length === 0) {
    return [doc.body.textContent?.trim() || ''];
  }
  return items;
}

export function useAboutContent() {
  const [historyContent, setHistoryContent] = useState<PageContent | null>(null);
  const [objectivesContent, setObjectivesContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const contents = await cmsApi.getAllContent();
        setHistoryContent(contents.find(c => c.slug === 'about_history') || null);
        setObjectivesContent(contents.find(c => c.slug === 'about_quality') || null);
      } catch (err) {
        console.error('Failed to load About page content', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  return {
    historyContent,
    objectivesContent,
    loading,
    extractTextBlocksFromHtml,
  };
}
