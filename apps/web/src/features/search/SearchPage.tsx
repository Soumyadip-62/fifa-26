"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Newspaper,
  Search,
  Trophy,
  UserRound,
} from "lucide-react";
import { apiUrl } from "@/lib/api/config";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/common/SectionHeader";
import { TeamMark } from "@/components/football/TeamMark";
import type {
  Competition,
  FootballNews,
  FootballPlayer,
  FootballTeam,
} from "@/types/football";
import type { ResolvedMatch } from "@/components/football/PlatformMatchCard";

export function SearchPage({
  teams,
  players,
  competitions,
  matches,
  news,
}: {
  teams: FootballTeam[];
  players: FootballPlayer[];
  competitions: Competition[];
  matches: ResolvedMatch[];
  news: FootballNews[];
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const empty = {
    teams: [] as FootballTeam[],
    players: [] as FootballPlayer[],
    competitions: [] as Competition[],
    matches: [] as ResolvedMatch[],
    news: [] as FootballNews[],
  };
  const [results, setResults] = useState(empty),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    if (q.length < 2) {
      setResults({
        teams: [],
        players: [],
        competitions: [],
        matches: [],
        news: [],
      });
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      setError("");
      void fetch(
        apiUrl(`/football/search?q=${encodeURIComponent(q)}&pageSize=100`),
        { signal: controller.signal },
      )
        .then((r) => {
          if (!r.ok) throw new Error("Search is temporarily unavailable.");
          return r.json();
        })
        .then(
          (data: {
            items: Array<{
              kind: string;
              item:
                | FootballTeam
                | FootballPlayer
                | Competition
                | ResolvedMatch["match"]
                | FootballNews;
            }>;
          }) => {
            const next = {
              teams: [] as FootballTeam[],
              players: [] as FootballPlayer[],
              competitions: [] as Competition[],
              matches: [] as ResolvedMatch[],
              news: [] as FootballNews[],
            };
            for (const r of data.items) {
              if (r.kind === "matches") {
                const found = matches.find((m) => m.match.id === r.item.id);
                if (found) next.matches.push(found);
              } else if (r.kind === "teams")
                next.teams.push(r.item as FootballTeam);
              else if (r.kind === "players")
                next.players.push(r.item as FootballPlayer);
              else if (r.kind === "competitions")
                next.competitions.push(r.item as Competition);
              else if (r.kind === "news")
                next.news.push(r.item as FootballNews);
            }
            setResults(next);
          },
        )
        .catch((e) => {
          if (!controller.signal.aborted) {
            setError(e.message);
            setResults({
              teams: [],
              players: [],
              competitions: [],
              matches: [],
              news: [],
            });
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [q, matches]);
  void teams;
  void players;
  void competitions;
  void news;

  const total = Object.values(results).reduce(
    (sum, items) => sum + items.length,
    0,
  );
  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Everything football"
        title="Find your football"
        description="Search teams, players, competitions, fixtures and the latest stories."
      />
      {loading ? (
        <p role="status" className="text-sm text-muted-foreground">
          Searching…
        </p>
      ) : null}
      {error ? (
        <p role="status" className="text-red-500">
          {error}
        </p>
      ) : null}
      <label className="relative w-full max-w-5xl">
        <Search className="absolute left-4 top-4 size-5 text-muted-foreground" />
        <Input
          aria-label="Search football"
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search teams, players, competitions, matches and news"
          className="h-13 rounded-lg pl-12 text-base"
        />
      </label>
      {!q ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Search className="mx-auto mb-3 size-7 text-muted-foreground" />
          <p className="text-sm font-bold">
            Start with a club, player or competition
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try “Real”, “Arsenal” or “Champions League”.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {total} results for “{query}”
          </p>
          {results.teams.length ? (
            <ResultSection title="Teams">
              {results.teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className="rounded-lg border border-border bg-card p-3 dark:border-border dark:bg-card"
                >
                  <TeamMark team={team} />
                </Link>
              ))}
            </ResultSection>
          ) : null}
          {results.players.length ? (
            <ResultSection title="Players">
              {results.players.map((player) => (
                <Link
                  key={player.id}
                  href={`/players/${player.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm dark:border-border dark:bg-card"
                >
                  <UserRound className="size-4 text-primary" />
                  {player.name}
                </Link>
              ))}
            </ResultSection>
          ) : null}
          {results.competitions.length ? (
            <ResultSection title="Competitions">
              {results.competitions.map((item) => (
                <Link
                  key={item.id}
                  href={`/competitions/${item.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm dark:border-border dark:bg-card"
                >
                  <Trophy className="size-4 text-primary" />
                  {item.name}
                </Link>
              ))}
            </ResultSection>
          ) : null}
          {results.matches.length ? (
            <ResultSection title="Matches">
              {results.matches.map((match) => (
                <Link
                  key={match.match.id}
                  href={`/matches/${match.match.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm dark:border-border dark:bg-card"
                >
                  <CalendarDays className="size-4 text-primary" />
                  {match.homeTeam.name} vs {match.awayTeam.name}
                </Link>
              ))}
            </ResultSection>
          ) : null}
          {results.news.length ? (
            <ResultSection title="News">
              {results.news.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm dark:border-border dark:bg-card"
                >
                  <Newspaper className="size-4 text-primary" />
                  {article.title}
                </Link>
              ))}
            </ResultSection>
          ) : null}
          {total === 0 ? (
            <p className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
              No results. Try a broader search.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
function ResultSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 font-heading text-sm font-black">{title}</h2>
      <div className="grid gap-2 sm:grid-cols-2">{children}</div>
    </section>
  );
}
