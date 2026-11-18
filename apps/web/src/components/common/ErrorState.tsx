export type ErrorStateProps = {
  title?: string;
  message: string;
};

export function ErrorState({
  title = "Something went wrong",
  message,
}: ErrorStateProps) {
  return (
    <section
      role="alert"
      className="rounded-lg border border-destructive/20 bg-destructive/8 p-5 text-destructive"
    >
      <h2 className="font-heading text-sm font-black tracking-tight">
        {title}
      </h2>
      <p className="mt-1 text-xs font-semibold leading-relaxed opacity-90">
        {message}
      </p>
    </section>
  );
}
