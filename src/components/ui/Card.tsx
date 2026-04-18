import { type HTMLAttributes, forwardRef } from 'react';

import { cn } from '../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  border?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, border = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl bg-white/90 backdrop-blur-sm p-4',
          border && 'border border-slate-200/60 shadow-lg shadow-slate-900/5',
          hover &&
            'hover:shadow-xl hover:border-slate-300/60 hover:-translate-y-0.5 cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-start justify-between gap-4 mb-3', className)}
      {...props}
    >
      {children}
    </div>
  );
});
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  return (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold text-slate-900', className)}
      {...props}
    >
      {children}
    </h2>
  );
});
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-slate-500 mt-0.5', className)}
      {...props}
    >
      {children}
    </p>
  );
});
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('', className)} {...props}>
      {children}
    </div>
  );
});
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-3 mt-4 pt-3 border-t border-slate-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
CardFooter.displayName = 'CardFooter';

// Skeleton loader components
interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export function Skeleton({ className, animate = true }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-surface-high/60',
        animate && 'animate-pulse',
        className
      )}
    />
  );
}

export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-panel p-4 border border-panel-border shadow-premium/5',
        className
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

export function StoryCardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-panel p-4 border border-panel-border shadow-premium/5',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-5/6 mb-3" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}
