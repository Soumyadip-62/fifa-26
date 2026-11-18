"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, History, ListOrdered, MapPin } from "lucide-react";

const labels: Record<string, string> = {
  competitions: "Competitions",
  matches: "Matches",
  teams: "Teams",
  players: "Players",
  news: "Newsroom",
  standings: "Standings",
  statistics: "Statistics",
  stadiums: "Stadiums",
  live: "Live football",
  favourites: "Your favourites",
  history: "World Cup history",
  search: "Search",
  settings: "Settings",
  notifications: "Notifications",
  admin: "Operations",
  "points-table": "World Cup standings",
  "knockout-matches": "Knockout stage",
  "premier-league": "Premier League",
  "world-cup": "World Cup",
  "la-liga": "La Liga",
  ucl: "Champions League",
  bundesliga: "Bundesliga",
};

export function PageContext() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  const segments = pathname.split("/").filter(Boolean);
  const section = segments[0] ?? "";
  const nested = segments.length > 1;
  const detail =
    labels[segments[1] ?? ""] ??
    (section === "competitions"
      ? segments[1]?.replaceAll("-", " ")
      : section === "matches"
        ? "Match centre"
        : section === "news"
          ? "Story"
          : "Profile");
  return (
    <div className="page-context">
      <nav aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <ChevronRight aria-hidden="true" />
        {nested && labels[section] ? (
          <>
            {section === "settings" ? (
              <span>Settings</span>
            ) : (
              <Link href={`/${section}`}>{labels[section]}</Link>
            )}
            <ChevronRight aria-hidden="true" />
            <span aria-current="page">{detail}</span>
          </>
        ) : (
          <span aria-current="page">{labels[section] ?? "Page not found"}</span>
        )}
      </nav>
      <div className="page-context-links">
        <Link href="/standings">
          <ListOrdered aria-hidden="true" />
          Standings
        </Link>
        <Link href="/stadiums">
          <MapPin aria-hidden="true" />
          Stadiums
        </Link>
        <Link href="/history">
          <History aria-hidden="true" />
          History
        </Link>
      </div>
    </div>
  );
}
