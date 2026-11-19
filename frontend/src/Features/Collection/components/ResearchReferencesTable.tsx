import React, { useState } from 'react';
import { referenceApi, type PaginatedReferences } from '@/src/Endpoints/referenceApi';
import { Search, Link as LinkIcon, FileText } from 'lucide-react';
import { Pagination } from '@/src/Components/Shared/Pagination';
import { PAGE_SIZE_OPTIONS } from '@/src/Hooks/usePagination';
import {
  useIntersectionObserver,
  useDebounce,
  useAutoRefresh,
  useDraggableScroll,
  useCachedQuery,
  usePersistentState,
  useScrollRestoration,
} from '@/src/Hooks';
import { ReferenceFileViewerModal } from '@/src/Features/Collection/components/ReferenceFileViewerModal';

const isPositiveInt = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1;

const isStringValue = (value: unknown): value is string => typeof value === 'string';

export const ResearchReferencesTable: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [page, setPage] = usePersistentState<number>('public:references:page', 1, {
    validate: isPositiveInt,
  });
  const [limit, setLimit] = usePersistentState<number>('public:references:limit', 50, {
    validate: isPositiveInt,
  });
  const [search, setSearch] = usePersistentState<string>('public:references:search', '', {
    validate: isStringValue,
  });
  const debouncedSearch = useDebounce(search, 500);
  const [category, setCategory] = usePersistentState<string>('public:references:category', 'All', {
    validate: isStringValue,
  });
  const [selectedFileRef, setSelectedFileRef] = useState<{ id: number; name: string } | null>(null);

  const scrollRef = useDraggableScroll<HTMLDivElement>();

  const {
    data,
    isLoading: loading,
    refetch,
  } = useCachedQuery<PaginatedReferences>({
    key: `public:references:p${page}:l${limit}:c${category}:q${debouncedSearch}`,
    fetcher: () => referenceApi.getAllReferences(page, limit, debouncedSearch, category),
    persistStorage: true,
    listenCmsUpdate: true,
  });

  useAutoRefresh(() => {
    void refetch(true);
  }, 30000);

  const { setLastAnchorId, highlightedId } = useScrollRestoration({
    storageKey: 'public:references',
    isReady: !loading,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (categoryValue: string) => {
    setCategory(categoryValue);
    setPage(1);
  };

  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <div
      className={`max-w-max-width mx-auto pb-12 px-4 md:px-0 reveal ${isVisible ? 'visible' : ''}`}
      ref={ref as React.RefObject<HTMLDivElement>}
    >
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

        <div className="overflow-x-auto rounded-xl border border-primary/10 shadow-inner bg-white/95" ref={scrollRef}>
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
                data?.results.map((refItem) => (
                  <tr
                    key={refItem.id}
                    data-cache-anchor-id={String(refItem.id)}
                    onClick={() => setLastAnchorId(refItem.id)}
                    className={`transition-colors hover:bg-gold-light/10 ${
                      highlightedId === String(refItem.id) ? 'bg-gold-light/20' : ''
                    }`}
                  >
                    <td className="px-6 py-5 text-sm whitespace-nowrap font-medium" style={{ color: 'var(--color-on-surface-variant)' }}>{refItem.call_number || '-'}</td>
                    <td className="px-6 py-5">
                      <div className="font-bold mb-1.5 leading-tight text-base" style={{ color: 'var(--color-primary)' }}>{refItem.title}</div>
                      <div className="text-xs flex flex-wrap gap-2 items-center font-medium" style={{ color: 'var(--color-on-surface-variant)' }}>
                        <span className="bg-primary/5 px-2 py-1 rounded-md border border-primary/10">Acc No: {refItem.acc_no || '-'}</span>
                        <span
                          className={`px-2.5 py-1 rounded-md border ${
                            refItem.category === 'Thesis and Dissertation'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {refItem.category === 'Thesis and Dissertation' ? 'Thesis' : 'Research'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium" style={{ color: 'var(--color-on-surface)' }}>{refItem.author || '-'}</td>
                    <td className="px-6 py-5 text-sm whitespace-nowrap font-medium" style={{ color: 'var(--color-on-surface-variant)' }}>{refItem.copyright || '-'}</td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold" style={{ backgroundColor: 'var(--color-surface-container-highest)', color: 'var(--color-primary)' }}>
                        {refItem.resource_status || 'Available'}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      {refItem.access_type === 'none' && (
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-500">
                          Unavailable
                        </span>
                      )}
                      {refItem.access_type === 'link' && refItem.access_link && (
                        <a
                          href={refItem.access_link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => setLastAnchorId(refItem.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
                        >
                          <LinkIcon size={12} /> Link Available
                        </a>
                      )}
                      {refItem.access_type === 'file' && refItem.access_file && (
                        <button
                          onClick={() => {
                            setLastAnchorId(refItem.id);
                            setSelectedFileRef({
                              id: refItem.id,
                              name: refItem.access_file?.split('/').pop() || `${refItem.title} Document`,
                            });
                          }}
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

        {data && data.count > 0 && (
          <div className="pt-8 mt-4">
            <Pagination
              currentPage={data.current_page}
              totalPages={data.total_pages}
              totalItems={data.count}
              itemsPerPage={limit}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
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
};
