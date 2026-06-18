export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-transparent dark:border-white/5 py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 text-xs font-bold text-zinc-500 dark:text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-zinc-700 dark:text-zinc-400">
          FIFA 26 Tournament Hub
        </p>
        <p className="font-normal opacity-85">Fixtures, teams, news, and history wired for live data.</p>
      </div>
    </footer>
  );
}
