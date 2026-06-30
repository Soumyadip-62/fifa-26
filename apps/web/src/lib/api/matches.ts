import { mockMatches } from "@/data/mock/matches";
import { images } from "@/assets";
import { apiUrl } from "@/lib/api/config";
import type { Match, MatchGoal, MatchStatus, MatchTeam } from "@/types/match";

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
  goals?: unknown[] | null;
  homeGoals?: unknown[] | string | null;
  awayGoals?: unknown[] | string | null;
  strHomeGoalDetails?: string | null;
  strAwayGoalDetails?: string | null;
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

function normalizeGoalTeam(value: unknown): "home" | "away" | undefined {
  if (value === "home" || value === "HOME_TEAM") {
    return "home";
  }

  if (value === "away" || value === "AWAY_TEAM") {
    return "away";
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.toLowerCase();

  if (normalized.includes("home")) {
    return "home";
  }

  if (normalized.includes("away")) {
    return "away";
  }

  return undefined;
}

function normalizeNameForCompare(value: string | undefined) {
  return value?.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function readTeamName(team: MatchTeam | string | undefined) {
  return typeof team === "string" ? team : team?.name;
}

function readNestedString(value: unknown, keys: string[]) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  let current: unknown = value;

  for (const key of keys) {
    if (!current || typeof current !== "object" || !(key in current)) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === "string" ? trimOptional(current) : undefined;
}

function inferGoalTeam(
  record: Record<string, unknown>,
  match: ApiMatch,
  fallbackTeam?: "home" | "away",
) {
  const explicitTeam =
    normalizeGoalTeam(record.team) ??
    normalizeGoalTeam(readNestedString(record.team, ["side"]));

  if (explicitTeam) {
    return explicitTeam;
  }

  const goalTeamName =
    (typeof record.team === "string" ? record.team : undefined) ??
    readNestedString(record.team, ["name"]);
  const normalizedGoalTeam = normalizeNameForCompare(goalTeamName);

  if (!normalizedGoalTeam) {
    return fallbackTeam;
  }

  if (normalizedGoalTeam === normalizeNameForCompare(readTeamName(match.homeTeam))) {
    return "home";
  }

  if (normalizedGoalTeam === normalizeNameForCompare(readTeamName(match.awayTeam))) {
    return "away";
  }

  return fallbackTeam;
}

function toGoal(
  goal: unknown,
  match: ApiMatch,
  fallbackTeam?: "home" | "away",
): MatchGoal | null {
  if (!goal || typeof goal !== "object") {
    return null;
  }

  const record = goal as Record<string, unknown>;
  const name =
    (typeof record.name === "string" ? trimOptional(record.name) : undefined) ??
    (typeof record.player === "string"
      ? trimOptional(record.player)
      : undefined) ??
    readNestedString(record.scorer, ["name"]) ??
    readNestedString(record.player, ["name"]);

  if (!name) {
    return null;
  }

  const minute =
    typeof record.minute === "number" || typeof record.minute === "string"
      ? record.minute
      : null;
  const type = typeof record.type === "string" ? record.type : null;

  return {
    name,
    team: inferGoalTeam(record, match, fallbackTeam),
    minute,
    type,
    penalty: Boolean(record.penalty) || /pen/i.test(type ?? ""),
    ownGoal: Boolean(record.ownGoal) || /own goal|og/i.test(type ?? ""),
  };
}

function splitGoalDetails(value: string) {
  return value
    .split(/[;,]\s*/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseGoalDetails(
  value: string | null | undefined,
  team: "home" | "away",
): MatchGoal[] {
  if (!value) {
    return [];
  }

  return splitGoalDetails(value)
    .map((entry) => {
      const minuteMatch = entry.match(/\(([^)]*)\)/);
      const minuteText = minuteMatch?.[1]?.trim() ?? "";
      const minute = minuteText.match(/\d+(?:\+\d+)?/)?.[0] ?? null;
      const name = trimOptional(entry.replace(/\([^)]*\)/g, ""));

      if (!name) {
        return null;
      }

      const goal: MatchGoal = {
        name,
        team,
        minute,
        penalty: /pen/i.test(minuteText),
        ownGoal: /own|og/i.test(minuteText),
      };

      return goal;
    })
    .filter((goal): goal is MatchGoal => Boolean(goal));
}

function normalizeGoals(match: ApiMatch) {
  const goals = [
    ...(Array.isArray(match.goals)
      ? match.goals.map((goal) => toGoal(goal, match))
      : []),
    ...(Array.isArray(match.homeGoals)
      ? match.homeGoals.map((goal) => toGoal(goal, match, "home"))
      : []),
    ...(Array.isArray(match.awayGoals)
      ? match.awayGoals.map((goal) => toGoal(goal, match, "away"))
      : []),
    ...(typeof match.homeGoals === "string"
      ? parseGoalDetails(match.homeGoals, "home")
      : []),
    ...(typeof match.awayGoals === "string"
      ? parseGoalDetails(match.awayGoals, "away")
      : []),
    ...parseGoalDetails(match.strHomeGoalDetails, "home"),
    ...parseGoalDetails(match.strAwayGoalDetails, "away"),
  ].filter((goal): goal is MatchGoal => Boolean(goal));

  return goals.length > 0 ? goals : undefined;
}

function normalizeScore(score: Match["score"] | undefined): Match["score"] {
  const fullTime = score?.fullTime ?? score;

  return {
    home: fullTime?.home ?? null,
    away: fullTime?.away ?? null,
    halfTime: score?.halfTime,
    fullTime: score?.fullTime ?? {
      home: fullTime?.home ?? null,
      away: fullTime?.away ?? null,
    },
    regularTime: score?.regularTime ?? fullTime,
    extraTime: score?.extraTime,
    penalties: score?.penalties,
    winner: score?.winner,
    duration: score?.duration,
  };
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
    score: normalizeScore(match.score),
    goals: normalizeGoals(match),
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
    const response = await fetch(apiUrl("/matches"), { cache: "no-store" });
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
