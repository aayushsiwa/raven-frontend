import { Loader2 } from 'lucide-react';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'danger';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';

    const variants = {
      default: 'bg-[#0f6cbd] text-white hover:brightness-110 shadow-lg',
      ghost:
        'bg-[rgba(15,23,32,0.06)] text-[#0f1720] hover:bg-[rgba(15,23,32,0.1)]',
      outline:
        'border border-[rgba(15,23,32,0.12)] bg-white text-[#0f1720] hover:bg-[rgba(15,23,32,0.04)]',
      secondary: 'bg-[#14b8a6] text-white hover:brightness-110 shadow-lg',
      danger: 'bg-[#b53b3b] text-white hover:brightness-110 shadow-lg',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 px-3 text-xs',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
