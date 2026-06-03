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
    <header className="grid max-w-3xl items-start gap-3">
      {eyebrow ? (
        <p className="w-fit h-fit rounded-md border border-emerald-700/15 bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-200">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-heading text-2xl font-black tracking-normal text-neutral-950 dark:text-neutral-50 sm:text-3xl lg:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-sm leading-7 text-neutral-600 dark:text-neutral-400 sm:text-base">
          {description}
        </p>
      ) : null}
    </header>
  );
}
