import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export type DrawerPosition = 'left' | 'right' | 'bottom';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: DrawerPosition;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  closeOnOutsideClick?: boolean;
}

const positionClasses: Record<DrawerPosition, { container: string; panel: string }> = {
  left: {
    container: 'justify-start',
    panel: 'h-full w-full max-w-sm sm:max-w-md animate-modal-card',
  },
  right: {
    container: 'justify-end',
    panel: 'h-full w-full max-w-sm sm:max-w-md animate-modal-card',
  },
  bottom: {
    container: 'items-end justify-center',
    panel: 'w-full max-h-[85vh] rounded-t-3xl animate-modal-card',
  },
};

/**
 * GLOBAL CALLING PRIMITIVE: Drawer
 * Universal slide-over drawer with left/right/bottom positioning and backdrop blur.
 */
export function Drawer({
  isOpen,
  onClose,
  position = 'right',
  title,
  subtitle,
  children,
  className = '',
  closeOnOutsideClick = true,
}: DrawerProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const currentPos = positionClasses[position];

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex ${currentPos.container} bg-black/60 backdrop-blur-xs transition-opacity duration-200`}
      onClick={closeOnOutsideClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white shadow-2xl flex flex-col overflow-hidden ${currentPos.panel} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || subtitle) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div>
              {title && <h3 className="text-base font-bold text-navy">{title}</h3>}
              {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
