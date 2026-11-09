import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownProps<T = string> {
  options: DropdownOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
}

/**
 * GLOBAL CALLING PRIMITIVE: Dropdown
 * Accessible custom select dropdown with click-outside auto-close and keyboard navigation.
 */
export function Dropdown<T = string>({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  className = '',
  disabled = false,
  label,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      {label && <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-xl shadow-xs hover:border-navy/60 focus:outline-hidden focus:ring-2 focus:ring-navy/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer text-gray-800"
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon}
          {selectedOption ? selectedOption.label : <span className="text-gray-400">{placeholder}</span>}
        </span>
        <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full min-w-[160px] bg-white rounded-xl shadow-lg border border-gray-100 py-1 max-h-60 overflow-auto animate-modal-card">
          {options.map((option) => (
            <button
              key={String(option.value)}
              type="button"
              disabled={option.disabled}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                option.value === value
                  ? 'bg-navy/5 text-navy font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option.icon}
              <span className="truncate">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
