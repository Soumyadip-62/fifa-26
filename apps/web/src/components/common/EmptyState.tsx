import { CircleDashed } from "lucide-react";

export type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
      <CircleDashed
        className="mx-auto mb-3 size-7 text-muted-foreground"
        aria-hidden="true"
      />
      <h2 className="font-heading text-base font-black text-foreground dark:text-white">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground dark:text-muted-foreground">
          {description}
        </p>
      ) : null}
    </section>
  );
}
