"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Filter, RefreshCw, Search, X } from "lucide-react";
import { isUpcomingFixture, orderFixtures } from "@/lib/matches/fixture-order";
import { ErrorState } from "@/components/common/ErrorState";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/common/Pagination";
import {
  PlatformMatchCard,
  type ResolvedMatch,
} from "@/components/football/PlatformMatchCard";
import type { Competition } from "@/types/football";

function localDate(date: Date) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Kolkata" }).format(
    date,
  );
}

export function MatchesExplorer({
  items,
  competitions,
  leagueErrors,
  initialCompetition = "all",
  initialStatus = "all",
}: {
  items: ResolvedMatch[];
  competitions: Competition[];
  leagueErrors: Partial<Record<string, string>>;
  initialCompetition?: string;
  initialStatus?: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const pageSize = 24;
  const [competition, setCompetition] = useState(initialCompetition);
  const [stage, setStage] = useState("all");
  const [query, setQuery] = useState("");
  const [day, setDay] = useState("all");
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const today = localDate(new Date());
  const tomorrow = localDate(new Date(Date.now() + 86_400_000));
  const filtered = useMemo(
    () =>
      orderFixtures(
        items.filter((item) => {
          const date = localDate(new Date(item.match.kickoff));
          const text =
            `${item.homeTeam.name} ${item.awayTeam.name} ${item.competition.name}`.toLowerCase();
          return (
            (status === "all" ||
              (status === "upcoming"
                ? isUpcomingFixture(item.match)
                : item.match.status === status)) &&
            (competition === "all" ||
              item.match.competitionId === competition) &&
            (stage === "all" || item.match.stage === stage) &&
            (!query || text.includes(query.toLowerCase())) &&
            (day === "all" ||
              (day === "today" && date === today) ||
              (day === "tomorrow" && date === tomorrow) ||
              (day === "past" && item.match.status === "finished") ||
              (day === "upcoming" && isUpcomingFixture(item.match)))
          );
        }),
      ),
    [items, status, competition, stage, query, day, today, tomorrow],
  );
  const reset = () => {
    setStatus("all");
    setCompetition("all");
    setStage("all");
    setQuery("");
    setDay("all");
    setPage(1);
  };
  const selectClass =
    "h-12 rounded-lg border border-border bg-card px-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary dark:border-border dark:bg-card";
  return (
    <div className="grid gap-5">
      <div className="filter-tabs scrollbar-hide">
        {[
          { id: "all", label: "All" },
          { id: "live", label: "Live" },
          { id: "upcoming", label: "Upcoming" },
          { id: "finished", label: "Finished" },
        ].map((item) => (
          <button
            key={item.id}
            aria-pressed={status === item.id}
            onClick={() => {
              setStatus(item.id);
              setPage(1);
            }}
            className={`h-11 shrink-0 rounded-full px-5 text-xs font-bold ${status === item.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground dark:bg-card dark:text-secondary-foreground"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="filter-bar filter-bar-grid">
        <div className="hidden items-center gap-2 text-xs font-bold md:flex">
          <Filter className="size-4 text-primary" />
          Filters
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="relative lg:col-span-2">
            <Search className="absolute left-4 top-4 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search team or competition"
              className="h-12 rounded-lg pl-11"
            />
          </label>
          <select
            aria-label="Competition"
            value={competition}
            onChange={(event) => {
              setCompetition(event.target.value);
              setStage("all");
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="all">All competitions</option>
            {competitions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.shortName}
              </option>
            ))}
          </select>
          <select
            aria-label="Stage"
            value={stage}
            onChange={(event) => {
              setStage(event.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="all">All stages</option>
            {[...new Set(items.map((item) => item.match.stage))].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All matches" },
            { id: "today", label: "Today" },
            { id: "tomorrow", label: "Tomorrow" },
            { id: "past", label: "Previous" },
            { id: "upcoming", label: "Upcoming" },
          ].map((item) => (
            <button
              key={item.id}
              aria-pressed={day === item.id}
              onClick={() => {
                setDay(item.id);
                setPage(1);
              }}
              className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${day === item.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground dark:border-border"}`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={reset}
            className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground"
          >
            <X className="size-3" />
            Clear
          </button>
        </div>
      </div>
      {Object.entries(leagueErrors).map(([id, error]) =>
        error && (competition === "all" || competition === id) ? (
          <ErrorState
            key={id}
            title={`${competitions.find((item) => item.id === id)?.shortName ?? "League"} matches unavailable`}
            message={error}
          />
        ) : null,
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold text-muted-foreground">
          {filtered.length} matches · Live and upcoming first, latest results
          next
        </p>
        <button
          type="button"
          disabled={refreshing}
          onClick={() => startRefresh(() => router.refresh())}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-bold disabled:opacity-50 dark:border-border"
        >
          <RefreshCw
            className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing fixtures..." : "Refresh fixtures"}
        </button>
      </div>
      {filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered
            .slice((page - 1) * pageSize, page * pageSize)
            .map((item) => (
              <PlatformMatchCard
                key={`${item.match.competitionId}-${item.match.id}`}
                item={item}
              />
            ))}
        </div>
      ) : leagueErrors[competition] ? null : (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <h2 className="font-heading text-lg font-bold">No matches found</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Try clearing one or more filters.
          </p>
        </div>
      )}
      <Pagination
        page={page}
        total={filtered.length}
        pageSize={pageSize}
        onChange={setPage}
        label="matches"
      />
    </div>
  );
}
