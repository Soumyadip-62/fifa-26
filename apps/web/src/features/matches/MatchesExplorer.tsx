"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, RefreshCw, Search, X } from "lucide-react";
import { ErrorState } from "@/components/common/ErrorState";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/common/Pagination";
import { PlatformMatchCard } from "@/components/football/PlatformMatchCard";
import { getMatchPage } from "@/lib/api/match-pages";
import type { MatchPageResponse } from "@/types/football";

export function MatchesExplorer({
  initialPage,
  initialCompetition = "all",
  initialStatus = "all",
}: {
  initialPage: MatchPageResponse;
  initialCompetition?: string;
  initialStatus?: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const pageSize = 24;
  const [competition, setCompetition] = useState(initialCompetition);
  const [stage, setStage] = useState("all");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [day, setDay] = useState("all");
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);
  const filters = {
    competition,
    status,
    stage,
    day,
    q: search,
    page,
    limit: pageSize,
  };
  const initialSelection =
    competition === initialCompetition &&
    status === initialStatus &&
    stage === "all" &&
    day === "all" &&
    search === "" &&
    page === 1;
  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["match-page", filters],
    queryFn: ({ signal }) => getMatchPage(filters, signal),
    initialData: initialSelection ? initialPage : undefined,
    staleTime: status === "live" || day === "today" ? 30_000 : 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  });
  const competitions = data?.competitions ?? initialPage.competitions;
  const stages = data?.stages ?? initialPage.stages;
  const leagueErrors = data?.errors ?? initialPage.errors;
  const items = data?.data ?? [];
  const total = data?.pagination.total ?? 0;
  const reset = () => {
    setStatus("all");
    setCompetition("all");
    setStage("all");
    setQuery("");
    setSearch("");
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
            {stages.map((item) => (
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
          {total} matches · Live and upcoming first, latest results next
        </p>
        <button
          type="button"
          disabled={isFetching}
          onClick={() => void refetch()}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-bold disabled:opacity-50 dark:border-border"
        >
          <RefreshCw
            className={`size-3.5 ${isFetching ? "animate-spin" : ""}`}
          />
          {isFetching ? "Refreshing fixtures..." : "Refresh fixtures"}
        </button>
      </div>
      {isError && (
        <ErrorState
          title="Matches unavailable"
          message={error instanceof Error ? error.message : "Please try again."}
        />
      )}
      {isPending ? (
        <p
          className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground"
          role="status"
        >
          Loading matches...
        </p>
      ) : items.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <PlatformMatchCard
              key={`${item.match.competitionId}-${item.match.id}`}
              item={item}
            />
          ))}
        </div>
      ) : leagueErrors[competition as keyof typeof leagueErrors] ||
        isError ? null : (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <h2 className="font-heading text-lg font-bold">No matches found</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Try clearing one or more filters.
          </p>
        </div>
      )}
      <Pagination
        page={page}
        total={total}
        pageSize={pageSize}
        onChange={(nextPage) => {
          if (!isFetching) setPage(nextPage);
        }}
        label="matches"
        disabled={isFetching}
      />
    </div>
  );
}
