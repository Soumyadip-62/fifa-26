import "server-only";
import { cache } from "react";
import { apiUrl } from "./config";
import { notFound } from "next/navigation";
import { activeCompetitionList, isActiveCompetition } from "@/lib/competitions";
import type {
  CompetitionId,
  FootballSnapshot,
  FootballNews,
  FootballTeam,
  FootballPlayer,
  Stadium,
  MatchDetails,
  Standing,
} from "@/types/football";
import type {
  PremierLeagueData,
  DataSection,
  LeagueMatch,
  LeagueScorer,
} from "@/types/premier-league";

export const footballRequest = cache(async <T>(path: string): Promise<T> => {
  const res = await fetch(apiUrl(`/football${path}`), {
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok)
    throw new Error(
      res.status === 404
        ? "Football record not found."
        : "Football data is temporarily unavailable.",
    );
  return res.json() as Promise<T>;
});
export const getSnapshot = cache(
  async (competition?: string, season?: string) => {
    if (competition && !isActiveCompetition(competition)) notFound();
    const q = new URLSearchParams();
    if (competition) q.set("competition", competition);
    if (season) q.set("season", season);
    const data = await footballRequest<FootballSnapshot>(`/snapshot?${q}`);
    const teams = data.teams
      .map((team) => ({
        ...team,
        competitionIds: activeCompetitionList(team.competitionIds),
      }))
      .filter((team) => team.competitionIds.length > 0);
    const teamIds = new Set(teams.map((team) => team.id));
    const matches = data.matches.filter((match) =>
      isActiveCompetition(match.competitionId),
    );
    const stadiumIds = new Set([
      ...teams.map((team) => team.stadiumId),
      ...matches.map((match) => match.stadiumId),
    ]);
    return {
      ...data,
      competitions: data.competitions.filter((item) =>
        isActiveCompetition(item.id),
      ),
      teams,
      players: data.players.filter((player) => teamIds.has(player.teamId)),
      stadiums: data.stadiums.filter((stadium) => stadiumIds.has(stadium.id)),
      matches,
      news: data.news.filter((article) =>
        isActiveCompetition(article.competitionId),
      ),
      errors: Object.fromEntries(
        Object.entries(data.errors).filter(([id]) => isActiveCompetition(id)),
      ),
      availability: Object.fromEntries(
        Object.entries(data.availability).filter(([id]) =>
          isActiveCompetition(id),
        ),
      ),
    } satisfies FootballSnapshot;
  },
);
export const getFootballData = cache(async () => {
  const [data, news] = await Promise.all([
    getSnapshot(),
    footballRequest<FootballNews[]>("/news")
      .then((items) =>
        items.filter((item) => isActiveCompetition(item.competitionId)),
      )
      .catch(() => []),
  ]);
  return { ...data, news };
});
export async function getCompetition(id: string) {
  return (await getSnapshot()).competitions.find((c) => c.id === id) ?? null;
}
async function section<T>(load: () => Promise<T>): Promise<DataSection<T>> {
  try {
    return { data: await load(), error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Football data is unavailable.",
    };
  }
}
export function resolveFixtures(data: FootballSnapshot) {
  return data.matches.map((match) => {
    const fallback = (id: string, side: "home" | "away") => ({
      id,
      name:
        (match as typeof match & { homeLabel?: string; awayLabel?: string })[
          side === "home" ? "homeLabel" : "awayLabel"
        ] || "Team to be confirmed",
      shortName: "TBC",
      logoUrl: "",
      country: "",
      form: [],
    });
    return {
      match,
      competition: data.competitions.find((c) => c.id === match.competitionId)!,
      homeTeam:
        data.teams.find((t) => t.id === match.homeTeamId) ??
        fallback(match.homeTeamId, "home"),
      awayTeam:
        data.teams.find((t) => t.id === match.awayTeamId) ??
        fallback(match.awayTeamId, "away"),
    };
  });
}
const leagueData = cache(
  async (
    id: Exclude<CompetitionId, "world-cup">,
    season?: string,
  ): Promise<PremierLeagueData> => {
    const snapshot = await getSnapshot(id, season);
    const competition = snapshot.competitions[0]!;
    if (snapshot.errors[id]) throw new Error(snapshot.errors[id]);
    const query = season ? `?season=${season}` : "";
    let teams: PremierLeagueData["teams"] | undefined,
      matches: PremierLeagueData["matches"] | undefined,
      standings: PremierLeagueData["standings"] | undefined,
      scorers: PremierLeagueData["scorers"] | undefined;
    return {
      competition,
      get teams() {
        return (teams ??= section(async () => snapshot.teams));
      },
      get matches() {
        return (matches ??= section(
          async () =>
            resolveFixtures(snapshot).map((r) => ({
              ...r.match,
              homeTeam: r.homeTeam,
              awayTeam: r.awayTeam,
            })) as LeagueMatch[],
        ));
      },
      get standings() {
        return (standings ??= section(
          async () =>
            (
              await footballRequest<{ rows: Standing[] }>(
                `/competitions/${id}/standings${query}`,
              )
            ).rows,
        ));
      },
      get scorers() {
        return (scorers ??= section(async () => {
          const result = await footballRequest<{
            players: Array<{
              id: string;
              teamId: string;
              player: { name: string };
              team: { name: string };
              goals: number;
              assists: number | null;
              playedMatches: number | null;
            }>;
          }>(`/competitions/${id}/scorers${query}`);
          return result.players.map((p) => ({
            id: p.id,
            name: p.player.name,
            teamId: p.teamId,
            teamName: p.team.name,
            goals: p.goals,
            assists: p.assists,
            playedMatches: p.playedMatches,
          })) as LeagueScorer[];
        }));
      },
    };
  },
);
export function getCompetitionData(
  id: Exclude<CompetitionId, "world-cup">,
  season?: string,
) {
  return leagueData(id, season);
}

export async function getPlatformMatch(
  id: string,
): Promise<MatchDetails | null> {
  try {
    const match = await footballRequest<MatchDetails>(
      `/matches/${encodeURIComponent(id)}`,
    );
    return isActiveCompetition(match.match.competitionId) ? match : null;
  } catch (e) {
    if (e instanceof Error && e.message === "Football record not found.")
      return null;
    throw e;
  }
}
async function profile<T>(kind: string, id: string): Promise<T | null> {
  try {
    const result = await footballRequest<{
      item: T;
      enrichment?: { data?: Record<string, string> };
    }>(`/${kind}/${encodeURIComponent(id)}`);
    const item = result.item as T & {
      biography?: string;
      imageUrl?: string;
      city?: string;
      capacity?: number | null;
    };
    const extra = result.enrichment?.data;
    if (extra) {
      item.biography = extra.strDescriptionEN || item.biography;
      item.imageUrl = extra.strCutout || extra.strThumb || item.imageUrl;
      item.city = extra.strLocation || item.city;
      const capacity = Number(extra.intCapacity);
      if (Number.isFinite(capacity) && capacity > 0) item.capacity = capacity;
    }
    return item;
  } catch (e) {
    if (e instanceof Error && e.message === "Football record not found.")
      return null;
    throw e;
  }
}
export async function getPlatformTeam(
  id: string,
  selectedCompetition?: string,
  season?: string,
) {
  const profileTeam = await profile<FootballTeam>("teams", id);
  if (!profileTeam) return null;
  profileTeam.competitionIds = activeCompetitionList(
    profileTeam.competitionIds,
  );
  if (!profileTeam.competitionIds.length) return null;
  const all = await getSnapshot();
  const competition =
    selectedCompetition &&
    profileTeam.competitionIds.includes(selectedCompetition as CompetitionId)
      ? selectedCompetition
      : (profileTeam.competitionIds.find((id) => id !== "ucl") ??
        profileTeam.competitionIds[0] ??
        "premier-league");
  const data = await getSnapshot(competition, season);
  if (data.errors[competition as CompetitionId])
    throw new Error("This competition season is unavailable.");
  const team = {
    ...profileTeam,
    ...data.teams.find((t) => t.id === profileTeam.id),
  };
  const news = await footballRequest<FootballNews[]>(
    `/news?competition=${competition}`,
  ).catch(() => []);
  return {
    team,
    players: data.players.filter((p) => p.teamId === team.id),
    matches: resolveFixtures(data).filter(
      (r) => r.match.homeTeamId === team.id || r.match.awayTeamId === team.id,
    ),
    fixtureErrors: data.errors,
    news: news.filter((n) =>
      `${n.title} ${n.excerpt}`
        .toLowerCase()
        .includes(team.shortName.toLowerCase()),
    ),
    selectedCompetition: competition,
    competitions: all.competitions.filter((c) =>
      profileTeam.competitionIds.includes(c.id),
    ),
  };
}
export async function getPlatformPlayer(id: string) {
  const player = await profile<FootballPlayer>("players", id);
  if (!player) return null;
  const data = await getFootballData(),
    team = data.teams.find((t) => t.id === player.teamId);
  if (!team) return null;
  return {
    player,
    team,
    matches: resolveFixtures(data)
      .filter(
        (r) => r.match.homeTeamId === team.id || r.match.awayTeamId === team.id,
      )
      .sort((a, b) => b.match.kickoff.localeCompare(a.match.kickoff))
      .slice(0, 4),
    fixtureErrors: data.errors,
  };
}
export async function getPlatformStadium(id: string) {
  const stadium = await profile<Stadium>("stadiums", id);
  if (!stadium) return null;
  const data = await getFootballData();
  if (!data.stadiums.some((item) => item.id === stadium.id)) return null;
  return {
    stadium,
    team: data.teams.find((t) => t.id === stadium.homeTeamId) ?? null,
    matches: resolveFixtures(data).filter(
      (r) =>
        r.match.stadiumId === stadium.id || r.match.venueName === stadium.name,
    ),
    fixtureErrors: data.errors,
  };
}
export async function getPlatformArticle(id: string) {
  try {
    const article = await footballRequest<FootballNews>(
      `/articles/${encodeURIComponent(id)}`,
    );
    return isActiveCompetition(article.competitionId) ? article : null;
  } catch (e) {
    if (e instanceof Error && e.message === "Football record not found.")
      return null;
    throw e;
  }
}
