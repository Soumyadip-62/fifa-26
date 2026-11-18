"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Heart, Home, Newspaper, Trophy } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/matches", label: "Matches", icon: CalendarDays },
  { href: "/competitions", label: "Competitions", icon: Trophy },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/favourites", label: "Saved", icon: Heart },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 xl:hidden">
      <nav
        aria-label="Mobile navigation"
        className="home-bottom-nav flex items-center justify-around px-1 py-2"
        style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      >
        {tabs.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : item.href === "/matches"
                ? pathname.startsWith("/matches") || pathname === "/live"
                : item.href === "/competitions"
                  ? pathname.startsWith("/competitions") ||
                    pathname === "/standings" ||
                    pathname === "/points-table"
                  : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg py-1"
            >
              <Icon className="size-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
