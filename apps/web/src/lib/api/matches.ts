import { mockMatches } from "@/data/mock/matches";
import { images } from "@/assets";
import { apiUrl } from "@/lib/api/config";
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
  sportsDbHomeTeamId?: string;
  sportsDbAwayTeamId?: string;
  youtubeVideoId?: string;
};

const statuses = new Set<MatchStatus>([
  "scheduled",
  "live",
  "finished",
  "postponed",
  "cancelled",
]);

function trimOptional(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed || undefined;
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toTeam(
  team: MatchTeam | string | undefined,
  fallbackName: string,
  logoUrl?: string | null,
  teamID?: string,
): MatchTeam {
  const normalizedLogoUrl = trimOptional(logoUrl);
  const normalizedTeamID = trimOptional(teamID);

  if (team && typeof team === "object") {
    const name = trimOptional(team.name) ?? fallbackName;
    const id = trimOptional(team.id) ?? toSlug(name);
    const sportsDbTeamID = normalizedTeamID ?? trimOptional(team.teamID);

    return {
      ...team,
      id,
      name,
      country: trimOptional(team.country) ?? name,
      logoUrl: trimOptional(team.logoUrl) ?? normalizedLogoUrl,
      teamID: sportsDbTeamID,
    };
  }

  const name = trimOptional(team) ?? fallbackName;

  return {
    id: toSlug(name),
    name,
    country: name,
    logoUrl: normalizedLogoUrl,
    teamID: normalizedTeamID,
  };
}

function toStatus(status: string | undefined): MatchStatus {
  return status && statuses.has(status as MatchStatus)
    ? (status as MatchStatus)
    : "scheduled";
}

function toUtcIso(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const timestamp = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`;
  const parsed = Date.parse(timestamp);

  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : undefined;
}

function toMatchDate(match: ApiMatch) {
  return (
    toUtcIso(match.timestampUtc) ??
    toUtcIso(match.date) ??
    new Date().toISOString()
  );
}

function normalizeMatch(match: ApiMatch): Match {
  const venue =
    typeof match.venue === "object" ? match.venue.stadium : match.venue;
  const city = typeof match.venue === "object" ? match.venue.city : match.city;

  return {
    ...match,
    id: match.id ?? crypto.randomUUID(),
    tournament: match.tournament ?? "FIFA 26",
    date: toMatchDate(match),
    homeTeam: toTeam(
      match.homeTeam,
      "Home Team",
      match.homeTeamBadgeUrl,
      match.sportsDbHomeTeamId,
    ),
    awayTeam: toTeam(
      match.awayTeam,
      "Away Team",
      match.awayTeamBadgeUrl,
      match.sportsDbAwayTeamId,
    ),
    venue,
    venueImageUrl: match.venueImageUrl ?? images.stadiums.default,
    city,
    status: toStatus(match.status),
    score: match.score ?? { home: null, away: null },
    youtubeVideoId: match.youtubeVideoId,
  };
}

function getMatchTime(match: Match) {
  const parsed = Date.parse(match.date);

  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

function sortMatchesByDate(matches: Match[]) {
  return [...matches].sort((a, b) => {
    const dateDiff = getMatchTime(a) - getMatchTime(b);

    if (dateDiff !== 0) {
      return dateDiff;
    }

    return (a.matchNumber ?? 0) - (b.matchNumber ?? 0);
  });
}

export async function getMatches(): Promise<Match[]> {
  try {
    const response = await fetch(apiUrl("/matches"));
    if (!response.ok) {
      throw new Error("Failed to fetch matches");
    }
    const data = (await response.json()) as Match[];
    return sortMatchesByDate(data.map(normalizeMatch));
  } catch {
    return sortMatchesByDate(mockMatches);
  }
}

export async function getMatchById(matchId: string): Promise<Match> {
  try {
    const response = await fetch(apiUrl(`/matches/${matchId}`));
    if (!response.ok) {
      throw new Error("Failed to fetch match");
    }
    const data = (await response.json()) as Match;
    return data && normalizeMatch(data);
  } catch {
    return mockMatches.find((match) => match.id === matchId)!;
  }
}

export async function getQualifierMatches(): Promise<Match[]> {
  try {
    const response = await fetch(apiUrl("/matches/qualifier-matches"));
    if (!response.ok) {
      throw new Error("Failed to fetch qualifier matches");
    }
    const data = (await response.json()) as Match[];
    return sortMatchesByDate(data.map(normalizeMatch));
  } catch {
    return [];
  }
}

export async function searchMatchesByTeam(team: string): Promise<Match[]> {
  const query = team.trim();

  if (!query) {
    return getMatches();
  }

  try {
    const url = apiUrl(`/search/matches?team=${encodeURIComponent(query)}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to search matches");
    }
    const data = (await response.json()) as Match[];
    return sortMatchesByDate(data.map(normalizeMatch));
  } catch {
    const normalizedQuery = query.toLowerCase();

    return sortMatchesByDate(
      mockMatches.filter(
        (match) =>
          match.homeTeam.name.toLowerCase().includes(normalizedQuery) ||
          match.awayTeam.name.toLowerCase().includes(normalizedQuery),
      ),
    );
  }
}
