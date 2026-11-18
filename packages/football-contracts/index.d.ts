export type CompetitionId =
  | "world-cup"
  | "ucl"
  | "premier-league"
  | "la-liga"
  | "bundesliga";

export type FixtureStatus =
  | "live"
  | "upcoming"
  | "finished"
  | "postponed"
  | "suspended"
  | "cancelled"
  | "awarded"
  | "unknown";

export type Competition = {
  id: CompetitionId;
  name: string;
  shortName: string;
  region: string;
  season: string;
  format: string;
  accent: string;
  hasBracket: boolean;
  emblem?: string | null;
  currentMatchday?: number | null;
};

export type FootballTeam = {
  biography?: string | null;
  id: string;
  name: string;
  shortName: string;
  country: string;
  city: string;
  coach: string;
  founded: number | null;
  competitionIds: CompetitionId[];
  logoUrl: string;
  stadiumId: string;
  position: number | null;
  form: Array<"W" | "D" | "L">;
  stats: {
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goals: number;
    conceded: number;
    cleanSheets: number;
    xg: number | null;
    possession: number | null;
  };
};

export type FootballPlayer = {
  biography?: string | null;
  statisticsScope?: {competitionId:CompetitionId;season:number};
  id: string;
  name: string;
  teamId: string;
  nationality: string;
  position: "Goalkeeper" | "Defender" | "Midfielder" | "Forward" | null;
  shirtNumber: number | null;
  age: number | null;
  height: string;
  preferredFoot: "Left" | "Right" | null;
  imageUrl: string;
  stats: {
    appearances: number | null;
    minutes: number | null;
    goals: number | null;
    assists: number | null;
    shots: number | null;
    shotsOnTarget: number | null;
    passes: number | null;
    passAccuracy: number | null;
    tackles: number | null;
    cards: number | null;
  };
};

export type FootballMatch = {
  venueName?: string;
  id: string;
  competitionId: CompetitionId;
  season: string;
  homeTeamId: string;
  awayTeamId: string;
  stadiumId: string;
  status: FixtureStatus;
  kickoff: string;
  stage: string;
  matchday: string;
  minute?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  referee?: string | null;
  attendance?: number | null;
  summary?: string;
};

export type MatchEvent = {
  id: string;
  matchId: string;
  minute: string;
  type: "goal" | "yellow" | "red" | "substitution" | "var" | "period";
  teamId?: string;
  playerId?: string;
  label: string;
  detail?: string;
};

export type Lineup = {
  matchId: string;
  teamId: string;
  formation: string;
  coach: string;
  starters: string[];
  substitutes: string[];
};

export type MatchDetailsTeam = Pick<
  FootballTeam,
  "id" | "name" | "shortName" | "logoUrl"
> & {
  coach?: string;
};

export type MatchScorePair = { home: number | null; away: number | null };
export type MatchScore = {
  fullTime: MatchScorePair;
  halfTime: MatchScorePair;
  winner: string | null;
  duration: string | null;
};
export type MatchReferee = {
  id: number | null;
  name: string | null;
  type: string | null;
  nationality: string | null;
};
export type MatchVenue = {
  name: string | null;
  city: string | null;
  country: string | null;
  confirmed: boolean;
  source: "provider" | "database" | null;
};

export type MatchDetails = {
  /** Additive detail fields; optional for older consumers and saved responses. */
  score?: MatchScore;
  referees?: MatchReferee[];
  venue?: MatchVenue;
  videoUrl?: string | null;
  availability?: Record<string, Availability>;
  freshness?: { fetchedAt: string; stale: boolean };
  match: FootballMatch;
  competition: Competition;
  homeTeam: MatchDetailsTeam;
  awayTeam: MatchDetailsTeam;
  stadium: Pick<Stadium, "name" | "imageUrl"> & Partial<Stadium>;
  events: MatchEvent[];
  lineups: Lineup[];
  stats: MatchStat[];
  relatedNews: FootballNews[];
};

export type MatchStat = {
  label: string;
  home: number;
  away: number;
  suffix?: string;
};

export type Standing = {
  competitionId: CompetitionId;
  group?: string;
  teamId: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
};

export type Stadium = {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number | null;
  homeTeamId: string;
  imageUrl: string;
};

export type FootballNews = {
  sourceUrl?: string;
  sourceName?: string;
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  competitionId: CompetitionId;
  teamId?: string;
  category: string;
  publishedAt: string;
  imageUrl: string;
};

export type BracketRound = {
  name: string;
  matches: Array<{
    id: string;
    homeTeamId: string;
    awayTeamId: string;
    homeScore?: number;
    awayScore?: number;
    status: FixtureStatus;
    aggregate?: string;
  }>;
};

export type Availability = { state: "available" | "empty" | "unavailable" | "unsupported" | "stale" | "pending" | "not_applicable"; message?: string; fetchedAt?: string | null };
export type FootballSnapshot = { competitions: Competition[]; teams: FootballTeam[]; players: FootballPlayer[]; stadiums: Stadium[]; matches: FootballMatch[]; news: FootballNews[]; errors: Partial<Record<CompetitionId, string>>; availability: Record<string, Availability> };
export type DevicePreferences = { version: 1; teamIds: string[]; playerIds: string[]; competitionIds: string[]; matchIds: string[]; reminders: Record<string, number[]>; notifications: { enabled: boolean; kickoff30: boolean; kickoff10: boolean; finalScore: boolean } };
export type CatalogKind = "teams" | "players" | "stadiums";
export type DirectoryPage<T> = { items: T[]; total: number; page: number; pageSize: number; availability: Availability };

/** Four-digit starting year of a successfully imported competition season. */
export type Season = number;
