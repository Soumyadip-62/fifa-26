export type ErrorStateProps = {
  title?: string;
  message: string;
};

export function ErrorState({ title = "Something went wrong", message }: ErrorStateProps) {
  return (
    <section className="rounded-[24px] border border-destructive/15 bg-destructive/10 dark:bg-destructive/15 p-5 text-destructive backdrop-blur-md shadow-xs">
      <h2 className="font-heading text-sm font-black tracking-tight">{title}</h2>
      <p className="mt-1 text-xs font-semibold leading-relaxed opacity-90">{message}</p>
    </section>
  );
}
