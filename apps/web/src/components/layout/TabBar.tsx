"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Home, Calendar, Trophy, Shield, Newspaper, History } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const tabItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/matches", label: "Matches", icon: Calendar },
  { href: "/points-table", label: "Table", icon: Trophy },
  { href: "/teams", label: "Teams", icon: Shield },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/history", label: "History", icon: History },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-5 left-1/2 z-50 w-[92%] max-w-[420px] -translate-x-1/2 sm:hidden">
      <nav className="ios-glass flex items-center justify-around px-2 py-2.5 rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
        {tabItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-colors duration-200 select-none text-[10px] font-bold tracking-tight"
            >
              <div className="relative flex flex-col items-center gap-1">
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute -inset-x-3 -inset-y-1.5 -z-10 rounded-xl bg-primary/10 dark:bg-primary/15"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive
                      ? "text-primary scale-110"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                  )}
                />
                <span
                  className={cn(
                    "text-[9px] font-bold tracking-tight mt-0.5",
                    isActive
                      ? "text-primary"
                      : "text-neutral-500 dark:text-neutral-400"
                  )}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
