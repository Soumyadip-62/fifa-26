import type { MatchPageResponse } from "@/types/football";
import { apiUrl } from "./config";

export type MatchPageFilters = {
  competition: string;
  status: string;
  stage: string;
  day: string;
  q: string;
  page: number;
  limit: number;
};

export async function getMatchPage(
  filters: MatchPageFilters,
  signal?: AbortSignal,
): Promise<MatchPageResponse> {
  const params = new URLSearchParams({
    competition: filters.competition,
    status: filters.status,
    stage: filters.stage,
    day: filters.day,
    q: filters.q,
    page: String(filters.page),
    limit: String(filters.limit),
  });
  const response = await fetch(apiUrl(`/football/matches?${params}`), {
    signal,
    ...(typeof window === "undefined" ? { next: { revalidate: 30 } } : {}),
  });
  if (!response.ok) throw new Error("Matches are temporarily unavailable.");
  return response.json() as Promise<MatchPageResponse>;
}
