import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold' | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-navy hover:bg-navy-dark text-white shadow-sm border border-navy/20',
  secondary: 'bg-gold hover:bg-gold-hover text-navy-dark font-semibold shadow-sm',
  outline: 'bg-transparent border border-navy/30 text-navy hover:bg-navy/5',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-navy',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  gold: 'bg-gradient-to-r from-gold to-gold-light text-navy-dark font-bold hover:brightness-105 shadow-sm',
  glass: 'bg-white/70 hover:bg-white/90 backdrop-blur-md text-navy border border-white/40 shadow-sm',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-2.5 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-4 py-2 rounded-xl gap-2',
  lg: 'text-base px-6 py-2.5 rounded-xl gap-2.5',
  icon: 'p-2 rounded-xl aspect-square justify-center',
};

/**
 * GLOBAL CALLING PRIMITIVE: Button
 * Universal accessible atomic button primitive with loading, variant, and icon support.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  },
);

Button.displayName = 'Button';
