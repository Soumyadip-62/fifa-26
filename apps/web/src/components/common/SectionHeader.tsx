export type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <header className="grid gap-2 items-start">
      {eyebrow ? (
        <p className="w-fit h-fit rounded-md border border-emerald-700/15 bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-200">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-3xl font-black leading-tight tracking-normal text-neutral-950 dark:text-neutral-50 sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-3xl text-base leading-7 text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      ) : null}
    </header>
  );
}
