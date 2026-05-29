import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Avatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />;
}

export function AvatarFallback({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
        className,
      )}
      {...props}
    />
  );
}
