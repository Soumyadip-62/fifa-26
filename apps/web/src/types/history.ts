export type GoalScorer = {
  name: string;
  minute: number;
  offset?: number;
  owngoal?: boolean;
  penalty?: boolean;
};

export type TournamentHistory = {
  id: string;
  year: number;
  host: string;
  winner: string;
  runnerUp?: string;
  thirdPlace?: string;
  finalScore?: string;
  summary?: string;
  winnerGoals?: GoalScorer[];
  runnerUpGoals?: GoalScorer[];
};
