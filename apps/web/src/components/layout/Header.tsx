import Link from "next/link";
import Image from "next/image";
import { images } from "@/assets";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/matches", label: "Matches" },
  { href: "/teams", label: "Teams" },
  { href: "/news", label: "News" },
  { href: "/history", label: "History" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-emerald-900/10 bg-white/88 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/88">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link
          className="inline-flex items-center gap-3 text-base font-black tracking-normal text-emerald-950 dark:text-emerald-200"
          href="/"
        >
          <span className="relative h-9 w-9  shadow-sm">
            <Image
              src={images.logos.fifa_logo}
              alt="FIFA 26"
              fill
              sizes="36px"
              className="object-contain"
              priority
            />
          </span>
          <span className="grid leading-tight ">
            <span className="font-bold">FIFA 26</span>
            <span className="text-[10px] leading-4 font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Tournament Hub
            </span>
          </span>
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="flex flex-wrap gap-1 rounded-lg border border-neutral-200/80 bg-white/75 p-1 dark:border-white/10 dark:bg-white/5">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  className="inline-flex rounded-md px-3 py-2 text-sm font-semibold text-neutral-600 transition-colors hover:bg-emerald-50 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-emerald-200"
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
