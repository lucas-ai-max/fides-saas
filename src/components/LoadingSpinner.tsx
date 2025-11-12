import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'default' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'default', text, className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-primary-600 dark:text-primary-400', sizeClasses[size])} />
      {text && (
        <p className="text-sm font-medium text-text-secondary animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
