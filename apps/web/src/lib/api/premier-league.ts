import "server-only";
import { cache } from "react";
import { apiUrl } from "./config";
import type {
  DataSection,
  PremierLeagueData,
  ProviderCompetition,
  ProviderMatch,
  ProviderMatchDetails,
  ProviderScorer,
  ProviderStanding,
  ProviderTeam,
} from "@/types/premier-league";
import {
  mapCompetition,
  mapMatches,
  mapMatchDetails,
  mapScorers,
  mapStandings,
  mapTeam,
} from "./premier-league-mappers";

export type LeagueId = "premier-league" | "la-liga" | "ucl" | "bundesliga";
export const leagueIds: readonly LeagueId[] = [
  "premier-league",
  "la-liga",
  "ucl",
  "bundesliga",
];
class FootballDataError extends Error {}

// Render-level deduplication only. PostgreSQL/backend own persistent caching.
const request = cache(async (path: string): Promise<unknown> => {
  const response = await fetch(apiUrl(`/tournaments${path}`), {
    cache: "no-store",
    signal: AbortSignal.timeout(40_000),
  });
  if (response.status === 404)
    throw new FootballDataError("Football data was not found.");
  if (!response.ok) {
    if (response.status === 429)
      throw new FootballDataError(
        "Football data is temporarily busy. Please try again shortly.",
      );
    throw new FootballDataError("Football data is temporarily unavailable.");
  }
  return response.json();
});

export function footballDataError(error: unknown): string {
  return error instanceof FootballDataError
    ? error.message
    : "Football data is temporarily unavailable.";
}

async function section<T>(load: () => Promise<T>): Promise<DataSection<T>> {
  try {
    return { data: await load(), error: null };
  } catch (error) {
    return { data: null, error: footballDataError(error) };
  }
}

export const getPremierLeagueMatch = cache(async (id: string) => {
  if (!/^\d+$/.test(id)) return null;
  try {
    const raw = (await request(`/matches/${id}`)) as ProviderMatchDetails & {
      freshness?: { fetchedAt: string; stale: boolean };
    };
    if (!["PL", "PD", "CL", "BL1"].includes(raw.competition.code)) return null;
    return { ...mapMatchDetails(raw), freshness: raw.freshness };
  } catch (error) {
    if (
      error instanceof FootballDataError &&
      error.message === "Football data was not found."
    )
      return null;
    throw error;
  }
});

export const getLeagueCompetition = cache(async (id: LeagueId) => {
  const raw = (await request(`/${id}`)) as ProviderCompetition;
  return {
    raw,
    competition: mapCompetition(raw, id),
    season: raw.currentSeason.startDate.slice(0, 4),
  };
});

// Fixture screens never start statistics, scorers, or detail requests.
export const getLeagueFixtures = cache(async (id: LeagueId) => {
  const { competition, season } = await getLeagueCompetition(id);
  const result = (await request(`/${id}/matches?season=${season}`)) as {
    matches: ProviderMatch[];
  };
  return {
    competition,
    matches: mapMatches(result.matches, competition.season, id),
  };
});

export const getPremierLeagueData = cache(
  async (id: LeagueId = "premier-league"): Promise<PremierLeagueData> => {
    const { competition, season } = await getLeagueCompetition(id);
    const path = `/${id}`;
    let teams: PremierLeagueData["teams"] | undefined;
    let matches: PremierLeagueData["matches"] | undefined;
    let standings: PremierLeagueData["standings"] | undefined;
    let scorers: PremierLeagueData["scorers"] | undefined;
    return {
      competition,
      get teams() {
        return (teams ??= section(async () => {
          const result = (await request(`${path}/teams?season=${season}`)) as {
            teams: ProviderTeam[];
          };
          return result.teams.map((team) => mapTeam(team, competition.region));
        }));
      },
      get matches() {
        return (matches ??= section(
          async () => (await getLeagueFixtures(id)).matches,
        ));
      },
      get standings() {
        return (standings ??= section(async () => {
          const result = (await request(
            `${path}/standings?season=${season}`,
          )) as {
            standings: Array<{ type: string; table: ProviderStanding[] }>;
          };
          const total = result.standings.find(
            (standing) => standing.type === "TOTAL",
          );
          if (!total)
            throw new FootballDataError("Standings are currently unavailable.");
          return mapStandings(total.table, id);
        }));
      },
      get scorers() {
        return (scorers ??= section(async () => {
          const result = (await request(
            `${path}/scorers?season=${season}&limit=5`,
          )) as { scorers: ProviderScorer[] };
          return mapScorers(result.scorers);
        }));
      },
    };
  },
);
