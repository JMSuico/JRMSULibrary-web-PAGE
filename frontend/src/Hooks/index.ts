/**
 * GLOBAL CALLING IMPORTS: Hooks
 * Universal hook primitives shared across the JRMSU Library system.
 */

export {
  usePagination,
  findPageForItemIndex,
  type UsePaginationOptions,
  type UsePaginationResult,
} from './usePagination';
export { useFluidResponsiveness, type FluidResponsiveness, type Breakpoint } from './useFluidResponsiveness';
export { useDebounce } from './useDebounce';
export { useToast, ToastProvider, type ToastType } from './useToast';
export { useToasts } from './useToasts';
export { useScrollbar, type ScrollbarState } from './useScrollbar';
export { useAutoRefresh } from './useAutoRefresh';
export { useGlobalAutoRefresh } from './useGlobalAutoRefresh';
export { useIntersectionObserver } from './useIntersectionObserver';
export { useDraggableScroll } from './useDraggableScroll';
export { useDraggableBubble } from './useDraggableBubble';
export { useUndoDelete } from './useUndoDelete';
export { useChunkedSync } from './useChunkedSync';
export { useExcelParser } from './useExcelParser';
export { usePdfExport } from './usePdfExport';
export { useDevToolsProtection } from './useDevToolsProtection';
export { useAboutContent } from './useAboutContent';
export { useCmsUpdated } from './useCmsUpdated';
export { useCarouselStyle } from './useCarouselStyle';
export {
  useCachedQuery,
  invalidateCacheByPrefix,
  revalidateCacheByPrefix,
  type UseCachedQueryOptions,
  type UseCachedQueryResult,
} from './useCachedQuery';
export {
  usePersistentState,
  type UsePersistentStateOptions,
} from './usePersistentState';
export {
  useScrollRestoration,
  type SavedScrollSnapshot,
  type UseScrollRestorationOptions,
  type UseScrollRestorationResult,
} from './useScrollRestoration';
export {
  useModalSafeCmsSync,
  evaluateCmsSyncAction,
  type CmsSyncDecision,
  type UseModalSafeCmsSyncOptions,
  type UseModalSafeCmsSyncResult,
} from './useModalSafeCmsSync';
