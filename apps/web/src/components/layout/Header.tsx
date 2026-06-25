"use client";

import Link from "next/link";
import Image from "next/image";
import { images } from "@/assets";
import { cn } from "@/lib/utils/cn";
import { usePathname } from "next/navigation";
import { DynamicIsland } from "./DynamicIsland";
import { ProfileDrawer } from "./ProfileDrawer";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/matches", label: "Matches" },
  { href: "/points-table", label: "Points Table" },
  { href: "/teams", label: "Teams" },
  { href: "/news", label: "News" },
  { href: "/history", label: "History" },
  { href: "/admin", label: "Admin" },
];

export function Header() {
  const pathname = usePathname();

  const isActivePath = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-0 z-50 ios-glass border-b border-black/5 dark:border-white/10 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <Link
          className="inline-flex items-center gap-2 text-base font-black tracking-normal text-zinc-950 dark:text-white"
          href="/"
        >
          <span className="relative h-8 w-8 rounded-lg overflow-hidden shadow-sm">
            <Image
              src={images.logos.fifa_logo}
              alt="FIFA 26"
              fill
              sizes="32px"
              className="object-contain"
              priority
            />
          </span>
          <span className="grid leading-tight">
            <span className="font-heading font-black text-sm tracking-tight">
              FIFA 26
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Tournament Hub
            </span>
          </span>
        </Link>

        <div className="hidden md:flex items-center justify-center flex-1 px-2">
          <DynamicIsland />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden lg:block" aria-label="Primary navigation">
            <ul className="flex items-center gap-1 rounded-full bg-zinc-200/50 p-1 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5">
              {navItems.map((item) => {
                const isActive = isActivePath(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      className={cn(
                        "inline-flex rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        isActive
                          ? "bg-white text-black shadow-sm dark:bg-zinc-700 dark:text-white"
                          : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200",
                      )}
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <ProfileDrawer />
        </div>
      </div>
    </header>
  );
}
