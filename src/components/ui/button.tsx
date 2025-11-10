import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans text-button font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary-light text-primary-foreground rounded-xl shadow-mariano hover:shadow-lg hover:shadow-primary/30 min-h-[48px]",
        secondary: "bg-transparent text-primary border-2 border-primary rounded-xl hover:bg-primary/5 min-h-[48px]",
        accent: "bg-gradient-to-r from-accent to-accent-light text-accent-foreground rounded-xl shadow-gold hover:shadow-lg hover:shadow-accent/40 min-h-[52px] text-base font-bold",
        ghost: "bg-transparent text-gray-text hover:bg-gray-light rounded-xl",
        outline: "border-2 border-gray-light bg-transparent hover:bg-gray-light/50 rounded-xl text-text-primary",
        destructive: "bg-error text-white hover:bg-error/90 rounded-xl shadow-sm",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-6 py-3",
        sm: "px-4 py-2 text-sm",
        lg: "px-8 py-4 text-base",
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
