import React, { useState, useEffect } from 'react';
import { referenceApi, PaginatedReferences } from '@/src/Endpoints/referenceApi';
import { Search, Link as LinkIcon, FileText } from 'lucide-react';
import { Pagination } from '@/src/Components/Shared/Pagination';
import { useIntersectionObserver } from '@/src/Hooks/useIntersectionObserver';
import { useDebounce } from '@/src/Hooks/useDebounce';
import { ReferenceFileViewerModal } from '@/src/Features/Collection/components/ReferenceFileViewerModal';

export function ResearchReferencesTable() {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [data, setData] = useState<PaginatedReferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [category, setCategory] = useState('All');
  const [selectedFileRef, setSelectedFileRef] = useState<{ id: number, name: string } | null>(null);
  
  const limit = 50;

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await referenceApi.getAllReferences(page, limit, debouncedSearch, category);
      setData(result);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, debouncedSearch, category]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };
  
  const handleCategoryChange = (categoryValue: string) => {
    setCategory(categoryValue);
    setPage(1);
  };

  return (
    <div className={`max-w-max-width mx-auto pb-12 px-4 md:px-0 reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-6 md:p-8 mb-8 overflow-hidden">
        
        <div className="text-center mb-8">
          <h2 className="font-headline-md font-bold text-3xl mb-3" style={{ color: 'var(--color-primary)' }}>
            Research & Thesis References
          </h2>
          <p className="text-sm md:text-base max-w-2xl mx-auto font-medium" style={{ color: 'var(--color-on-surface-variant)' }}>
            Explore our extensive catalog of research materials and thesis papers available for college students and faculty.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {['All', 'Research for College Student in JRMSU', 'Thesis and Dissertation'].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm border ${
                  category === cat 
                    ? 'bg-primary text-white border-primary scale-[1.02]' 
                    : 'bg-white/80 text-primary border-primary/20 hover:bg-gold-light hover:text-primary hover:border-gold-light'
                }`}
                style={category === cat ? { backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)' } : {}}
              >
                {cat === 'All' ? 'All Resources' : cat === 'Thesis and Dissertation' ? 'Thesis & Dissertation' : 'Student Research'}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-primary)', opacity: 0.5 }} size={18} />
            <input 
              type="text" 
              placeholder="Search by title, author, or call no..." 
              value={search}
              onChange={handleSearch}
              className="w-full pl-11 pr-4 py-3 bg-white/90 border border-primary/20 rounded-full focus:outline-none focus:ring-2 focus:ring-gold-light focus:border-gold-light transition-all text-sm font-medium"
              style={{ color: 'var(--color-primary)' }}
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-primary/10 shadow-inner bg-white/95">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b" style={{ backgroundColor: 'var(--color-surface-container-low)', borderColor: 'var(--color-outline-variant)' }}>
                <th className="px-6 py-4 text-sm font-bold whitespace-nowrap uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Call No.</th>
                <th className="px-6 py-4 text-sm font-bold w-full min-w-[300px] uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Title</th>
                <th className="px-6 py-4 text-sm font-bold whitespace-nowrap uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Author</th>
                <th className="px-6 py-4 text-sm font-bold whitespace-nowrap uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Copyright</th>
                <th className="px-6 py-4 text-sm font-bold whitespace-nowrap uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Status</th>
                <th className="px-6 py-4 text-sm font-bold whitespace-nowrap uppercase tracking-wider text-center" style={{ color: 'var(--color-primary)' }}>Access</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: 'var(--color-outline-variant)' }}>
              {loading && !data ? (
                <tr><td colSpan={6} className="text-center py-16 font-medium" style={{ color: 'var(--color-on-surface-variant)' }}>Loading catalog...</td></tr>
              ) : data?.results.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <div className="mb-4 flex justify-center" style={{ color: 'var(--color-primary)', opacity: 0.3 }}><Search size={48} /></div>
                    <p className="font-bold text-xl font-headline-sm" style={{ color: 'var(--color-primary)' }}>No records found</p>
                    <p className="text-sm mt-2 font-medium" style={{ color: 'var(--color-on-surface-variant)' }}>Try adjusting your search or category filter.</p>
                  </td>
                </tr>
              ) : (
                data?.results.map((ref) => (
                  <tr key={ref.id} className="transition-colors hover:bg-gold-light/10">
                    <td className="px-6 py-5 text-sm whitespace-nowrap font-medium" style={{ color: 'var(--color-on-surface-variant)' }}>{ref.call_number || '-'}</td>
                    <td className="px-6 py-5">
                      <div className="font-bold mb-1.5 leading-tight text-base" style={{ color: 'var(--color-primary)' }}>{ref.title}</div>
                      <div className="text-xs flex flex-wrap gap-2 items-center font-medium" style={{ color: 'var(--color-on-surface-variant)' }}>
                        <span className="bg-primary/5 px-2 py-1 rounded-md border border-primary/10">Acc No: {ref.acc_no || '-'}</span>
                        <span className={`px-2.5 py-1 rounded-md border ${
                          ref.category === 'Thesis and Dissertation' 
                            ? 'bg-purple-50 text-purple-700 border-purple-200' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {ref.category === 'Thesis and Dissertation' ? 'Thesis' : 'Research'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium" style={{ color: 'var(--color-on-surface)' }}>{ref.author || '-'}</td>
                    <td className="px-6 py-5 text-sm whitespace-nowrap font-medium" style={{ color: 'var(--color-on-surface-variant)' }}>{ref.copyright || '-'}</td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold" style={{ backgroundColor: 'var(--color-surface-container-highest)', color: 'var(--color-primary)' }}>
                        {ref.resource_status || 'Available'}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      {ref.access_type === 'none' && (
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-500">
                          Unavailable
                        </span>
                      )}
                      {ref.access_type === 'link' && ref.access_link && (
                        <a 
                          href={ref.access_link} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
                        >
                          <LinkIcon size={12} /> Link Available
                        </a>
                      )}
                      {ref.access_type === 'file' && ref.access_file && (
                        <button
                          onClick={() => setSelectedFileRef({ 
                            id: ref.id, 
                            name: ref.access_file?.split('/').pop() || `${ref.title} Document`
                          })}
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer"
                        >
                          <FileText size={12} /> View File
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {data && data.total_pages > 0 && (
          <div className="pt-8 mt-4 flex justify-center">
            <Pagination 
              currentPage={data.current_page} 
              totalPages={data.total_pages} 
              totalItems={data.count}
              itemsPerPage={limit}
              onPageChange={setPage} 
            />
          </div>
        )}
      </div>
      
      {/* File Viewer Modal */}
      {selectedFileRef && (
        <ReferenceFileViewerModal
          referenceId={selectedFileRef.id}
          fileName={selectedFileRef.name}
          onClose={() => setSelectedFileRef(null)}
        />
      )}
    </div>
  );
}
