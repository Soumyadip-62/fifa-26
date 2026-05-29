export type Player = {
  id: string;
  name: string;
  position: string;
  shirtNumber?: number;
};

export type TeamStats = {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
};

export type Team = {
  id: string;
  name: string;
  country: string;
  name_normalised?: string;
  continent?: string;
  flag_icon?: string;
  flag_unicode?: string;
  fifa_code?: string;
  confed?: string;
  image_url?: string | null;
  sportsdb_team_id?: string | null;
  logoUrl?: string;
  flagUrl?: string;
  shortCode?: string;
  group?: string;
  coach?: string;
  fifaRanking?: number;
  stats?: TeamStats;
  players?: Player[];
};
