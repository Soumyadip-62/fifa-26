import type { CompetitionId } from "@/types/football";

// World Cup records remain stored while only club competitions are published.
export const activeCompetitionIds = [
  "premier-league",
  "la-liga",
  "ucl",
  "bundesliga",
] as const;

export type ActiveCompetitionId = (typeof activeCompetitionIds)[number];

export function isActiveCompetition(id: string): id is ActiveCompetitionId {
  return (activeCompetitionIds as readonly string[]).includes(id);
}

export function activeCompetitionList(ids: CompetitionId[]) {
  return ids.filter(isActiveCompetition);
}
