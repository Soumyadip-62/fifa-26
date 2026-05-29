import { mockMatches } from "@/data/mock/matches";
import { images } from "@/assets";
import type { Match, MatchStatus, MatchTeam } from "@/types/match";

type ApiVenue = {
  city?: string;
  stadium?: string;
};

type ApiMatch = Partial<
  Omit<Match, "awayTeam" | "homeTeam" | "score" | "status" | "venue">
> & {
  awayTeam?: MatchTeam | string;
  awayTeamBadgeUrl?: string | null;
  homeTeam?: MatchTeam | string;
  homeTeamBadgeUrl?: string | null;
  score?: Match["score"];
  status?: string;
  venue?: string | ApiVenue;
};

const statuses = new Set<MatchStatus>([
  "scheduled",
  "live",
  "finished",
  "postponed",
  "cancelled",
]);

function toTeam(
  team: MatchTeam | string | undefined,
  fallbackName: string,
  logoUrl?: string | null,
): MatchTeam {
  if (team && typeof team === "object") {
    return {
      ...team,
      logoUrl: team.logoUrl ?? logoUrl ?? undefined,
    };
  }

  const name = team ?? fallbackName;

  return {
    id: name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    name,
    country: name,
    logoUrl: logoUrl ?? undefined,
  };
}

function toStatus(status: string | undefined): MatchStatus {
  return status && statuses.has(status as MatchStatus)
    ? (status as MatchStatus)
    : "scheduled";
}

function normalizeMatch(match: ApiMatch): Match {
  const venue =
    typeof match.venue === "object" ? match.venue.stadium : match.venue;
  const city = typeof match.venue === "object" ? match.venue.city : match.city;

  return {
    ...match,
    id: match.id ?? crypto.randomUUID(),
    tournament: match.tournament ?? "FIFA 26",
    date: match.date ?? new Date().toISOString(),
    homeTeam: toTeam(match.homeTeam, "Home Team", match.homeTeamBadgeUrl),
    awayTeam: toTeam(match.awayTeam, "Away Team", match.awayTeamBadgeUrl),
    venue,
    venueImageUrl: match.venueImageUrl ?? images.stadiums.default,
    city,
    status: toStatus(match.status),
    score: match.score ?? { home: null, away: null },
  };
}

export async function getMatches(): Promise<Match[]> {
  try {
    const response = await fetch("http://localhost:3001/matches/");
    if (!response.ok) {
      throw new Error("Failed to fetch matches");
    }
    const data = (await response.json()) as Match[];
    return data.map(normalizeMatch);
  } catch {
    return mockMatches;
  }
}

export async function getMatchById(matchId: string): Promise<Match> {
  try {
    const response = await fetch(`http://localhost:3001/matches/${matchId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch match");
    }
    const data = (await response.json()) as Match;
    return data && normalizeMatch(data);
  } catch {
    return mockMatches.find((match) => match.id === matchId)!;
  }
}

export async function searchMatchesByTeam(team: string): Promise<Match[]> {
  const query = team.trim();

  if (!query) {
    return getMatches();
  }

  try {
    const response = await fetch(
      `http://localhost:3001/search/matches?team=${encodeURIComponent(query)}`,
    );
    if (!response.ok) {
      throw new Error("Failed to search matches");
    }
    const data = (await response.json()) as Match[];
    return data.map(normalizeMatch);
  } catch {
    const normalizedQuery = query.toLowerCase();

    return mockMatches.filter(
      (match) =>
        match.homeTeam.name.toLowerCase().includes(normalizedQuery) ||
        match.awayTeam.name.toLowerCase().includes(normalizedQuery),
    );
  }
}
