import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-xl border border-[rgba(15,23,32,0.18)] bg-white/95 px-3.5 py-2 text-sm text-[#0f1720] transition-all duration-200',
          'placeholder:text-[#4f5d6a]',
          'focus:outline-none focus:ring-2 focus:ring-[#0f6cbd]/40 focus:border-[#0f6cbd]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-[#b53b3b] focus:ring-[#b53b3b]/40',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'