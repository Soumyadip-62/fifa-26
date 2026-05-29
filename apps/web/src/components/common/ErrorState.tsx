export type ErrorStateProps = {
  title?: string;
  message: string;
};

export function ErrorState({ title = "Something went wrong", message }: ErrorStateProps) {
  return (
    <section className="rounded-lg border border-red-200 bg-red-50/90 p-6 text-red-900 shadow-sm dark:border-red-500/30 dark:bg-red-950/35 dark:text-red-100">
      <h2 className="font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6">{message}</p>
    </section>
  );
}
