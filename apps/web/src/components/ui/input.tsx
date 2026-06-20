/* eslint-disable react/prop-types */
import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-neutral-200/80 dark:bg-black/90 px-3 py-2 text-sm text-neutral-950 shadow-sm outline-none ring-offset-white placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-neutral-950/80 dark:text-neutral-50 dark:ring-offset-neutral-950 dark:placeholder:text-neutral-500",
        className,
      )}
      type={type}
      {...props}
    />
  );
}
