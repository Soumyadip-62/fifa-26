export type TournamentHistory = {
  id: string;
  year: number;
  host: string;
  winner: string;
  runnerUp?: string;
  thirdPlace?: string;
  finalScore?: string;
  summary?: string;
};
