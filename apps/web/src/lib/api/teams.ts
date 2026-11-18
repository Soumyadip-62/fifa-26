import { apiUrl } from "./config";
import type { FootballSnapshot, FootballTeam } from "@/types/football";
import type { Player, Team } from "@/types/team";
import { isActiveCompetition } from "@/lib/competitions";
const legacy = (t: FootballTeam): Team => ({
  id: t.id,
  name: t.name,
  country: t.country,
  logoUrl: t.logoUrl,
  shortCode: t.shortName,
  coach: t.coach,
  stats: {
    played: t.stats.played,
    won: t.stats.wins,
    drawn: t.stats.draws,
    lost: t.stats.losses,
    goalsFor: t.stats.goals,
    goalsAgainst: t.stats.conceded,
  },
});
async function data(): Promise<FootballSnapshot> {
  const r = await fetch(apiUrl("/football/snapshot"), { cache: "no-store" });
  if (!r.ok) throw new Error("Team data unavailable.");
  return r.json();
}
export async function getTeams(): Promise<Team[]> {
  return (await data()).teams
    .filter((team) => team.competitionIds.some(isActiveCompetition))
    .map(legacy);
}
export async function getTeamById(id: string): Promise<Team | null> {
  const r = await fetch(apiUrl(`/football/teams/${encodeURIComponent(id)}`));
  if (r.status === 404) return null;
  if (!r.ok) throw new Error("Team unavailable.");
  return legacy((await r.json()).item);
}
export async function getTeamPlayersById(id: string): Promise<Player[]> {
  return (await data()).players
    .filter((p) => p.teamId === id)
    .map((p) => ({
      id: p.id,
      name: p.name,
      position: p.position ?? "Unavailable",
      shirtNumber: p.shirtNumber ?? undefined,
    }));
}
