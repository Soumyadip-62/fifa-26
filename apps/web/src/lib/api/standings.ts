import { apiUrl } from "./config";

export type StandingsTeam = {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  sportsdb_team_id?: string | null;
  sportsdbTeamId?: string | null;
};

export type StandingsTableEntry = {
  position: number;
  team: StandingsTeam;
  playedGames: number;
  form: string | null;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
};

export type StandingsGroup = {
  stage: string;
  type: string;
  group: string;
  table: StandingsTableEntry[];
};

export type StandingsResponse = {
  filters: {
    season: string;
  };
  area: {
    id: number;
    name: string;
    code: string;
    flag: string | null;
  };
  competition: {
    id: number;
    name: string;
    code: string;
    type: string;
    emblem: string;
  };
  season: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
    winner: string | null;
  };
  standings: StandingsGroup[];
};

export async function getStandings(): Promise<StandingsResponse> {
  const response = await fetch(apiUrl("/points-table/standings"));
  if (!response.ok) {
    throw new Error("Failed to fetch standings");
  }
  return response.json();
}
