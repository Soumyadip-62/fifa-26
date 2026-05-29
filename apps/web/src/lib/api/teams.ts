import { mockTeams } from "@/data/mock/teams";
import type { Team } from "@/types/team";

export async function getTeams(): Promise<Team[]> {
  return mockTeams;
}

export async function getTeamById(teamId: string): Promise<Team | null> {
  return mockTeams.find((team) => team.id === teamId) ?? null;
}
