import { apiUrl } from "./config";

export type StandingsTeam = {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  sportsdb_team_id?: string | null;
  sportsdbTeamId?: string | null;
  qualification?: TeamQualification;
};

export type QualificationStage =
  | "ROUND_OF_32"
  | "ROUND_OF_16"
  | "QUARTER_FINALS"
  | "SEMI_FINALS"
  | "FINAL"
  | "WINNER";

export type TeamQualification = {
  stages: QualificationStage[];
  latestStage: QualificationStage | null;
  group: string | null;
  qualifiedAt: string | null;
  lastSyncedAt: string | null;
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
  qualification?: TeamQualification;
};

export type QualifiedTeam = {
  id: string;
  competitionCode: string;
  season: string;
  teamKey: string;
  footballDataTeamId: number | null;
  sportsdbTeamId: string | null;
  teamName: string;
  shortName: string | null;
  tla: string | null;
  crest: string | null;
  stage: QualificationStage;
  group: string | null;
  position: number | null;
  points: number | null;
  source: string | null;
  qualifiedAt: string;
  lastSyncedAt: string;
  metadata: Record<string, unknown> | null;
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
  qualificationSummary?: {
    season: string;
    qualifiedTeams: QualifiedTeam[];
    lastSyncedAt: string | null;
  };
};

export async function getStandings(): Promise<StandingsResponse> {
  const response = await fetch(apiUrl("/points-table/standings"));
  if (!response.ok) {
    throw new Error("Failed to fetch standings");
  }
  return response.json();
}
