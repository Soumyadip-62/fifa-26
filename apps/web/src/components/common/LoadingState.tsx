import { Skeleton } from "@/components/ui/skeleton";

export type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Loading football data..." }: LoadingStateProps) {
  return (
    <section
      className="grid gap-4 rounded-[28px] border border-black/5 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md p-5 shadow-xs"
      aria-live="polite"
      aria-label={label}
    >
      <Skeleton className="h-5 w-40 rounded-full" />
      <Skeleton className="h-24 w-full rounded-[20px]" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-20 rounded-[16px]" />
        <Skeleton className="h-20 rounded-[16px]" />
        <Skeleton className="h-20 rounded-[16px]" />
      </div>
    </section>
  );
}
