import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center px-6 py-12', className)}>
      <div className="w-20 h-20 bg-background-secondary dark:bg-background-tertiary rounded-3xl flex items-center justify-center mb-6 text-text-tertiary">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-base text-text-secondary max-w-md mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </div>
  );
}
