"use client";

import Link from "next/link";
import Image from "next/image";
import { images } from "@/assets";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { Menu, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/matches", label: "Matches" },
  { href: "/teams", label: "Teams" },
  { href: "/news", label: "News" },
  { href: "/history", label: "History" },
];

export function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
      }
    }

    const scrollY = window.scrollY;
    const { overflow, position, top, width } = document.body.style;
    const htmlOverflow = document.documentElement.style.overflow;

    document.addEventListener("keydown", handleKeyDown);
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = overflow;
      document.body.style.position = position;
      document.body.style.top = top;
      document.body.style.width = width;
      window.scrollTo(0, scrollY);
    };
  }, [isDrawerOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-emerald-900/10 bg-white/88 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/88">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
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
              <span className="font-heading font-bold">FIFA 26</span>
              <span className="text-[10px] leading-4 font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Tournament Hub
              </span>
            </span>
          </Link>
          <nav className="hidden sm:block" aria-label="Primary navigation">
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
          <Button
            aria-controls="mobile-navigation"
            aria-expanded={isDrawerOpen}
            aria-label="Open navigation menu"
            className="h-10 w-10 p-0 sm:hidden"
            onClick={() => setIsDrawerOpen(true)}
            type="button"
            variant="outline"
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-neutral-950/45 opacity-0 backdrop-blur-sm transition-opacity sm:hidden",
          isDrawerOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none",
        )}
        aria-hidden="true"
        onClick={() => setIsDrawerOpen(false)}
      />
      <aside
        id="mobile-navigation"
        className={cn(
          "fixed right-0 top-0 z-[70] h-svh w-full max-w-80 border-l border-neutral-200 bg-white p-4 shadow-2xl transition-transform duration-200 dark:border-white/10 dark:bg-neutral-950 sm:hidden",
          isDrawerOpen
            ? "translate-x-0"
            : "pointer-events-none translate-x-full",
        )}
        aria-hidden={!isDrawerOpen}
        aria-modal="true"
        role="dialog"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Menu
          </span>
          <Button
            aria-label="Close navigation menu"
            className="h-10 w-10 p-0"
            onClick={() => setIsDrawerOpen(false)}
            type="button"
            variant="ghost"
          >
            <XIcon aria-hidden="true" className="h-5 w-5" />
          </Button>
        </div>
        <nav className="mt-6" aria-label="Mobile navigation">
          <ul className="grid gap-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  className="flex rounded-md px-3 py-3 text-base font-semibold text-neutral-700 transition-colors hover:bg-emerald-50 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-neutral-200 dark:hover:bg-white/10 dark:hover:text-emerald-200"
                  href={item.href}
                  onClick={() => setIsDrawerOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
