import type {
  Competition,
  FootballMatch,
  FootballTeam,
  Standing,
} from "./football";

export type LeagueTeam = Pick<
  FootballTeam,
  "id" | "name" | "shortName" | "country" | "logoUrl" | "form"
>;
export type LeagueMatch = Omit<FootballMatch, "stadiumId"> & {
  homeTeam: LeagueTeam;
  awayTeam: LeagueTeam;
};
export type LeagueScorer = {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  goals: number;
  assists: number | null;
  playedMatches: number | null;
};
export type DataSection<T> =
  | { data: T; error: null }
  | { data: null; error: string };
export type PremierLeagueData = {
  competition: Competition;
  teams: Promise<DataSection<LeagueTeam[]>>;
  matches: Promise<DataSection<LeagueMatch[]>>;
  standings: Promise<DataSection<Standing[]>>;
  scorers: Promise<DataSection<LeagueScorer[]>>;
};

export type ProviderTeam = {
  id: number | null;
  name: string | null;
  shortName: string | null;
  tla: string | null;
  crest: string | null;
  area?: { name: string };
};
export type ProviderCompetition = {
  id: number;
  name: string;
  code: string;
  emblem: string | null;
  area: { name: string };
  currentSeason: {
    startDate: string;
    endDate: string;
    currentMatchday: number | null;
  };
};
export type ProviderMatch = {
  venue?: string | null;
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  stage: string;
  homeTeam: ProviderTeam;
  awayTeam: ProviderTeam;
  score: { fullTime: { home: number | null; away: number | null } };
  minute?: number | null;
  injuryTime?: number | null;
};

export type ProviderMatchDetails = ProviderMatch & {
  competition: { code: string; name: string; emblem: string | null };
  season: ProviderCompetition["currentSeason"];
  venue?: string | null;
  attendance?: number | null;
  referees?: Array<{ name: string; type: string }>;
  homeTeam: ProviderMatchTeam;
  awayTeam: ProviderMatchTeam;
};

type ProviderMatchTeam = ProviderTeam & {
  coach?: { name: string | null } | null;
  formation?: string | null;
  lineup?: Array<{ name: string; shirtNumber?: number | null }> | null;
  bench?: Array<{ name: string; shirtNumber?: number | null }> | null;
};
export type ProviderStanding = {
  position: number;
  team: ProviderTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
};
export type ProviderScorer = {
  player: { id: number; name: string };
  team: ProviderTeam;
  goals: number;
  assists: number | null;
  playedMatches: number | null;
};
