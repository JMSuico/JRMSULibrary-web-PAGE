import React from 'react';
import { X } from 'lucide-react';

interface UndoDeleteToastProps {
  undoState: {
    isOpen: boolean;
    itemName: string;
    countdown: number;
  } | null;
  onUndo: () => void;
  onExecuteNow: () => void;
}

export const UndoDeleteToast: React.FC<UndoDeleteToastProps> = ({ undoState, onUndo, onExecuteNow }) => {
  if (!undoState) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[99] bg-white rounded-lg shadow-xl border border-gray-100 p-4 w-80 flex flex-col gap-3 slide-in-from-bottom-5 animate-modal-card">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-semibold text-gray-800 text-sm">Action pending...</p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">"{undoState.itemName}"</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded transition-colors cursor-pointer"
          >
            Undo
          </button>
          <button onClick={onExecuteNow} className="text-gray-400 hover:text-gray-600 cursor-pointer" aria-label="Close and execute now">
            <X size={18} />
          </button>
        </div>
      </div>
      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full rounded-full transition-all ease-linear"
          style={{ width: `${(undoState.countdown / 3) * 100}%`, transitionDuration: '1s' }}
        />
      </div>
    </div>
  );
};
