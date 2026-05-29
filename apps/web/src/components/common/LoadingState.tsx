import { Skeleton } from "@/components/ui/skeleton";

export type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Loading football data..." }: LoadingStateProps) {
  return (
    <section
      className="grid gap-4 rounded-lg border border-neutral-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-neutral-950/80"
      aria-live="polite"
      aria-label={label}
    >
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </section>
  );
}
