import React from 'react';
import type { Personnel } from '@/src/Endpoints/personnelApi';
import { getImageUrl } from '@/src/Libs/apiClient';
import { assets } from '@/src/Libs/Assets/data';

export interface ResolvedPersonnelHierarchy {
  chiefLibrarian: Personnel;
  staffList: Personnel[];
}

export interface ResolvePersonnelHierarchyOptions {
  allowStaticFallback?: boolean;
}

export interface OrgBranchConnectorsOptions {
  count: number;
  gapClass?: string;
  halfGapPx?: number;
}

export interface PersonnelAvatarProps {
  src?: string | null;
  name: string;
  isSkeleton?: boolean;
  containerClassName: string;
  imageClassName?: string;
  initialsClassName?: string;
}

const CHIEF_TITLE_REGEX = /campus\s+librarian|chief\s+librarian/i;

/**
 * Extracts 1-2 uppercase initials from a personnel display name for avatar underlays/fallbacks.
 */
export function getPersonnelInitials(name: string): string {
  const trimmed = (name || '').trim();
  if (!trimmed) return '?';

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const firstInitial = parts[0].charAt(0);
  const lastInitial = parts[parts.length - 1].charAt(0);
  return `${firstInitial}${lastInitial}`.toUpperCase();
}

/**
 * Resolves a cache-safe image URL for a personnel photo while preserving `photo_version` or `updated_at`
 * query busting even when `getImageUrl` strips origin from absolute `/media/...` URLs.
 */
export function getPersonnelPhotoUrl(
  person: Pick<Personnel, 'photo' | 'photo_version' | 'updated_at'>
): string {
  if (!person.photo) return '';
  const resolved = getImageUrl(person.photo);
  if (!resolved) return '';

  if (
    resolved.startsWith('data:') ||
    resolved.startsWith('blob:') ||
    resolved.startsWith('http://') ||
    resolved.startsWith('https://')
  ) {
    return resolved;
  }

  const versionToken = person.photo_version || person.updated_at;
  if (versionToken && resolved.startsWith('/media/') && !resolved.includes('v=')) {
    const separator = resolved.includes('?') ? '&' : '?';
    return `${resolved}${separator}v=${encodeURIComponent(versionToken)}`;
  }

  return resolved;
}

/**
 * Resolves the Chief Librarian and ordered staff list from raw personnel records.
 * Never overrides a persisted DB Chief Librarian photo with the static asset fallback.
 */
