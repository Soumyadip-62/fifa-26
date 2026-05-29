import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-emerald-700 text-white shadow-sm hover:bg-emerald-800 dark:bg-emerald-400 dark:text-emerald-950 dark:hover:bg-emerald-300",
        outline:
          "border border-emerald-700/70 bg-white/85 text-emerald-900 shadow-sm hover:bg-emerald-50 dark:border-emerald-400/60 dark:bg-white/5 dark:text-emerald-200 dark:hover:bg-emerald-950/70",
        ghost: "text-neutral-700 hover:bg-emerald-50 hover:text-emerald-900 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-emerald-200",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
