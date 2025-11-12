import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all",
  {
    variants: {
      variant: {
        default: "bg-background-tertiary text-text-secondary border border-border",
        primary: "bg-primary-100 text-primary-700 border border-primary-200 dark:bg-primary-950 dark:text-primary-400 dark:border-primary-800",
        accent: "bg-accent-100 text-accent-700 border border-accent-200 dark:bg-accent-950 dark:text-accent-400 dark:border-accent-800",
        success: "bg-success-light text-success-dark border border-success/20",
        warning: "bg-warning-light text-warning-dark border border-warning/20",
        error: "bg-error-light text-error-dark border border-error/20",
        info: "bg-info-light text-info-dark border border-info/20",
        secondary: "bg-background-secondary text-text-secondary border border-border-light",
        outline: "border-2 border-current text-text-secondary bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
