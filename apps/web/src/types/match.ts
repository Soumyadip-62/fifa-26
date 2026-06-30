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
  teamID?: string;
};

export type MatchScore = {
  home: number | null;
  away: number | null;
  halfTime?: {
    home: number | null;
    away: number | null;
  };
  fullTime?: {
    home: number | null;
    away: number | null;
  };
  regularTime?: {
    home: number | null;
    away: number | null;
  };
  extraTime?: {
    home: number | null;
    away: number | null;
  };
  penalties?: {
    home: number | null;
    away: number | null;
  };
  winner?: string | null;
  duration?: string | null;
};

export type MatchGoal = {
  name: string;
  team?: "home" | "away";
  minute?: number | string | null;
  type?: string | null;
  penalty?: boolean;
  ownGoal?: boolean;
};

export type Match = {
  id: string;
  matchNumber?: number;
  tournament: string;
  stage?: string;
  group?: string;
  date: string;
  dateUtc?: string;
  time?: string;
  timeUtc?: string;
  timezone?: string;
  timestampUtc?: string;
  venue?: string;
  venueImageUrl?: string;
  city?: string;
  status: MatchStatus;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  score: MatchScore;
  goals?: MatchGoal[];
  youtubeVideoId?: string;
};
