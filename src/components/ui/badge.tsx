import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-2xl px-3 py-1 font-sans text-caption font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-bg-tertiary text-text-secondary",
        primary: "bg-primary/10 text-primary border border-primary/20",
        accent: "bg-accent/10 text-accent-dark border border-accent/20",
        success: "bg-success/10 text-success-dark border border-success/20",
        warning: "bg-warning/10 text-warning-dark border border-warning/20",
        error: "bg-error/10 text-error-dark border border-error/20",
        info: "bg-info/10 text-info-dark border border-info/20",
        secondary: "bg-bg-secondary text-text-secondary border border-borders-light",
        outline: "border border-borders-medium text-text-secondary bg-transparent",
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
