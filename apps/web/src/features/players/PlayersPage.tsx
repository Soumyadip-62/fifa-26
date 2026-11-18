"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PlayerAvatar } from "@/components/common/PlayerAvatar";
import { SectionHeader } from "@/components/common/SectionHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { Input } from "@/components/ui/input";
import type { FootballPlayer, FootballTeam } from "@/types/football";

export function PlayersPage({
  players,
  teams,
}: {
  players: FootballPlayer[];
  teams: FootballTeam[];
}) {
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 24;
  const teamsById = useMemo(
    () => new Map(teams.map((team) => [team.id, team])),
    [teams],
  );
  const filtered = useMemo(
    () =>
      players.filter(
        (player) =>
          (!query ||
            `${player.name} ${player.nationality} ${teamsById.get(player.teamId)?.name ?? ""}`
              .toLowerCase()
              .includes(query.toLowerCase())) &&
          (position === "all" ||
            (position === "unknown"
              ? player.position == null
              : player.position === position)),
      ),
    [players, teamsById, query, position],
  );
  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="The people behind the game"
        title="Players"
        description="Explore squads, discover players and follow the names that make your matchday."
      />
      <div className="filter-bar filter-bar-grid sm:grid-cols-[minmax(0,1fr)_220px]">
        <label className="relative">
          <Search
            className="absolute left-3.5 top-3.5 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            aria-label="Search players"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search players, nationalities or clubs"
            className="pl-10"
          />
        </label>
        <select
          aria-label="Player position"
          value={position}
          onChange={(event) => {
            setPosition(event.target.value);
            setPage(1);
          }}
        >
          <option value="all">All positions</option>
          <option>Goalkeeper</option>
          <option>Defender</option>
          <option>Midfielder</option>
          <option>Forward</option>
          <option value="unknown">Position unavailable</option>
        </select>
      </div>
      <div className="results-meta">
        <p>
          <strong>{filtered.length.toLocaleString("en-GB")}</strong> players
          {query || position !== "all"
            ? " match your filters"
            : " in the player directory"}
        </p>
        <span>Published statistics only</span>
      </div>
      {filtered.length ? (
        <div className="directory-grid player-directory-grid">
          {filtered
            .slice((page - 1) * pageSize, page * pageSize)
            .map((player) => {
              const team = teamsById.get(player.teamId);
              return (
                <Link
                  href={`/players/${player.id}`}
                  key={player.id}
                  className="directory-card player-directory-card"
                >
                  <PlayerAvatar name={player.name} imageUrl={player.imageUrl} />
                  <span className="player-directory-name">
                    <strong>{player.name}</strong>
                    <small>
                      {team?.shortName ?? "Team unavailable"} ·{" "}
                      {player.position ?? "Position unavailable"}
                    </small>
                  </span>
                  <span className="player-directory-goals">
                    <strong
                      title={
                        player.stats.goals == null
                          ? "Goal statistics unavailable"
                          : undefined
                      }
                    >
                      {player.stats.goals ?? "—"}
                    </strong>
                    <small>Goals</small>
                  </span>
                </Link>
              );
            })}
        </div>
      ) : (
        <EmptyState
          title="No players found"
          description="Try another name, club or position."
        />
      )}
      <Pagination
        page={page}
        total={filtered.length}
        pageSize={pageSize}
        onChange={setPage}
        label="players"
      />
    </div>
  );
}
