import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/matches", label: "Matches" },
  { href: "/teams", label: "Teams" },
  { href: "/news", label: "News" },
  { href: "/history", label: "History" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/85 backdrop-blur dark:border-neutral-800/80 dark:bg-neutral-950/85">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link className="text-base font-black tracking-normal text-emerald-900 dark:text-emerald-300" href="/">
          FIFA 26 Platform
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="flex flex-wrap gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  className="inline-flex rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-emerald-50 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-neutral-400 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-200"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
