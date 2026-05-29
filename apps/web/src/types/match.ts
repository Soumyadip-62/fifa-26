export type MatchStatus =
  | "scheduled"
  | "live"
  | "finished"
  | "postponed"
  | "cancelled";

export type MatchTeam = {
  id: string;
  name: string;
  logoUrl?: string;
  flagUrl?: string;
  shortCode?: string;
  country?: string;
};

export type MatchScore = {
  home: number | null;
  away: number | null;
};

export type Match = {
  id: string;
  matchNumber?: number;
  tournament: string;
  stage?: string;
  group?: string;
  date: string;
  venue?: string;
  venueImageUrl?: string;
  city?: string;
  status: MatchStatus;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  score: MatchScore;
};
