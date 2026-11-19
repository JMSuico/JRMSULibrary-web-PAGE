import React, { useMemo } from 'react';
import {
  useIntersectionObserver,
  useAutoRefresh,
  useCarouselStyle,
  useCachedQuery,
  usePersistentState,
} from '@/src/Hooks';
import { BookCarousel } from '@/src/Features/Collection/components/BookCarousel';
import { ClassicHorizontalCarousel } from '@/src/Components/Shared/ClassicHorizontalCarousel';
import { BookListModal } from '@/src/Components/Modals/BookListModal';
import { batchApi, type AcquisitionBatch } from '@/src/Endpoints/batchApi';
import { getImageUrl } from '@/src/Libs/apiClient';

interface NewlyAcquiredBookItem {
  id: number;
  title: string;
  description: string;
  category: string;
  image?: string;
  icon?: string;
}

const isBooleanValue = (value: unknown): value is boolean => typeof value === 'boolean';

export const NewlyAcquiredBooks: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [modalOpen, setModalOpen] = usePersistentState<boolean>(
    'public:collection:bookListOpen',
    false,
    { validate: isBooleanValue },
  );
  const carouselStyle = useCarouselStyle();

  const {
    data: batch,
    isLoading: loading,
    refetch,
  } = useCachedQuery<AcquisitionBatch | null>({
    key: 'public:display-batch',
    fetcher: () => batchApi.getCurrentDisplayBatch(),
    persistStorage: true,
    listenCmsUpdate: true,
  });

  const batchName = batch && batch.books ? `Newly Acquired Books – ${batch.name}` : 'Newly Acquired Books';

  const books = useMemo<NewlyAcquiredBookItem[]>(() => {
    if (!batch || !batch.books) return [];
    return batch.books.map((b) => ({
      id: b.id,
      title: b.title,
      description: `${b.author ? `By ${b.author} ` : ''}(${b.category})`,
      category: b.category,
      image: b.cover_image ? getImageUrl(b.cover_image) : undefined,
      icon: !b.cover_image ? 'book' : undefined,
    }));
  }, [batch]);

  useAutoRefresh(() => {
    void refetch(true);
  }, 30000);

  return (
    <div
      id="new-books"
      className={`py-section-py-desktop reveal ${isVisible ? 'visible' : ''}`}
      ref={ref as React.RefObject<HTMLDivElement>}
    >
      <div className="max-w-max-width mx-auto px-4 md:px-gutter">
        <div className="text-center mb-8">
          <h2 className="font-headline-lg font-bold text-4xl mb-4" style={{ color: 'var(--color-primary)', textShadow: '0 2px 8px var(--color-black-alpha-60)' }}>
            {batchName}
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: 'var(--color-primary)', textShadow: '0 1px 4px var(--color-black-alpha-50)' }}>
            Explore our latest additions — curated to support your academic journey and research needs.
          </p>
        </div>
        <div className="p-6 md:p-10 bg-transparent">
          {loading ? (
            <div className="text-center text-primary py-10">Loading books...</div>
          ) : books.length > 0 ? (
            <>
              {carouselStyle === 'classic' ? (
                <ClassicHorizontalCarousel items={books} />
              ) : (
                <BookCarousel items={books} />
              )}
              <div className="flex justify-center mt-6 relative z-40">
                <button
                  onClick={() => setModalOpen(true)}
                  className="bg-gold-light text-primary px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-gold-pale hover:scale-105 transition-all shadow-lg cursor-pointer border-none"
                >
                  View All List
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 px-6 rounded-2xl border-2 border-dashed border-primary/20 bg-white/50">
              <span className="material-symbols-outlined text-4xl text-primary/40 mb-3 block">inventory_2</span>
              <p className="text-primary/60 font-medium text-lg">No newly acquired books available.</p>
              <p className="text-sm text-primary/40 mt-1">Check back later for updates to our collection.</p>
            </div>
          )}
        </div>
      </div>
      <BookListModal books={books} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};