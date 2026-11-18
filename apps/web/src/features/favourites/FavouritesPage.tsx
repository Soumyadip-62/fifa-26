"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  CalendarDays,
  Search,
  Shield,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { usePreferences, toggleFavourite } from "@/lib/preferences";
import { SectionHeader } from "@/components/common/SectionHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Pagination } from "@/components/common/Pagination";
import { PlayerAvatar } from "@/components/common/PlayerAvatar";
import { TeamMark } from "@/components/football/TeamMark";
import { CompetitionBadge } from "@/components/football/CompetitionBadge";
import {
  PlatformMatchCard,
  type ResolvedMatch,
} from "@/components/football/PlatformMatchCard";
import { Input } from "@/components/ui/input";
import { orderFixtures } from "@/lib/matches/fixture-order";
import type {
  Competition,
  FootballPlayer,
  FootballTeam,
} from "@/types/football";

const categories = [
  { id: "teams", label: "Teams", key: "teamIds", icon: Shield },
  { id: "players", label: "Players", key: "playerIds", icon: Users },
  {
    id: "competitions",
    label: "Competitions",
    key: "competitionIds",
    icon: Trophy,
  },
  { id: "matches", label: "Matches", key: "matchIds", icon: CalendarDays },
] as const;
type FavouriteKey = (typeof categories)[number]["key"];

function FavouriteRow({
  href,
  name,
  selected,
  onToggle,
  children,
}: {
  href: string;
  name: string;
  selected: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <article className="directory-card saved-row" data-selected={selected}>
      <Link href={href} className="flex min-w-0 flex-1 items-center gap-3">
        {children}
      </Link>
      <button
        type="button"
        aria-label={`${selected ? "Remove" : "Save"} ${name}`}
        aria-pressed={selected}
        onClick={onToggle}
        className={selected ? "text-primary" : "text-muted-foreground"}
      >
        <Star
          className="size-4"
          fill={selected ? "currentColor" : "none"}
          aria-hidden="true"
        />
      </button>
    </article>
  );
}

