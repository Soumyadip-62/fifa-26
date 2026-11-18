"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { apiUrl } from "@/lib/api/config";
import { upcomingFixtures } from "@/lib/matches/fixture-order";
import {
  CalendarDays,
  Goal,
  Newspaper,
  Shield,
  Trophy,
  UserRound,
} from "lucide-react";
import {
  PlatformMatchCard,
  type ResolvedMatch,
} from "@/components/football/PlatformMatchCard";
import { TeamMark } from "@/components/football/TeamMark";
import type {
  FootballNews,
  FootballPlayer,
  FootballTeam,
} from "@/types/football";
const tabs = ["Overview", "Matches", "Squad", "Stats", "News"] as const;

export function TeamProfile({
  team,
  players,
  matches,
  news,
  controls,
  notice,
}: {
  team: FootballTeam;
  players: FootballPlayer[];
  matches: ResolvedMatch[];
  news: FootballNews[];
  controls?: ReactNode;
  notice?: ReactNode;
}) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const [newsItems, setNewsItems] = useState(news),
    [newsError, setNewsError] = useState(""),
    [newsLoading, setNewsLoading] = useState(false);
  useEffect(() => {
    if (tab !== "News") return;
    const c = new AbortController();
    setNewsLoading(true);
    setNewsError("");
    void fetch(apiUrl(`/football/teams/${encodeURIComponent(team.id)}/news`), {
      signal: c.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error("Team news is temporarily unavailable.");
        return r.json();
      })
      .then((d) => setNewsItems(d.articles))
      .catch((e) => {
        if (!c.signal.aborted) setNewsError(e.message);
      })
      .finally(() => {
        if (!c.signal.aborted) setNewsLoading(false);
      });
    return () => c.abort();
  }, [tab, team.id]);

  const next = upcomingFixtures(matches)[0];
  const statItems = [
    { label: "Matches", value: team.stats.played },
    { label: "Wins", value: team.stats.wins },
    { label: "Draws", value: team.stats.draws },
    { label: "Losses", value: team.stats.losses },
    { label: "Goals", value: team.stats.goals },
    { label: "Conceded", value: team.stats.conceded },
    { label: "Clean sheets", value: team.stats.cleanSheets },
    { label: "xG", value: team.stats.xg },
    {
      label: "Possession",
      value:
        team.stats.possession == null
          ? "Unavailable"
          : `${team.stats.possession}%`,
    },
  ];
  return (
    <div className="page-shell page-shell--compact">
      <header className="profile-header">
        <div className="flex w-full flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <TeamMark team={team} size="lg" showName={false} />
            <div className="min-w-0">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-primary">
                {team.competitionIds.includes("world-cup")
                  ? "National team"
                  : "Club profile"}
              </p>
              <h1>{team.name}</h1>
              <p className="mt-2 text-xs text-muted-foreground">
                {team.country}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-xs sm:text-right">
            <span>
              <b className="block text-[9px] uppercase text-muted-foreground">
                Coach
              </b>
              {team.coach || "Unavailable"}
            </span>
            <span>
              <b className="block text-[9px] uppercase text-muted-foreground">
                Home
              </b>
              {team.city || "Unavailable"}
            </span>
            <span>
              <b className="block text-[9px] uppercase text-muted-foreground">
                Founded
              </b>
              {team.founded ?? "Unavailable"}
            </span>
            <span>
              <b className="block text-[9px] uppercase text-muted-foreground">
                Position
              </b>
              {team.position ?? "Unavailable"}
            </span>
          </div>
        </div>
      </header>
      {controls && <div className="filter-bar">{controls}</div>}
      {notice}
      {team.biography ? (
        <p className="text-sm leading-7 text-muted-foreground">
          {team.biography}
        </p>
      ) : null}
      <nav
        className="filter-tabs scrollbar-hide"
        aria-label="Team profile sections"
      >
        {tabs.map((item) => (
          <button
            key={item}
            aria-pressed={tab === item}
            onClick={() => setTab(item)}
            className={`shrink-0 border-b-2 px-4 py-4 text-xs font-bold ${tab === item ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
          >
            {item}
          </button>
        ))}
      </nav>
      {tab === "Overview" ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="grid content-start gap-4">
            <h2 className="font-heading text-lg font-black">Next match</h2>
            {next ? (
              <PlatformMatchCard item={next} />
            ) : (
              <p className="rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
                No upcoming fixture.
              </p>
            )}
          </section>
          <section className="grid content-start gap-4">
            <h2 className="font-heading text-lg font-black">Current form</h2>
            <div className="flex gap-2">
              {team.form.map((result, index) => (
                <span
                  key={index}
                  className={`grid size-10 place-items-center rounded-lg font-black text-white ${result === "W" ? "bg-emerald-500" : result === "D" ? "bg-zinc-400" : "bg-red-500"}`}
                >
                  {result}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {statItems.slice(0, 6).map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-border bg-card p-3 dark:border-border dark:bg-card"
                >
                  <span className="block text-[9px] font-bold uppercase text-muted-foreground">
                    {item.label}
                  </span>
                  <strong className="font-heading text-xl">
                    {item.value ?? "Unavailable"}
                  </strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
      {tab === "Matches" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {matches.map((item) => (
            <PlatformMatchCard key={item.match.id} item={item} />
          ))}
        </div>
      ) : null}
      {tab === "Squad" ? (
        <div className="grid gap-6">
          {(["Goalkeeper", "Defender", "Midfielder", "Forward"] as const).map(
            (position) => {
              const list = players.filter(
                (player) => player.position === position,
              );
              return (
                <section key={position}>
                  <h2 className="mb-3 font-heading text-sm font-black">
                    {position}s
                  </h2>
                  {list.length ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {list.map((player) => (
                        <Link
                          href={`/players/${player.id}`}
                          key={player.id}
                          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 dark:border-border dark:bg-card"
                        >
                          <span className="grid size-10 place-items-center rounded-lg bg-primary/10 font-heading font-black text-primary">
                            {player.shirtNumber ?? "Unavailable"}
                          </span>
                          <span>
                            <strong className="block text-sm">
                              {player.name}
                            </strong>
                            <span className="text-[10px] text-muted-foreground">
                              {player.nationality}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Squad data pending.
                    </p>
                  )}
                </section>
              );
            },
          )}
        </div>
      ) : null}
      {tab === "Stats" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {statItems.map((item, index) => {
            const Icon = [
              CalendarDays,
              Trophy,
              Shield,
              Shield,
              Goal,
              Goal,
              Shield,
              UserRound,
              Trophy,
            ][index]!;
            return (
              <div
                key={item.label}
                className="rounded-lg border border-border bg-card p-4 dark:border-border dark:bg-card"
              >
                <Icon className="mb-3 size-4 text-primary" />
                <span className="block text-[9px] font-bold uppercase text-muted-foreground">
                  {item.label}
                </span>
                <strong className="font-heading text-2xl">
                  {item.value ?? "Unavailable"}
                </strong>
              </div>
            );
          })}
        </div>
      ) : null}
      {tab === "News" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {newsItems.length ? (
            newsItems.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="flex gap-3 rounded-lg border border-border bg-card p-4 dark:border-border dark:bg-card"
              >
                <Newspaper className="size-5 shrink-0 text-primary" />
                <span>
                  <strong className="block text-sm">{article.title}</strong>
                  <span className="text-xs text-muted-foreground">
                    {article.excerpt}
                  </span>
                </span>
              </Link>
            ))
          ) : (
            <p role="status" className="text-sm text-muted-foreground">
              {newsLoading
                ? "Loading team news..."
                : newsError || "No recent team news available."}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
