import { mockTeams } from "@/data/mock/teams";
import type { Team } from "@/types/team";
import { apiUrl } from "./config";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function trimOptional(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed || undefined;
}

function trimNullable(value: string | null | undefined) {
  return trimOptional(value) ?? null;
}

function normalizeTeam(team: Team): Team {
  const name = team.name.trim();
  const fifaCode = trimOptional(team.fifa_code);
  const imageUrl = trimNullable(team.image_url);

  return {
    ...team,
    id: trimOptional(team.id) ?? toSlug(name),
    name,
    country: trimOptional(team.country) ?? name,
    name_normalised: trimOptional(team.name_normalised),
    continent: trimOptional(team.continent),
    flag_icon: trimOptional(team.flag_icon),
    flag_unicode: trimOptional(team.flag_unicode),
    fifa_code: fifaCode,
    group: trimOptional(team.group),
    confed: trimOptional(team.confed),
    image_url: imageUrl,
    logoUrl: trimOptional(team.logoUrl) ?? imageUrl ?? undefined,
    shortCode: trimOptional(team.shortCode) ?? fifaCode,
    sportsdb_team_id: trimNullable(team.sportsdb_team_id),
  };
}

export async function getTeams(): Promise<Team[]> {
  try {
    const response = await fetch(apiUrl("/teams"));
    if (!response.ok) {
      throw new Error("Failed to fetch teams");
    }
    const data = (await response.json()) as Team[];
    return data.map(normalizeTeam);
  } catch {
    return mockTeams;
  }
}

export async function getTeamById(teamId: string): Promise<Team | null> {
  return mockTeams.find((team) => team.id === teamId) ?? null;
}
