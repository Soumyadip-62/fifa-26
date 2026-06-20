import type { ReactNode } from "react";

export type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <header className="grid max-w-3xl items-start gap-3">
      {eyebrow ? (
        <p className="w-fit h-fit rounded-full border border-black/5 bg-zinc-200/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:border-white/5 dark:bg-zinc-800/50 dark:text-zinc-400">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-heading text-[19px] sm:text-2xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-3xl lg:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-xs leading-relaxed text-zinc-550 dark:text-zinc-400 sm:text-sm">
          {description}
        </p>
      ) : null}
    </header>
  );
}
