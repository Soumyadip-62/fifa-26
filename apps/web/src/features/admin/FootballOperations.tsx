"use client";
import { useState } from "react";
import { apiUrl } from "@/lib/api/config";
type Status = {
  jobs: Array<{
    name: string;
    lastSuccessAt: string | null;
    lastError: string | null;
  }>;
  seasons: Array<{
    competitionId: string;
    season: number;
    lastSyncedAt: string;
  }>;
  deliveries: Array<{ status: string; count: number }>;
  pushEnabled: boolean;
  scheduler: string;
  providers: Record<
    string,
    { configured?: boolean; available?: boolean; reason?: string }
  >;
};
export function FootballOperations({ secret }: { secret: string }) {
  const [data, setData] = useState<Status | null>(null),
    [competition, setCompetition] = useState("all"),
    [season, setSeason] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const request = async (path: string, method = "GET", body?: unknown) => {
    const r = await fetch(apiUrl(`/football/admin/${path}`), {
      method,
      headers: { "x-admin-secret": secret, "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(180000),
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new Error(e.message ?? "Operation failed.");
    }
    return r.json();
  };
  const run = async (action: "status" | "import" | "backfill") => {
    setBusy(true);
    setMessage("");
    try {
      await request(
        action,
        action === "status" ? "GET" : "POST",
        action === "import"
          ? { competition, ...(season ? { season } : {}) }
          : undefined,
      );
      setData(await request("status"));
      setMessage("Operation completed.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Operation failed.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="grid gap-4 rounded-lg border bg-card p-6 dark:bg-card">
      <h2 className="font-heading text-xl font-black">
        Football data operations
      </h2>
      <div className="flex flex-wrap gap-3">
        <select
          aria-label="Competition to import"
          value={competition}
          onChange={(e) => setCompetition(e.target.value)}
          className="rounded-lg border bg-card p-3 dark:bg-card"
        >
          <option value="all">All competitions</option>
          {["world-cup", "premier-league", "la-liga", "ucl", "bundesliga"].map(
            (id) => (
              <option key={id}>{id}</option>
            ),
          )}
        </select>
        <input
          aria-label="Starting season year"
          type="number"
          min="1800"
          max="2200"
          placeholder="Current season"
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          className="rounded-lg border bg-card p-3 dark:bg-card"
        />
        {(["status", "import", "backfill"] as const).map((action) => (
          <button
            key={action}
            disabled={busy || !secret}
            onClick={() => void run(action)}
            className="rounded-lg bg-primary px-4 py-2 font-bold capitalize text-primary-foreground disabled:opacity-50"
          >
            {action}
          </button>
        ))}
      </div>
      {message ? (
        <p role="status" className="text-sm">
          {message}
        </p>
      ) : null}
      {data ? (
        <>
          <p className="text-xs">
            Scheduler: {data.scheduler} · Automatic push:{" "}
            {data.pushEnabled ? "enabled" : "disabled"}
          </p>
          <div className="grid gap-2 text-sm">
            {data.jobs.map((j) => (
              <p key={j.name}>
                <strong>{j.name}</strong> · Last success:{" "}
                {j.lastSuccessAt ?? "never"}
                {j.lastError ? (
                  <span className="block text-red-500">{j.lastError}</span>
                ) : null}
              </p>
            ))}
          </div>
          <div className="grid gap-2 text-xs">
            {data.seasons.map((s) => (
              <p key={`${s.competitionId}:${s.season}`}>
                {s.competitionId} {s.season} · Imported {s.lastSyncedAt}
              </p>
            ))}
          </div>
          <div className="text-xs">
            {Object.entries(data.providers).map(([name, p]) => (
              <p key={name}>
                {name}:{" "}
                {p.configured
                  ? "configured"
                  : p.available === false
                    ? "unavailable"
                    : "not configured"}{" "}
                {p.reason}
              </p>
            ))}
          </div>
          <p className="text-xs">
            Deliveries:{" "}
            {data.deliveries.map((d) => `${d.count} ${d.status}`).join(", ") ||
              "none"}
          </p>
        </>
      ) : null}
    </section>
  );
}
