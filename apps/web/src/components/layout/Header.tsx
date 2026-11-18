"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  Bell,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  Heart,
  History,
  Home,
  ListOrdered,
  MapPin,
  Menu,
  Newspaper,
  Radio,
  Search,
  Shield,
  Trophy,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { images } from "@/assets";
import { cn } from "@/lib/utils/cn";
import { ProfileDrawer } from "./ProfileDrawer";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/competitions", label: "Competitions", icon: Trophy },
  { href: "/matches", label: "Matches", icon: CalendarDays },
  { href: "/teams", label: "Teams", icon: Shield },
  { href: "/players", label: "Players", icon: Users },
  {
    href: "/statistics",
    label: "Statistics",
    icon: ChartNoAxesColumnIncreasing,
  },
  { href: "/news", label: "News", icon: Newspaper },
];
const extraLinks = [
  { href: "/live", label: "Live football", icon: Radio },
  { href: "/standings", label: "Standings", icon: ListOrdered },
  { href: "/favourites", label: "Your favourites", icon: Heart },
  { href: "/stadiums", label: "Stadiums", icon: MapPin },
  { href: "/history", label: "World Cup history", icon: History },
  {
    href: "/settings/notifications",
    label: "Notification settings",
    icon: Bell,
  },
];
const competitions = [
  { href: "/competitions/world-cup", label: "World Cup" },
  { href: "/competitions/ucl", label: "Champions League" },
  { href: "/competitions/premier-league", label: "Premier League" },
  { href: "/competitions/la-liga", label: "La Liga" },
  { href: "/competitions/bundesliga", label: "Bundesliga" },
];

export function Header() {
  const pathname = usePathname();
  const mobileMenu = useRef<HTMLDetailsElement>(null);
  const competitionMenu = useRef<HTMLDetailsElement>(null);
  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const linkClass = (href: string) =>
    cn("home-nav-link", active(href) && "is-active");
  const closeMenus = () => {
    mobileMenu.current?.removeAttribute("open");
    competitionMenu.current?.removeAttribute("open");
  };
  return (
    <>
      <a href="#main-content" className="app-skip-link">
        Skip to content
      </a>
      <header className="home-header fixed inset-x-0 top-0 z-50 border-b">
        <div className="home-header-inner flex min-h-16 items-center gap-3">
          <Link
            href="/"
            className="home-brand mr-auto inline-flex items-center gap-2"
            aria-label="Football Companion home"
            onClick={closeMenus}
          >
            <span className="home-brand-icon relative shrink-0">
              <Image
                src={images.logos.fifa_logo}
                alt=""
                fill
                sizes="32px"
                className="object-contain"
                priority
              />
            </span>
            <span className="grid leading-tight">
              <strong>Football</strong>
              <small>Companion</small>
            </span>
          </Link>
          <nav
            className="hidden items-center gap-1 xl:flex"
            aria-label="Primary navigation"
          >
            <Link
              href="/"
              className={linkClass("/")}
              aria-current={active("/") ? "page" : undefined}
            >
              Home
            </Link>
            <details
              ref={competitionMenu}
              className="relative"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.currentTarget.open = false;
                  event.currentTarget.querySelector("summary")?.focus();
                }
              }}
            >
              <summary
                className={cn(
                  linkClass("/competitions"),
                  "cursor-pointer list-none",
                )}
              >
                Competitions
                <ChevronDown className="size-3" aria-hidden="true" />
              </summary>
              <div className="home-nav-dropdown absolute left-0 top-[calc(100%+0.5rem)] w-52 rounded-lg border border-border p-1 shadow-xl">
                {competitions.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenus}
                    className="block rounded-md px-3 py-3 text-xs font-semibold"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </details>
            {links.slice(2).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(item.href)}
                aria-current={active(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/search"
            aria-label="Search football"
            className="home-header-action"
          >
            <Search aria-hidden="true" />
          </Link>
          <Link
            href="/settings/notifications"
            aria-label="Notification settings"
            className="home-header-action header-notifications"
          >
            <Bell aria-hidden="true" />
          </Link>
          <details
            ref={mobileMenu}
            className="mobile-menu xl:hidden"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.currentTarget.open = false;
                event.currentTarget.querySelector("summary")?.focus();
              }
            }}
          >
            <summary
              className="home-header-action"
              aria-label="Browse football pages"
            >
              <Menu aria-hidden="true" />
            </summary>
            <nav className="mobile-menu-panel" aria-label="All football pages">
              {[...links, ...extraLinks].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenus}
                    aria-current={active(item.href) ? "page" : undefined}
                  >
                    <Icon aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </details>
          <ProfileDrawer />
        </div>
      </header>
    </>
  );
}
