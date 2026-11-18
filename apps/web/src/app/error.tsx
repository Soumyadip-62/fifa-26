"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page-shell">
      <h1 className="font-heading text-2xl">Football data unavailable</h1>
      <p>We could not load this page. Please try again shortly.</p>
      <button
        className="w-fit rounded-lg bg-primary px-4 py-2 text-primary-foreground"
        onClick={reset}
      >
        Try again
      </button>
    </div>
  );
}
