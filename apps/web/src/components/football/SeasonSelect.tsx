"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { apiUrl } from "@/lib/api/config";
export function SeasonSelect({
  competitionId,
  selected,
}: {
  competitionId: string;
  selected?: string;
}) {
  const [seasons, setSeasons] = useState<number[]>([]),
    [error, setError] = useState(false);
  const router = useRouter(),
    path = usePathname(),
    params = useSearchParams();
  useEffect(() => {
    const controller = new AbortController();
    void fetch(apiUrl(`/football/competitions/${competitionId}/seasons`), {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setSeasons)
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [competitionId]);
  return (
    <label className="inline-flex items-center gap-2 text-xs font-bold">
      Season
      <select
        aria-label="Season"
        value={selected ?? String(seasons[0] ?? "")}
        onChange={(e) => {
          const q = new URLSearchParams(params);
          q.set("season", e.target.value);
          router.push(`${path}?${q}`);
        }}
        className="rounded-lg border bg-card p-2 text-black dark:bg-card dark:text-white"
      >
        {!seasons.length ? (
          <option>{error ? "Unavailable" : "Loading…"}</option>
        ) : (
          seasons.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))
        )}
      </select>
    </label>
  );
}
