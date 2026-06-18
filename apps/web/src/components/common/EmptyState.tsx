export type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="rounded-[28px] border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 p-8 text-center backdrop-blur-md shadow-xs">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-200/50 text-zinc-500 font-bold dark:bg-zinc-800 dark:text-zinc-400 border border-black/5 dark:border-white/5">
        0
      </div>
      <h2 className="font-heading text-base font-black text-zinc-950 dark:text-white">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-1 max-w-xl text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      ) : null}
    </section>
  );
}
