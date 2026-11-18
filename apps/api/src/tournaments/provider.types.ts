export const TOURNAMENT_CODES = {
  'premier-league': 'PL',
  'la-liga': 'PD',
  ucl: 'CL',
  bundesliga: 'BL1',
} as const;

export type TournamentId = keyof typeof TOURNAMENT_CODES;
export interface ProviderTeam {
  id: number | null;
  name: string | null;
  shortName: string | null;
  tla: string | null;
  crest: string | null;
  area?: { name: string };
}
export interface ProviderSeason {
  startDate: string;
  endDate: string;
  currentMatchday: number | null;
}
export interface ProviderCompetition {
  id: number;
  name: string;
  code: string;
  emblem: string | null;
  area: { name: string };
  currentSeason: ProviderSeason;
  seasons?: ProviderSeason[];
}
export interface ProviderMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  stage: string;
  homeTeam: ProviderTeam;
  awayTeam: ProviderTeam;
  score: {
    fullTime: { home: number | null; away: number | null };
    [key: string]: unknown;
  };
  competition?: { code: string; name: string; emblem: string | null };
  season?: ProviderSeason;
  lastUpdated?: string;
  [key: string]: unknown;
}
export interface Freshness {
  fetchedAt: string;
  stale: boolean;
}
