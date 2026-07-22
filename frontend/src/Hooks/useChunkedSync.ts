import { useState, useRef, useCallback } from 'react';
import { referenceApi, SyncDiff, SyncCommitResult } from '@/src/Endpoints/referenceApi';

export interface ChunkedSyncState {
  isActive: boolean;
  totalRecords: number;
  processedRecords: number;
  message: string;
  isCancelled: boolean;
  syncDiff: SyncDiff | null;
  applyDeletions: boolean;
  finalResult: SyncCommitResult | null;
}

const CHUNK_SIZE = 30;

export function useChunkedSync(onSuccess: () => void) {
  const [state, setState] = useState<ChunkedSyncState>({
    isActive: false,
    totalRecords: 0,
    processedRecords: 0,
    message: '',
    isCancelled: false,
    syncDiff: null,
    applyDeletions: false,
    finalResult: null,
  });

  const isCancelledRef = useRef(false);

  const startSync = async (diff: SyncDiff, applyDeletions: boolean) => {
    isCancelledRef.current = false;

    const queue: { type: 'create' | 'update' | 'delete'; data: any }[] = [
      ...diff.to_create.map(c => ({ type: 'create' as const, data: c })),
      ...diff.to_update.map(u => ({ type: 'update' as const, data: u })),
      ...(applyDeletions ? diff.to_delete.map(d => ({ type: 'delete' as const, data: d.id })) : [])
    ];

    const total = queue.length;

    setState({
      isActive: true,
      totalRecords: total,
      processedRecords: 0,
      message: 'Syncing...',
      isCancelled: false,
      syncDiff: diff,
      applyDeletions,
      finalResult: null,
    });

    let processed = 0;
    const finalResult: SyncCommitResult = { created: 0, updated: 0, deleted: 0, errors: [] };

    for (let i = 0; i < total; i += CHUNK_SIZE) {
      if (isCancelledRef.current) break;

      const chunk = queue.slice(i, i + CHUNK_SIZE);
      const toCreate = chunk.filter(x => x.type === 'create').map(x => x.data);
      const toUpdate = chunk.filter(x => x.type === 'update').map(x => x.data);
      const toDelete = chunk.filter(x => x.type === 'delete').map(x => x.data);

      try {
        const result = await referenceApi.syncCommit({
          to_create: toCreate,
          to_update: toUpdate,
          to_delete: toDelete,
          apply_deletions: applyDeletions
        });

        finalResult.created += result.created;
        finalResult.updated += result.updated;
        finalResult.deleted += result.deleted;
        finalResult.errors.push(...result.errors);
      } catch (e) {
        console.error('Chunk sync error:', e);
      }

      processed += chunk.length;
      
      if (!isCancelledRef.current) {
        const startRange = i + 1;
        const endRange = Math.min(i + CHUNK_SIZE, total);
        setState(prev => ({
          ...prev,
          processedRecords: processed,
          message: `${startRange} - ${endRange} synced`
        }));
      }
    }

    if (isCancelledRef.current) {
      setState(prev => ({
        ...prev,
        isActive: false,
        message: 'Sync Cancelled',
        finalResult
      }));
    } else {
      setState(prev => ({
        ...prev,
        isActive: false,
        message: 'Synced complete Successully',
        finalResult
      }));
      onSuccess();
    }
  };

  const cancelSync = useCallback(() => {
    isCancelledRef.current = true;
    setState(prev => ({ ...prev, isCancelled: true }));
  }, []);

  const resetSync = useCallback(() => {
    setState({
      isActive: false,
      totalRecords: 0,
      processedRecords: 0,
      message: '',
      isCancelled: false,
      syncDiff: null,
      applyDeletions: false,
      finalResult: null,
    });
  }, []);

  return { state, startSync, cancelSync, resetSync };
}