export function resolvePersonnelHierarchy(
  list: Personnel[],
  options?: ResolvePersonnelHierarchyOptions
): ResolvedPersonnelHierarchy {
  const allowStaticFallback = options?.allowStaticFallback ?? false;

  if (!Array.isArray(list) || list.length === 0) {
    return {
      chiefLibrarian: {
        name: 'Kiara Keren M. Alavanza',
        title: 'Campus Librarian',
        order: 1,
        photo: allowStaticFallback ? assets.images.chiefLibrarian : null,
      },
      staffList: [],
    };
  }

  const resolvedChief =
    list.find((p) => p.order === 1) ??
    list.find((p) => CHIEF_TITLE_REGEX.test(p.title || '')) ??
    list.find((p) => (p.name || '').toLowerCase().includes('kiara')) ??
    list[0];

  const hasPersistedPhoto = Boolean(resolvedChief.photo && resolvedChief.photo.trim().length > 0);
  const chiefLibrarian: Personnel = {
    ...resolvedChief,
    photo: hasPersistedPhoto
      ? resolvedChief.photo
      : allowStaticFallback
        ? assets.images.chiefLibrarian
        : null,
  };

  const staffList = list
    .filter((p) => {
      if (resolvedChief.id !== undefined && p.id !== undefined) {
        return p.id !== resolvedChief.id;
      }
      return p !== resolvedChief;
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return { chiefLibrarian, staffList };
}

/**
 * Maps staff count to responsive Tailwind grid column + max-width classes.
 */
export function getPersonnelGridColsClass(n: number): string {
  if (n <= 1) return 'grid-cols-1 max-w-sm mx-auto';
  if (n === 2) return 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto';
  if (n === 3) return 'grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto';
  if (n === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto';
  return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 max-w-7xl mx-auto';
}

/**
 * Returns the hidden breakpoint class for the top downward arrow so it only displays
 * at viewports where the multi-column branch connector tree is hidden.
 */
export function getTopConnectorArrowHiddenClass(n: number): string {
  return n <= 3 ? 'md:hidden' : 'lg:hidden';
}

/**
 * Returns classes for sequential downward arrows (`idx > 0`) so they span full width
 * and only render in single-column mobile viewports (never beside another card).
 */
export function getSequentialArrowHiddenClass(n: number): string {
  return n <= 3 ? 'col-span-full md:hidden' : 'col-span-full sm:hidden';
}

/**
 * Renders the responsive org-chart branch connector tree aligned to the exact grid breakpoint
 * for the given staff count (`md:block` for n <= 3, `lg:block` for n >= 4).
 */
export function renderOrgBranchConnectors({
  count,
  gapClass = 'gap-8',
  halfGapPx = 16,
}: OrgBranchConnectorsOptions): React.ReactNode {
  const n = Math.min(count, 5);
  if (n <= 0) return null;

  const visibilityClass = n <= 3 ? 'hidden md:block' : 'hidden lg:block';

  return React.createElement(
    'div',
    {
      className: `${visibilityClass} w-full relative z-10 fade-up-entrance h-16 mb-4`,
    },
    n > 1
      ? React.createElement('div', {
          className: 'absolute top-0 left-[calc(50%-1px)] w-[2px] h-[24px] bg-gold-light',
        })
      : null,
    React.createElement(
      'div',
      { className: `grid ${getPersonnelGridColsClass(n)} ${gapClass} w-full h-full` },
      Array.from({ length: n }).map((_, idx) =>
        React.createElement(
          'div',
          { key: idx, className: 'relative w-full h-full min-w-0' },
          n === 1
            ? React.createElement('div', {
                className: 'absolute top-0 left-[calc(50%-1px)] w-[2px] h-[48px] bg-gold-light',
              })
            : React.createElement(
                React.Fragment,
                null,
                idx === 0
                  ? React.createElement('div', {
                      className: 'absolute border-t-2 border-l-2 border-gold-light',
                      style: {
                        top: '24px',
                        right: `-${halfGapPx}px`,
                        left: 'calc(50% - 1px)',
                        height: '24px',
                        borderTopLeftRadius: '12px',
                      },
                    })
                  : null,
                idx === n - 1
                  ? React.createElement('div', {
                      className: 'absolute border-t-2 border-r-2 border-gold-light',
                      style: {
                        top: '24px',
                        left: `-${halfGapPx}px`,
                        right: 'calc(50% - 1px)',
                        height: '24px',
                        borderTopRightRadius: '12px',
                      },
                    })
                  : null,
                idx > 0 && idx < n - 1
                  ? React.createElement(
                      React.Fragment,
                      null,
                      React.createElement('div', {
                        className: 'absolute bg-gold-light',
                        style: {
                          top: '24px',
                          left: `-${halfGapPx}px`,
                          right: `-${halfGapPx}px`,
                          height: '2px',
                        },
                      }),
                      React.createElement('div', {
                        className: 'absolute bg-gold-light',
                        style: {
                          top: '24px',
                          left: 'calc(50% - 1px)',
                          width: '2px',
                          height: '24px',
                        },
                      })
                    )
                  : null
              ),
          React.createElement(
            'span',
            {
              className:
                'material-symbols-outlined text-gold-light text-xl absolute left-1/2 -translate-x-1/2 leading-none bg-transparent rounded-full z-10 font-bold',
              style: { top: '44px' },
            },
            'arrow_downward'
          )
        )
      )
    )
  );
}

/**
 * Shared circular avatar with initials/skeleton underlay and smooth fade-in on load.
 */
export const PersonnelAvatar: React.FC<PersonnelAvatarProps> = ({
  src,
  name,
  isSkeleton = false,
  containerClassName,
  imageClassName = 'w-full h-full object-cover',
  initialsClassName = 'text-xl',
}) => {
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [errored, setErrored] = React.useState(false);

  React.useEffect(() => {
    setErrored(false);
    const img = imgRef.current;
    if (src && img && img.complete && img.naturalWidth > 0) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [src]);

  const initials = getPersonnelInitials(name);
  const showImage = Boolean(src) && !errored && !isSkeleton;

  return React.createElement(
    'div',
    { className: `relative overflow-hidden rounded-full bg-navy-dark ${containerClassName}` },
    isSkeleton
      ? React.createElement('div', {
          className: 'absolute inset-0 rounded-full bg-white/15 animate-pulse',
          'aria-hidden': true,
        })
      : React.createElement(
          'div',
          {
            className: `absolute inset-0 flex items-center justify-center bg-navy-dark text-gold-light font-bold select-none ${
              showImage && !loaded ? 'animate-pulse' : ''
            } ${initialsClassName}`,
            'aria-hidden': showImage && loaded ? true : undefined,
          },
          initials
        ),
    showImage
      ? React.createElement('img', {
          ref: imgRef,
          src: src as string,
          alt: name,
          className: `relative z-10 transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${imageClassName}`,
          onLoad: () => setLoaded(true),
          onError: () => setErrored(true),
        })
      : null
  );
};
