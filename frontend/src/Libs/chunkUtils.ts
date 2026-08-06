export async function processInChunks<T>(
  items: T[],
  chunkSize: number,
  processItem: (item: T) => Promise<any>,
  onProgress: (processedCount: number, totalCount: number, currentChunkSize: number) => void
) {
  let processedCount = 0;
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    await Promise.all(chunk.map(processItem));
    processedCount += chunk.length;
    onProgress(processedCount, items.length, chunk.length);
  }
}
