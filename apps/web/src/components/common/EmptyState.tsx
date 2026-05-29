export type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-950">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        0
      </div>
      <h2 className="text-lg font-bold text-neutral-950 dark:text-neutral-50">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">{description}</p> : null}
    </section>
  );
}
