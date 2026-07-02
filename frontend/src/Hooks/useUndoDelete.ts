// [Layer: Hooks] — useUndoDelete.ts
// Provides a 3-second undo window before executing a permanent delete action.
import { useState, useRef, useCallback } from 'react';

export function useUndoDelete() {
  const [undoState, setUndoState] = useState<{
    isOpen: boolean;
    itemName: string;
    countdown: number;
  } | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const deleteActionRef = useRef<(() => void) | null>(null);
  const onUndoRef = useRef<(() => void) | null>(null);

  const triggerDelete = useCallback((itemName: string, onExecuteDelete: () => void, onUndoLocal: () => void) => {
    // Clear any existing timer
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    deleteActionRef.current = onExecuteDelete;
    onUndoRef.current = onUndoLocal;

    setUndoState({ isOpen: true, itemName, countdown: 3 });

    intervalRef.current = setInterval(() => {
      setUndoState(prev => {
        if (!prev || prev.countdown <= 1) {
          clearInterval(intervalRef.current!);
          return null;
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);

    timeoutRef.current = setTimeout(() => {
      if (deleteActionRef.current) {
        deleteActionRef.current();
      }
      setUndoState(null);
    }, 3000);
  }, []);

  const executeNow = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (deleteActionRef.current) {
      deleteActionRef.current();
    }
    
    timeoutRef.current = null;
    intervalRef.current = null;
    deleteActionRef.current = null;
    onUndoRef.current = null;
    
    setUndoState(null);
  }, []);

  const cancelDelete = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    if (onUndoRef.current) {
      onUndoRef.current(); // Restore in local UI state
    }
    
    timeoutRef.current = null;
    intervalRef.current = null;
    deleteActionRef.current = null;
    onUndoRef.current = null;
    
    setUndoState(null);
  }, []);

  return { undoState, triggerDelete, cancelDelete, executeNow };
}
