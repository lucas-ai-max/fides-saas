import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-xl border border-border bg-background-secondary text-base text-text-primary placeholder:text-text-disabled transition-all focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium dark:bg-background-tertiary",
  {
    variants: {
      inputSize: {
        sm: "h-9 px-3 py-2 text-sm",
        default: "h-11 px-4 py-3 text-base",
        lg: "h-12 px-5 py-3 text-lg",
      },
    },
    defaultVariants: {
      inputSize: "default",
    },
  },
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputSize, leftIcon, rightIcon, ...props }, ref) => {
    if (leftIcon || rightIcon) {
      return (
        <div className="relative w-full">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ inputSize }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className,
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(inputVariants({ inputSize }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