export function FavouritesPage({
  teams,
  players,
  competitions,
  matches,
}: {
  teams: FootballTeam[];
  players: FootballPlayer[];
  competitions: Competition[];
  matches: ResolvedMatch[];
}) {
  const preferences = usePreferences();
  const [category, setCategory] =
    useState<(typeof categories)[number]["id"]>("teams");
  const [mode, setMode] = useState<"saved" | "discover">("saved");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const pageSize = 24;
  const q = query.trim().toLowerCase();
  const include = (key: FavouriteKey, id: string, text: string) =>
    (mode === "discover" || preferences[key].includes(id)) &&
    (!q || text.toLowerCase().includes(q));
  const filteredTeams = teams.filter((team) =>
    include("teamIds", team.id, `${team.name} ${team.country}`),
  );
  const filteredPlayers = players.filter((player) =>
    include("playerIds", player.id, `${player.name} ${player.nationality}`),
  );
  const filteredCompetitions = competitions.filter((competition) =>
    include("competitionIds", competition.id, competition.name),
  );
  const filteredMatches = orderFixtures(
    matches.filter((item) =>
      include(
        "matchIds",
        item.match.id,
        `${item.homeTeam.name} ${item.awayTeam.name} ${item.competition.name}`,
      ),
    ),
  );
  const total =
    category === "teams"
      ? filteredTeams.length
      : category === "players"
        ? filteredPlayers.length
        : category === "competitions"
          ? filteredCompetitions.length
          : filteredMatches.length;
  const visiblePage = Math.min(page, Math.max(1, Math.ceil(total / pageSize)));
  const start = (visiblePage - 1) * pageSize;
  const save = (key: FavouriteKey, id: string) => {
    try {
      toggleFavourite(key, id);
      setError("");
    } catch {
      setError(
        "Your favourites could not be saved. Please allow storage for this site.",
      );
    }
  };
  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Your football, closer"
        title="Your favourites"
        description="The teams you follow. The players you watch. The matches you don't want to miss. Saved on this device."
      />
      <nav className="filter-tabs" aria-label="Favourite categories">
        {categories.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === item.id}
              onClick={() => {
                setCategory(item.id);
                setQuery("");
                setPage(1);
              }}
              className="inline-flex items-center gap-2"
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {item.label}
              <span className="text-[10px] opacity-65">
                {preferences[item.key].length}
              </span>
            </button>
          );
        })}
      </nav>
      <div className="filter-bar">
        <label className="relative min-w-0 flex-1">
          <Search
            className="absolute left-3.5 top-3.5 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            aria-label="Search favourites"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder={`Search ${category}`}
            className="pl-10"
          />
        </label>
        <div className="flex gap-2">
          {(["saved", "discover"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => {
                setMode(value);
                setPage(1);
              }}
              className={`rounded-md px-3 py-2.5 text-xs font-semibold ${mode === value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
            >
              {value === "saved" ? "Saved" : "Discover"}
            </button>
          ))}
        </div>
      </div>
      {error && <ErrorState title="Could not save favourite" message={error} />}
      <div className="results-meta">
        <p>
          <strong>{total.toLocaleString("en-GB")}</strong>{" "}
          {mode === "saved" ? "saved" : "available"} {category}
        </p>
        <span>
          {mode === "discover"
            ? "Select the star to save"
            : "Made for your matchday"}
        </span>
      </div>
      {!total ? (
        <div className="grid justify-items-center gap-3">
          <div className="w-full">
            <EmptyState
              title={
                q
                  ? "No favourites match your search"
                  : `No ${category} saved yet`
              }
              description={
                q
                  ? "Try another name or clear your search."
                  : `Discover ${category} and select the star to keep them here.`
              }
            />
          </div>
          {mode === "saved" && !q && (
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-3 text-xs font-semibold text-primary-foreground"
              onClick={() => {
                setMode("discover");
                setPage(1);
              }}
            >
              Discover {category}
            </button>
          )}
        </div>
      ) : (
        <div
          className={
            category === "matches"
              ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
              : "directory-grid"
          }
        >
          {category === "teams" &&
            filteredTeams.slice(start, start + pageSize).map((team) => (
              <FavouriteRow
                key={team.id}
                href={`/teams/${team.id}`}
                name={team.name}
                selected={preferences.teamIds.includes(team.id)}
                onToggle={() => save("teamIds", team.id)}
              >
                <TeamMark team={team} />
              </FavouriteRow>
            ))}
          {category === "players" &&
            filteredPlayers.slice(start, start + pageSize).map((player) => (
              <FavouriteRow
                key={player.id}
                href={`/players/${player.id}`}
                name={player.name}
                selected={preferences.playerIds.includes(player.id)}
                onToggle={() => save("playerIds", player.id)}
              >
                <PlayerAvatar name={player.name} imageUrl={player.imageUrl} />
                <span className="min-w-0 text-xs font-semibold">
                  {player.name}
                  <small className="mt-1 block font-normal text-muted-foreground">
                    {player.position ?? "Position unavailable"}
                  </small>
                </span>
              </FavouriteRow>
            ))}
          {category === "competitions" &&
            filteredCompetitions
              .slice(start, start + pageSize)
              .map((competition) => (
                <FavouriteRow
                  key={competition.id}
                  href={`/competitions/${competition.id}`}
                  name={competition.name}
                  selected={preferences.competitionIds.includes(competition.id)}
                  onToggle={() => save("competitionIds", competition.id)}
                >
                  <CompetitionBadge competition={competition} />
                </FavouriteRow>
              ))}
          {category === "matches" &&
            filteredMatches
              .slice(start, start + pageSize)
              .map((item) => (
                <PlatformMatchCard key={item.match.id} item={item} />
              ))}
        </div>
      )}
      <Pagination
        page={visiblePage}
        total={total}
        pageSize={pageSize}
        onChange={setPage}
        label={category}
      />
    </div>
  );
}
