export type ErrorStateProps = {
  title?: string;
  message: string;
};

export function ErrorState({ title = "Something went wrong", message }: ErrorStateProps) {
  return (
    <section className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200">
      <h2 className="font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6">{message}</p>
    </section>
  );
}
