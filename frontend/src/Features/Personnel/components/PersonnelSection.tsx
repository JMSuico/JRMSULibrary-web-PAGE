import React from 'react';
import { useIntersectionObserver } from '@/src/Hooks/useIntersectionObserver';
import { useCachedQuery } from '@/src/Hooks/useCachedQuery';
import { cmsApi, PageContent } from '@/src/Endpoints/cmsApi';
import { personnelApi, PERSONNEL_CACHE_KEY, Personnel } from '@/src/Endpoints/personnelApi';
import {
  getPersonnelGridColsClass,
  getPersonnelPhotoUrl,
  getSequentialArrowHiddenClass,
  getTopConnectorArrowHiddenClass,
  PersonnelAvatar,
  renderOrgBranchConnectors,
  resolvePersonnelHierarchy,
} from '@/src/Libs/personnelOrgUtils';

function extractTextBlocksFromHtml(html: string): string[] {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const items = Array.from(doc.querySelectorAll('p'))
    .map((el) => el.textContent?.trim() || '')
    .filter((text) => text.length > 0);
  if (items.length === 0) return [doc.body.textContent?.trim() || ''];
  return items;
}

export const PersonnelSection: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  const { data: personnelData, isLoading: isPersonnelLoading } = useCachedQuery<Personnel[]>({
    key: PERSONNEL_CACHE_KEY,
    fetcher: () => personnelApi.getPersonnel(),
    staleTimeMs: 15_000,
    persistStorage: true,
    listenCmsUpdate: true,
  });

  const { data: pageContents } = useCachedQuery<PageContent[]>({
    key: 'public:page-content',
    fetcher: () => cmsApi.getAllContent(),
    staleTimeMs: 60_000,
    persistStorage: true,
    listenCmsUpdate: true,
  });

  const personnelContent = React.useMemo(
    () => pageContents?.find((c) => c.slug === 'personnel_text') ?? null,
    [pageContents]
  );

  const textBlocks = personnelContent ? extractTextBlocksFromHtml(personnelContent.content) : [];

  const { chiefLibrarian, staffList } = React.useMemo(
    () =>
      resolvePersonnelHierarchy(personnelData ?? [], {
        allowStaticFallback: !isPersonnelLoading,
      }),
    [personnelData, isPersonnelLoading]
  );

  const displayedStaff = React.useMemo(() => staffList.slice(0, 5), [staffList]);
  const staffCount = displayedStaff.length;
  const chiefPhotoUrl = isPersonnelLoading ? null : getPersonnelPhotoUrl(chiefLibrarian);

  return (
    <div
      id="staff"
      className={`py-section-py-desktop reveal ${isVisible ? 'visible' : ''}`}
      ref={ref as React.RefObject<HTMLDivElement>}
    >
      <div id="personnel" className="max-w-max-width mx-auto pl-4 pr-12 sm:pl-6 sm:pr-14 lg:px-gutter">
        <div className="text-center mb-16">
          <h2
            className="font-headline-lg text-4xl mb-4 font-bold"
            style={{ color: 'var(--color-primary)', textShadow: '0 2px 8px var(--color-black-alpha-60)' }}
          >
            Library Personnel
          </h2>
          <p
            className="max-w-3xl mx-auto"
            style={{ color: 'var(--color-primary)', textShadow: '0 1px 4px var(--color-black-alpha-50)' }}
          >
            Meet the dedicated library professionals committed to supporting learning, research, and academic excellence at JRMSU.
          </p>
        </div>

        <div className="p-4 md:p-8 mb-16 bg-transparent">
          <div className="flex flex-col items-center">
            {/* Librarian's Corner + Photo Card merged */}
            <div className="w-full mb-6 md:mb-10 max-w-5xl mx-auto">
              <div
                className="p-6 md:p-8 rounded-2xl shadow-lg border border-gold-light/20 hover-3d-tilt"
                style={{ background: 'var(--color-navy-alpha-50)', backdropFilter: 'blur(8px)' }}
              >
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center">
                  <div className="flex-1 text-left w-full">
                    <h3 className="text-3xl font-bold font-headline-lg mb-4 text-primary drop-shadow-sm">
                      Librarian's Corner
                    </h3>
                    <p className="italic mb-4 text-white">
                      {textBlocks[0] ||
                        'From pages to possibilities—the JRMSU Library fosters knowledge, research, and lifelong learning in pursuit of excellence.'}
                    </p>
                    <p className="text-sm leading-relaxed mb-4 text-white">
                      {textBlocks[1] ||
                        "The Library of Jose Rizal Memorial State University Katipunan Campus is committed to supporting the University's Vision, Mission, Goals, and Objectives by providing relevant, up-to-date, and accessible information resources and services. In adherence to the standards, the library continuously enhances its collections, facilities, and technological services to meet the evolving needs of its academic community. It also promotes information literacy, strengthens research support, and fosters collaborative linkages to contribute to institutional development. The library remains dedicated to delivering quality services and nurturing a culture of lifelong learning among its users."}
                    </p>
                    <p className="text-sm text-gold-light italic drop-shadow-sm font-medium">
                      {textBlocks[2] ||
                        'Thank you for making the library part of your journey. We are always here to support your learning, research, and growth—Padayon, JRMSUans!'}
                    </p>
                  </div>

                  {/* Chief Librarian - Middle Right Side */}
                  <div className="w-full max-w-[260px] lg:w-64 flex-shrink-0 flex flex-col justify-center items-center text-center p-4 pt-6 lg:pt-4 border-t lg:border-t-0 lg:border-l border-gold-light/20">
                    <PersonnelAvatar
                      src={chiefPhotoUrl}
                      name={chiefLibrarian.name}
                      isSkeleton={isPersonnelLoading}
                      containerClassName="w-40 h-40 border-4 border-gold-light/40 shadow-2xl mx-auto mb-4 group"
                      imageClassName="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      initialsClassName="text-3xl"
                    />
                    <div className="bg-navy-dark/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-gold-light/10 shadow-lg w-full">
                      {isPersonnelLoading ? (
                        <>
                          <div className="h-5 w-40 bg-gold-light/25 rounded animate-pulse mx-auto mb-2" />
                          <div className="h-0.5 w-12 bg-gold-light/30 mx-auto mb-2" />
                          <div className="h-3 w-28 bg-white/20 rounded animate-pulse mx-auto" />
                        </>
                      ) : (
                        <>
                          <h3
                            className="font-headline-md font-bold text-lg mb-1"
                            style={{ color: 'var(--color-gold-light)' }}
                          >
                            {chiefLibrarian.name}
                          </h3>
                          <div className="h-0.5 w-12 bg-gold-light/50 mx-auto mb-2" />
                          <p className="text-white/90 font-bold tracking-widest text-xs uppercase">
                            {chiefLibrarian.title}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Curved Arrow Connector */}
            {renderOrgBranchConnectors({
              count: staffCount,
              gapClass: 'gap-8',
              halfGapPx: 16,
            })}

            {/* Mobile/Tablet Down Arrow (from Librarian's Corner to first staff when branch tree is hidden) */}
            {staffCount > 0 && (
              <div
                className={`flex flex-col items-center ${getTopConnectorArrowHiddenClass(
                  staffCount
                )} my-2 text-gold-light`}
              >
                <div className="w-0.5 h-6 bg-gold-light" />
                <span className="material-symbols-outlined text-lg leading-none -mt-1">
                  arrow_downward
                </span>
              </div>
            )}

            {/* Staff Cards */}
            <div
              className={`grid ${getPersonnelGridColsClass(
                staffCount
              )} gap-8 w-full justify-items-center relative z-20`}
            >
              {displayedStaff.map((person, idx) => (
                <React.Fragment key={person.id ?? `${person.order}-${person.name}-${idx}`}>
                  {/* Arrow for 2nd and subsequent items strictly on single-column mobile viewport */}
                  {idx > 0 && (
                    <div
                      className={`flex flex-col items-center ${getSequentialArrowHiddenClass(
                        staffCount
                      )} my-2 text-gold-light`}
                    >
                      <div className="w-0.5 h-6 bg-gold-light" />
                      <span className="material-symbols-outlined text-lg leading-none -mt-1">
                        arrow_downward
                      </span>
                    </div>
                  )}
                  <div
                    className="fade-up-entrance flex flex-col items-center w-full max-w-[260px] min-w-0"
                    style={{ transitionDelay: `${0.2 * (idx + 1)}s` }}
                  >
                    <div
                      className="border-2 border-gold-light/30 rounded-2xl p-4 text-center w-full shadow-md hover-3d-tilt flex-1 flex flex-col items-center justify-center"
                      style={{ background: 'var(--color-navy-alpha-50)', backdropFilter: 'blur(8px)' }}
                    >
                      <PersonnelAvatar
                        src={getPersonnelPhotoUrl(person)}
                        name={person.name}
                        containerClassName="w-20 h-20 border-2 border-gold-light/40 shadow-lg mx-auto mb-3"
                        imageClassName="w-full h-full object-cover"
                        initialsClassName="text-xl"
                      />
                      <h3
                        className="font-headline-md font-bold mb-1 text-base leading-tight uppercase"
                        style={{ color: 'var(--color-gold-light)' }}
                      >
                        {person.name}
                      </h3>
                      <p
                        className="font-label-caps font-semibold text-[10px]"
                        style={{ color: 'var(--color-white-alpha-80)' }}
                      >
                        {person.title}
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
