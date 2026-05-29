import { mockTournamentHistory } from "@/data/mock/history";
import type { TournamentHistory } from "@/types/history";

export async function getTournamentHistory(): Promise<TournamentHistory[]> {
  return mockTournamentHistory;
}
