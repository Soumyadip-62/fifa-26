"use client";
import { useEffect, useState } from "react";
import type {
  Competition,
  FootballTeam,
  FootballPlayer,
} from "@/types/football";
import { apiUrl } from "@/lib/api/config";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
type Row = {
  id: string;
  player: { name: string };
  team: { name: string };
  goals: number;
  assists: number | null;
  playedMatches: number | null;
};
export function StatisticsExplorer({
  competitions,
}: {
  competitions: Competition[];
  players?: FootballPlayer[];
  teams?: FootballTeam[];
}) {
  const [competition, setCompetition] = useState("premier-league"),
    [season, setSeason] = useState(""),
    [seasons, setSeasons] = useState<number[]>([]),
    [category, setCategory] = useState<"goals" | "assists" | "playedMatches">(
      "goals",
    ),
    [rows, setRows] = useState<Row[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    const c = new AbortController();
    setSeasons([]);
    void fetch(apiUrl(`/football/competitions/${competition}/seasons`), {
      signal: c.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setSeasons)
      .catch(() => {});
    return () => c.abort();
  }, [competition]);
  useEffect(() => {
    const c = new AbortController();
    setLoading(true);
    setError("");
    void fetch(
      apiUrl(
        `/football/competitions/${competition}/scorers${season ? `?season=${season}` : ""}`,
      ),
      { signal: c.signal },
    )
      .then((r) => {
        if (!r.ok)
          throw new Error("Scorer statistics are temporarily unavailable.");
        return r.json();
      })
      .then((d) => {
        setRows(d.players);
        if (d.availability.state === "unsupported")
          setError(d.availability.message);
      })
      .catch((e) => {
        if (!c.signal.aborted) {
          setRows([]);
          setError(e.message);
        }
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [competition, season]);
  const sorted = rows
    .filter((p) => p[category] != null)
    .sort((a, b) => (b[category] ?? 0) - (a[category] ?? 0));
  return (
    <div className="grid gap-5">
      <div className="filter-bar">
        <select
          aria-label="Competition"
          value={competition}
          onChange={(e) => {
            setCompetition(e.target.value);
            setSeason("");
          }}
          className="rounded-lg border bg-card p-3 dark:bg-card"
        >
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Season"
          value={season || String(seasons[0] ?? "")}
          onChange={(e) => setSeason(e.target.value)}
          className="rounded-lg border bg-card p-3 dark:bg-card"
        >
          {seasons.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          aria-label="Statistic"
          value={category}
          onChange={(e) => setCategory(e.target.value as typeof category)}
          className="rounded-lg border bg-card p-3 dark:bg-card"
        >
          <option value="goals">Goals</option>
          <option value="assists">Assists</option>
          <option value="playedMatches">Appearances</option>
        </select>
      </div>
      <p className="text-xs text-muted-foreground">
        Among the available leading scorers. Advanced metrics such as xG, shots
        and passing are unavailable with current access.
      </p>
      {loading ? (
        <LoadingState label="Loading player rankings..." />
      ) : error ? (
        <ErrorState title="Statistics unavailable" message={error} />
      ) : !sorted.length ? (
        <EmptyState
          title="No statistics available"
          description="Try another competition or season."
        />
      ) : (
        <div className="statistics-board">
          {sorted.map((p, i) => (
            <div key={p.id} className="statistics-row">
              <strong>{i + 1}</strong>
              <span>
                {p.player.name}
                <small className="block text-muted-foreground">
                  {p.team.name}
                </small>
              </span>
              <strong>{p[category]}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
