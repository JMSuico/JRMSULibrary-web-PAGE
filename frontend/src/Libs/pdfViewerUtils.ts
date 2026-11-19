export const PDF_RANGE_CHUNK_BYTES = 524288; // 512 KB range chunks for fast sub-2s first-page display

export const isBlockedPdfShortcut = (e: KeyboardEvent): boolean => {
  const key = e.key.toLowerCase();
  const hasPrimaryModifier = e.ctrlKey || e.metaKey;
  return (
    e.key === 'F12' ||
    key === 'f12' ||
    (hasPrimaryModifier && e.shiftKey && (key === 'i' || key === 'c' || key === 'j')) ||
    (e.metaKey && e.altKey && (key === 'i' || key === 'c' || key === 'j')) ||
    (hasPrimaryModifier && (key === 'u' || key === 's' || key === 'p'))
  );
};

export const isRenderingCancelled = (err: unknown): boolean =>
  typeof err === 'object' &&
  err !== null &&
  'name' in err &&
  (err as { name: unknown }).name === 'RenderingCancelledException';
