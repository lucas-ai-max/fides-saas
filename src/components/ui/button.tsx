import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-b from-primary-600 to-primary-700 text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:from-primary-500 hover:to-primary-600 focus-visible:ring-primary/50",
        primary: "bg-gradient-to-b from-primary-600 to-primary-700 text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:from-primary-500 hover:to-primary-600 focus-visible:ring-primary/50",
        secondary: "bg-background-secondary dark:bg-background-tertiary border-2 border-border-default text-text-primary hover:bg-background-tertiary dark:hover:bg-background-soft hover:border-border-medium focus-visible:ring-primary/30",
        accent: "bg-gradient-to-b from-accent-500 to-accent-600 text-accent-foreground shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 hover:from-accent-400 hover:to-accent-500 focus-visible:ring-accent/50",
        ghost: "text-text-secondary hover:bg-background-secondary hover:text-text-primary focus-visible:ring-primary/30 dark:hover:bg-background-tertiary",
        outline: "border-2 border-border-default bg-transparent hover:bg-background-secondary text-text-primary focus-visible:ring-primary/30 dark:hover:bg-background-tertiary",
        destructive: "bg-gradient-to-b from-error to-error-dark text-destructive-foreground shadow-lg shadow-error/30 hover:shadow-xl hover:shadow-error/40 focus-visible:ring-error/50",
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-0 px-0 h-auto",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        default: "h-11 px-6 text-base",
        md: "h-11 px-6 text-base",
        lg: "h-12 px-8 text-lg",
        xl: "h-14 px-10 text-lg",
        icon: "h-11 w-11 p-0",
        "icon-sm": "h-9 w-9 p-0",
        "icon-lg": "h-12 w-12 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, leftIcon, rightIcon, loading, fullWidth, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp 
        className={cn(
          buttonVariants({ variant, size }), 
          fullWidth && "w-full",
          className
        )} 
        ref={ref} 
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {children}
          </>
        ) : (
          <>
            {leftIcon && <span className="flex items-center">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex items-center">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
