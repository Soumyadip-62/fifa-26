import { mockTeams } from "@/data/mock/teams";
import type { Player, Team } from "@/types/team";
import { apiUrl } from "./config";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type TeamResponse = {
  teams: Team[];
};
type PlayerResponse = {
  player: Player[];
};

function trimOptional(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed || undefined;
}

function trimNullable(value: string | null | undefined) {
  return trimOptional(value) ?? null;
}

function normalizeTeam(team: Team): Team {
  const name =
    trimOptional(team.name) ?? trimOptional(team.strTeam) ?? "Unknown Team";
  const country =
    trimOptional(team.country) ?? trimOptional(team.strCountry) ?? name;
  const fifaCode = trimOptional(team.fifa_code);
  const imageUrl = trimNullable(
    team.image_url ?? team.strBadge ?? team.strLogo,
  );
  const sportsdbTeamId = trimNullable(team.sportsdb_team_id ?? team.idTeam);

  return {
    ...team,
    id: trimOptional(team.id) ?? toSlug(name),
    name,
    country,
    name_normalised: trimOptional(team.name_normalised),
    continent: trimOptional(team.continent),
    flag_icon: trimOptional(team.flag_icon),
    flag_unicode: trimOptional(team.flag_unicode),
    fifa_code: fifaCode,
    group: trimOptional(team.group),
    confed: trimOptional(team.confed),
    image_url: imageUrl,
    logoUrl:
      trimOptional(team.logoUrl) ??
      trimOptional(team.strBadge) ??
      trimOptional(team.strLogo) ??
      imageUrl ??
      undefined,
    shortCode:
      trimOptional(team.shortCode) ??
      trimOptional(team.strTeamShort) ??
      fifaCode,
    sportsdb_team_id: sportsdbTeamId,
  };
}

function toOptionalNumber(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  const trimmed = trimOptional(value);
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizePlayer(player: Player): Player {
  const name =
    trimOptional(player.name) ??
    trimOptional(player.strPlayer) ??
    "Unknown Player";
  const position =
    trimOptional(player.position) ??
    trimOptional(player.strPosition) ??
    "Player";
  const shirtNumber =
    player.shirtNumber ?? toOptionalNumber(player.strNumber);

  return {
    ...player,
    id: trimOptional(player.id) ?? trimOptional(player.idPlayer) ?? toSlug(name),
    name,
    position,
    shirtNumber,
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
  try {
    const teamResponse = await fetch(apiUrl(`/teams/${teamId}`));
    if (!teamResponse.ok) {
      throw new Error("Failed to fetch team");
    }
    const data = (await teamResponse.json()) as TeamResponse;
    return data?.teams[0] ? normalizeTeam(data.teams[0]) : null;
  } catch {
    return null;
  }
}
export async function getTeamPlayersById(
  teamId: string,
): Promise<Player[] | null> {
  try {
    const playerResponse = await fetch(apiUrl(`/teams/${teamId}/players`));
    if (!playerResponse.ok) {
      throw new Error("Failed to fetch team players");
    }
    const data = (await playerResponse.json()) as PlayerResponse;

    return data?.player?.map(normalizePlayer) ?? null;
  } catch {
    return null;
  }
}
