"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MapPin, Search, ArrowUpRight } from "lucide-react";
import { TeamMark } from "@/components/football/TeamMark";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { Input } from "@/components/ui/input";
import type { Competition, FootballTeam } from "@/types/football";

export function TeamDirectory({
  teams,
  competitions,
}: {
  teams: FootballTeam[];
  competitions: Competition[];
}) {
  const [query, setQuery] = useState("");
  const [competitionId, setCompetitionId] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 24;
  const filtered = useMemo(
    () =>
      teams.filter(
        (team) =>
          (!query ||
            `${team.name} ${team.country} ${team.city}`
              .toLowerCase()
              .includes(query.toLowerCase())) &&
          (competitionId === "all" ||
            team.competitionIds.includes(competitionId as Competition["id"])),
      ),
    [teams, query, competitionId],
  );
  return (
    <div className="grid gap-4">
      <div className="filter-bar filter-bar-grid sm:grid-cols-[minmax(0,1fr)_240px]">
        <label className="relative">
          <Search
            className="absolute left-3.5 top-3.5 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            aria-label="Search teams"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search clubs, countries or cities"
            className="pl-10"
          />
        </label>
        <select
          aria-label="Competition"
          value={competitionId}
          onChange={(event) => {
            setCompetitionId(event.target.value);
            setPage(1);
          }}
        >
          <option value="all">All competitions</option>
          {competitions.map((competition) => (
            <option key={competition.id} value={competition.id}>
              {competition.shortName}
            </option>
          ))}
        </select>
      </div>
      <div className="results-meta">
        <p>
          <strong>{filtered.length.toLocaleString("en-GB")}</strong> teams
          {query || competitionId !== "all"
            ? " match your filters"
            : " across club football"}
        </p>
        <span>Club football</span>
      </div>
      {filtered.length ? (
        <div className="directory-grid">
          {filtered
            .slice((page - 1) * pageSize, page * pageSize)
            .map((team) => (
              <Link
                href={`/teams/${team.id}`}
                key={team.id}
                className="directory-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <TeamMark team={team} />
                  <ArrowUpRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {team.competitionIds.slice(0, 2).map((id) => (
                    <span
                      key={id}
                      className="rounded bg-secondary px-2 py-1 text-[9px] text-muted-foreground"
                    >
                      {competitions.find((item) => item.id === id)?.shortName ??
                        id}
                    </span>
                  ))}
                </div>
                <div className="directory-card-meta">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3 shrink-0" aria-hidden="true" />
                    {[team.city, team.country].filter(Boolean).join(", ") ||
                      "Location unavailable"}
                  </span>
                  <span className="shrink-0">{team.stats.wins} wins</span>
                </div>
              </Link>
            ))}
        </div>
      ) : (
        <EmptyState
          title="No teams found"
          description="Try a different team name or competition."
        />
      )}
      <Pagination
        page={page}
        total={filtered.length}
        pageSize={pageSize}
        onChange={setPage}
        label="teams"
      />
    </div>
  );
}
