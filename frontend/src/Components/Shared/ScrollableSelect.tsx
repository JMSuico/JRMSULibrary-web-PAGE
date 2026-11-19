import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

export interface ScrollableSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ScrollableSelectProps {
  value: string;
  options: ScrollableSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  ariaLabel?: string;
  className?: string;
  menuMaxHeightClass?: string;
}

interface MenuPosition {
  left: number;
  width: number;
  maxWidth: number;
  top?: number;
  bottom?: number;
}

const VIEWPORT_MARGIN = 8;
const MENU_OFFSET = 4;
const DEFAULT_ESTIMATED_MENU_HEIGHT = 200;

export function ScrollableSelect({
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  ariaLabel,
  className = '',
  menuMaxHeightClass = 'max-h-48',
}: ScrollableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listboxId = useId();

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;
  const isPlaceholderDisplay = !selectedOption || (Boolean(selectedOption.disabled) && value === '');

  const findNextEnabledIndex = useCallback(
    (startIndex: number, direction: 1 | -1): number => {
      if (options.length === 0) return -1;
      for (let step = 1; step <= options.length; step += 1) {
        const idx = (startIndex + step * direction + options.length) % options.length;
        if (!options[idx]?.disabled) {
          return idx;
        }
      }
      return -1;
    },
    [options],
  );

  const findFirstEnabledIndex = useCallback((): number => {
    return options.findIndex((opt) => !opt.disabled);
  }, [options]);

  const findLastEnabledIndex = useCallback((): number => {
    for (let i = options.length - 1; i >= 0; i -= 1) {
      if (!options[i]?.disabled) return i;
    }
    return -1;
  }, [options]);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const minWidth = Math.min(rect.width, viewportWidth - VIEWPORT_MARGIN * 2);
    const maxWidth = Math.max(minWidth, viewportWidth - VIEWPORT_MARGIN * 2);
    const clampedLeft = Math.max(
      VIEWPORT_MARGIN,
      Math.min(rect.left, viewportWidth - minWidth - VIEWPORT_MARGIN),
    );

    const measuredHeight = menuRef.current?.offsetHeight;
    const estimatedHeight =
      measuredHeight && measuredHeight > 0
        ? measuredHeight
        : Math.min(options.length * 38 + 10, DEFAULT_ESTIMATED_MENU_HEIGHT);

    const spaceBelow = viewportHeight - rect.bottom - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - VIEWPORT_MARGIN;
    const shouldPlaceAbove = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

    if (shouldPlaceAbove) {
      setMenuPosition({
        left: clampedLeft,
        width: minWidth,
        maxWidth,
        bottom: Math.max(VIEWPORT_MARGIN, viewportHeight - rect.top + MENU_OFFSET),
      });
    } else {
      setMenuPosition({
        left: clampedLeft,
        width: minWidth,
        maxWidth,
        top: Math.max(VIEWPORT_MARGIN, rect.bottom + MENU_OFFSET),
      });
    }
  }, [options.length]);

  const openMenu = useCallback(
    (preferDirection?: 'up' | 'down') => {
      if (disabled) return;
      const selectedIdx = options.findIndex((opt) => opt.value === value && !opt.disabled);
      let initialIdx = selectedIdx;
      if (initialIdx === -1) {
        initialIdx = preferDirection === 'up' ? findLastEnabledIndex() : findFirstEnabledIndex();
      }
      setHighlightedIndex(initialIdx);
      setIsOpen(true);
    },
    [disabled, findFirstEnabledIndex, findLastEnabledIndex, options, value],
  );

  const selectOption = useCallback(
    (option: ScrollableSelectOption) => {
      if (option.disabled) return;
      onChange(option.value);
      setIsOpen(false);
      triggerRef.current?.focus();
    },
    [onChange],
  );

  useEffect(() => {
    if (disabled && isOpen) {
      setIsOpen(false);
    }
  }, [disabled, isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setMenuPosition(null);
      return;
    }
    updateMenuPosition();
  }, [isOpen, options.length, updateMenuPosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      updateMenuPosition();
    };

    const handleScroll = (event: Event) => {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        menuRef.current.contains(event.target)
      ) {
        return;
      }
      updateMenuPosition();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, updateMenuPosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key === 'Tab') {
        setIsOpen(false);
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev === -1 ? findFirstEnabledIndex() : findNextEnabledIndex(prev, 1),
        );
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev === -1 ? findLastEnabledIndex() : findNextEnabledIndex(prev, -1),
        );
        return;
      }

      if (event.key === 'Home') {
        event.preventDefault();
        setHighlightedIndex(findFirstEnabledIndex());
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        setHighlightedIndex(findLastEnabledIndex());
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (highlightedIndex >= 0) {
          const targetOption = options[highlightedIndex];
          if (targetOption && !targetOption.disabled) {
            selectOption(targetOption);
          }
        }
      }
    };

    document.addEventListener('keydown', handleDocumentKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown, true);
    };
  }, [
    findFirstEnabledIndex,
    findLastEnabledIndex,
    findNextEnabledIndex,
    highlightedIndex,
    isOpen,
    options,
    selectOption,
  ]);

  useEffect(() => {
    if (!isOpen || highlightedIndex < 0) return;
    optionRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, isOpen]);

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || isOpen) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openMenu('down');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu('up');
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openMenu('down');
    }
  };

  const activeDescendantId =
    isOpen && highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined;

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={activeDescendantId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
          } else {
            openMenu('down');
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        className="w-full h-full inline-flex items-center justify-between gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <span className={`truncate ${isPlaceholderDisplay ? 'text-gray-400' : 'text-gray-900'}`}>
          {displayLabel}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-500 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {required && (
        <input
          type="text"
          tabIndex={-1}
          value={value}
          onChange={() => {}}
          required
          disabled={disabled}
          aria-hidden="true"
          className="absolute inset-0 m-auto w-px h-px opacity-0 pointer-events-none"
        />
      )}

      {isOpen &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel}
            style={{
              position: 'fixed',
              left: menuPosition.left,
              minWidth: menuPosition.width,
              maxWidth: menuPosition.maxWidth,
              top: menuPosition.top,
              bottom: menuPosition.bottom,
            }}
            className="z-[10040] rounded-lg border border-gray-200 bg-white shadow-xl"
          >
            <div className={`${menuMaxHeightClass} overflow-y-auto overscroll-contain custom-scrollbar p-1`}>
              {options.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-400 select-none">
                  {placeholder}
                </div>
              ) : (
                options.map((option, index) => {
                  const isSelected = option.value === value;
                  const isHighlighted = index === highlightedIndex;
                  return (
                    <button
                      key={`${option.value}-${index}`}
                      ref={(el) => {
                        optionRefs.current[index] = el;
                      }}
                      id={`${listboxId}-option-${index}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={option.disabled || undefined}
                      disabled={option.disabled}
                      onMouseEnter={() => {
                        if (!option.disabled) {
                          setHighlightedIndex(index);
                        }
                      }}
                      onClick={() => selectOption(option)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors ${
                        option.disabled
                          ? 'text-gray-400 cursor-not-allowed'
                          : isHighlighted
                            ? 'bg-blue-50 text-blue-700 cursor-pointer'
                            : isSelected
                              ? 'bg-gray-50 text-gray-900 font-medium cursor-pointer'
                              : 'text-gray-700 hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && !option.disabled && (
                        <Check size={15} className="shrink-0 text-blue-600" aria-hidden="true" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
