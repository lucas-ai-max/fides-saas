import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans text-button font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-white rounded-md shadow-sm hover:bg-primary-light hover:shadow-md min-h-[44px]",
        secondary: "bg-white text-primary border-2 border-primary rounded-md hover:bg-bg-secondary min-h-[44px]",
        accent: "bg-accent text-accent-foreground rounded-lg shadow-[0_2px_4px_rgba(201,169,97,0.3)] hover:bg-accent-light hover:shadow-[0_4px_8px_rgba(201,169,97,0.4)] min-h-[48px] text-base font-bold",
        ghost: "bg-transparent text-text-secondary hover:bg-bg-tertiary rounded-md",
        outline: "border-2 border-borders-medium bg-transparent hover:bg-bg-secondary rounded-md",
        destructive: "bg-error text-white hover:bg-error-dark rounded-md shadow-sm",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-6 py-3",
        sm: "px-4 py-2 text-sm",
        lg: "px-7 py-3.5 text-base",
        icon: "h-11 w-11",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
