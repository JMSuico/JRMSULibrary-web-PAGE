import React, { forwardRef } from 'react';

export interface RadioButtonProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

/**
 * GLOBAL CALLING PRIMITIVE: RadioButton
 * Universal accessible radio input and option selector.
 */
export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  ({ label, description, checked, className = '', disabled, id, ...props }, ref) => {
    const resolvedId = id || (label ? `rb-${String(label).toLowerCase().replace(/\s+/g, '-')}` : undefined);

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
            ref={ref}
            type="radio"
            checked={checked}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div
            className={`w-4 h-4 rounded-full border transition-all duration-150 flex items-center justify-center ${
              checked
                ? 'border-navy bg-white peer-focus-visible:ring-2 peer-focus-visible:ring-navy/20'
                : 'border-gray-300 bg-white group-hover:border-navy/60'
            }`}
          >
            {checked && <div className="w-2 h-2 rounded-full bg-navy" />}
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

RadioButton.displayName = 'RadioButton';
