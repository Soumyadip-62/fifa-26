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
    <header className="grid gap-2">
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-3xl font-bold leading-tight tracking-normal text-neutral-950 dark:text-neutral-50 sm:text-4xl">
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
