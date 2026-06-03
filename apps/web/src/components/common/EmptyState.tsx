export type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="rounded-lg border border-dashed border-neutral-300 bg-white/85 p-8 text-center shadow-sm dark:border-white/15 dark:bg-neutral-950/75">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-700/10 dark:bg-emerald-400/10 dark:text-emerald-200 dark:ring-emerald-300/20">
        0
      </div>
      <h2 className="font-heading text-lg font-bold text-neutral-950 dark:text-neutral-50">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      ) : null}
    </section>
  );
}
