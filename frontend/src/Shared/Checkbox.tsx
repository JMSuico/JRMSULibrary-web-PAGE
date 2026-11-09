import React, { forwardRef, useEffect, useRef } from 'react';
import { Check, Minus } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  indeterminate?: boolean;
}

/**
 * GLOBAL CALLING PRIMITIVE: Checkbox
 * Universal accessible checkbox with support for checked, unchecked, and indeterminate states.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, indeterminate = false, checked, className = '', disabled, id, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const resolvedId = id || (label ? `cb-${String(label).toLowerCase().replace(/\s+/g, '-')}` : undefined);

    useEffect(() => {
      const element = (ref as React.RefObject<HTMLInputElement>)?.current || inputRef.current;
      if (element) {
        element.indeterminate = indeterminate;
      }
    }, [indeterminate, ref]);

    return (
      <label
        htmlFor={resolvedId}
        className={`inline-flex items-start gap-2.5 cursor-pointer select-none group ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={resolvedId}
            ref={ref || inputRef}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div
            className={`w-4 h-4 rounded-md border transition-all duration-150 flex items-center justify-center ${
              checked || indeterminate
                ? 'bg-navy border-navy text-white shadow-xs'
                : 'bg-white border-gray-300 group-hover:border-navy/60 peer-focus-visible:ring-2 peer-focus-visible:ring-navy/20'
            }`}
          >
            {indeterminate ? (
              <Minus size={12} strokeWidth={3} />
            ) : checked ? (
              <Check size={12} strokeWidth={3} />
            ) : null}
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col text-sm leading-tight">
            {label && <span className="font-medium text-gray-800">{label}</span>}
            {description && <span className="text-xs text-gray-500 mt-0.5">{description}</span>}
          </div>
        )}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';
