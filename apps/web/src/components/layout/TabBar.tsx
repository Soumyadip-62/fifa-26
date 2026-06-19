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
    <div className="fixed bottom-4 left-1/2 z-50 w-[94%] max-w-[440px] -translate-x-1/2 lg:hidden">
      <nav className="ios-glass flex items-center justify-around px-1.5 py-2 rounded-[28px] shadow-[0_16px_48px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.5)] backdrop-blur-md">
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
              className="relative flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-colors duration-200 select-none min-w-0 flex-1"
            >
              <div className="relative flex flex-col items-center gap-0.5">
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute -inset-x-2 -inset-y-1.5 -z-10 rounded-[14px] bg-primary/12 dark:bg-primary/18"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
                <Icon
                  className={cn(
                    "h-[22px] w-[22px] transition-all duration-200",
                    isActive
                      ? "text-primary scale-110 drop-shadow-[0_0_6px_rgba(var(--primary),0.5)]"
                      : "text-neutral-400 dark:text-neutral-500"
                  )}
                />
                <span
                  className={cn(
                    "text-[9px] font-bold tracking-tight leading-none mt-0.5",
                    isActive
                      ? "text-primary"
                      : "text-neutral-400 dark:text-neutral-500"
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
