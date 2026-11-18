import type {
  Competition,
  FixtureStatus,
  MatchDetails,
  Standing,
} from "@/types/football";
import type {
  LeagueMatch,
  LeagueScorer,
  LeagueTeam,
  ProviderCompetition,
  ProviderMatch,
  ProviderMatchDetails,
  ProviderScorer,
  ProviderStanding,
  ProviderTeam,
} from "@/types/premier-league";

const statuses: Record<string, FixtureStatus> = {
  SCHEDULED: "upcoming",
  TIMED: "upcoming",
  IN_PLAY: "live",
  PAUSED: "live",
  FINISHED: "finished",
  POSTPONED: "postponed",
  SUSPENDED: "suspended",
  CANCELLED: "cancelled",
  AWARDED: "awarded",
};

export function mapCompetition(
  raw: ProviderCompetition,
  leagueId:
    | "premier-league"
    | "la-liga"
    | "ucl"
    | "bundesliga" = "premier-league",
): Competition {
  const startYear = Number(raw.currentSeason.startDate.slice(0, 4));
  const endYear = Number(raw.currentSeason.endDate.slice(0, 4));
  if (
    !Number.isInteger(startYear) ||
    !Number.isInteger(endYear) ||
    startYear < 1800 ||
    endYear < startYear
  ) {
    throw new Error("Invalid season metadata");
  }
  return {
    id: leagueId,
    name: leagueId === "la-liga" ? "La Liga" : raw.name,
    shortName:
      leagueId === "bundesliga"
        ? "Bundesliga"
        : leagueId === "ucl"
          ? "UCL"
          : leagueId === "la-liga"
            ? "La Liga"
            : "Premier League",
    region: raw.area.name,
    season: `${startYear}/${String(endYear).slice(-2)}`,
    format: leagueId === "ucl" ? "League phase + knockout" : "League",
    accent:
      leagueId === "bundesliga"
        ? "amber"
        : leagueId === "ucl"
          ? "blue"
          : leagueId === "la-liga"
            ? "orange"
            : "violet",
    hasBracket: leagueId === "ucl",
    emblem: raw.emblem,
    currentMatchday: raw.currentSeason.currentMatchday,
  };
}

export function mapTeam(raw: ProviderTeam, country = "England"): LeagueTeam {
  return {
    id: String(raw.id),
    name: raw.name ?? "Team to be confirmed",
    shortName: raw.shortName ?? raw.tla ?? raw.name ?? "TBC",
    country: raw.area?.name ?? country,
    logoUrl: raw.crest ?? "",
    form: [],
  };
}

export function mapMatches(
  raw: ProviderMatch[],
  season: string,
  leagueId:
    | "premier-league"
    | "la-liga"
    | "ucl"
    | "bundesliga" = "premier-league",
): LeagueMatch[] {
  return raw.map((match) => ({
    id: String(match.id),
    competitionId: leagueId,
    season,
    homeTeamId:
      match.homeTeam.id == null
        ? `tbc-${match.id}-home`
        : String(match.homeTeam.id),
    awayTeamId:
      match.awayTeam.id == null
        ? `tbc-${match.id}-away`
        : String(match.awayTeam.id),
    venueName: match.venue ?? undefined,
    homeTeam: {
      ...mapTeam(
        match.homeTeam,
        leagueId === "bundesliga"
          ? "Germany"
          : leagueId === "ucl"
            ? "Europe"
            : leagueId === "la-liga"
              ? "Spain"
              : "England",
      ),
      id:
        match.homeTeam.id == null
          ? `tbc-${match.id}-home`
          : String(match.homeTeam.id),
    },
    awayTeam: {
      ...mapTeam(
        match.awayTeam,
        leagueId === "bundesliga"
          ? "Germany"
          : leagueId === "ucl"
            ? "Europe"
            : leagueId === "la-liga"
              ? "Spain"
              : "England",
      ),
      id:
        match.awayTeam.id == null
          ? `tbc-${match.id}-away`
          : String(match.awayTeam.id),
    },
    kickoff: match.utcDate,
    status: statuses[match.status] ?? "unknown",
    stage: match.stage,
    matchday:
      match.matchday == null
        ? "Round unavailable"
        : `Matchday ${match.matchday}`,
    homeScore: match.score.fullTime.home,
    awayScore: match.score.fullTime.away,
    minute:
      match.status === "PAUSED"
        ? "Half-time"
        : match.minute == null
          ? undefined
          : `${match.minute}${match.injuryTime ? `+${match.injuryTime}` : ""}'`,
  }));
}

export function mapMatchDetails(raw: ProviderMatchDetails): MatchDetails {
  const leagueId =
    raw.competition.code === "BL1"
      ? "bundesliga"
      : raw.competition.code === "CL"
        ? "ucl"
        : raw.competition.code === "PD"
          ? "la-liga"
          : "premier-league";
  const country =
    leagueId === "bundesliga"
      ? "Germany"
      : leagueId === "ucl"
        ? "Europe"
        : leagueId === "la-liga"
          ? "Spain"
          : "England";
  const competition = mapCompetition(
    {
      id:
        leagueId === "bundesliga"
          ? 2002
          : leagueId === "ucl"
            ? 2001
            : leagueId === "la-liga"
              ? 2014
              : 2021,
      ...raw.competition,
      area: { name: country },
      currentSeason: raw.season,
    },
    leagueId,
  );
  const [fixture] = mapMatches([raw], competition.season, leagueId);
  const stadiumId = `match-${raw.id}-venue`;
  const teams = [raw.homeTeam, raw.awayTeam];
  return {
    match: {
      ...fixture!,
      stadiumId,
      attendance: raw.attendance ?? undefined,
      referee: raw.referees?.find((referee) => referee.type === "REFEREE")
        ?.name,
    },
    competition,
    homeTeam: {
      ...mapTeam(raw.homeTeam, country),
      coach: raw.homeTeam.coach?.name ?? undefined,
    },
    awayTeam: {
      ...mapTeam(raw.awayTeam, country),
      coach: raw.awayTeam.coach?.name ?? undefined,
    },
    stadium: {
      name: raw.venue || "Venue to be confirmed",
      imageUrl: "/assets/images/stadiums/default-stadium.svg",
    },
    lineups: teams
      .filter((team) => team.lineup?.length)
      .map((team) => ({
        matchId: String(raw.id),
        teamId: String(team.id),
        formation: team.formation || "Not available",
        coach: team.coach?.name || "Not available",
        starters: team.lineup!.map(
          (player) =>
            `${player.shirtNumber == null ? "" : `${player.shirtNumber}. `}${player.name}`,
        ),
        substitutes: (team.bench ?? []).map(
          (player) =>
            `${player.shirtNumber == null ? "" : `${player.shirtNumber}. `}${player.name}`,
        ),
      })),
    events: [],
    stats: [],
    relatedNews: [],
  };
}

export function mapStandings(
  rows: ProviderStanding[],
  leagueId:
    | "premier-league"
    | "la-liga"
    | "ucl"
    | "bundesliga" = "premier-league",
): Standing[] {
  return rows
    .map((row) => ({
      competitionId: leagueId,
      teamId: String(row.team.id),
      position: row.position,
      played: row.playedGames,
      won: row.won,
      drawn: row.draw,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      points: row.points,
    }))
    .sort((a, b) => a.position - b.position);
}

export function mapScorers(rows: ProviderScorer[]): LeagueScorer[] {
  return rows
    .map((row) => ({
      id: String(row.player.id),
      name: row.player.name,
      teamId: String(row.team.id),
      teamName: row.team.shortName ?? row.team.name ?? "Team to be confirmed",
      goals: row.goals,
      assists: row.assists ?? null,
      playedMatches: row.playedMatches ?? null,
    }))
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5);
}

export function withForm(
  teams: LeagueTeam[],
  matches: LeagueMatch[],
): LeagueTeam[] {
  const finished = matches
    .filter(
      (match) =>
        match.status === "finished" &&
        match.homeScore != null &&
        match.awayScore != null,
    )
    .sort((a, b) => Date.parse(b.kickoff) - Date.parse(a.kickoff));
  return teams.map((team) => ({
    ...team,
    form: finished
      .filter(
        (match) => match.homeTeamId === team.id || match.awayTeamId === team.id,
      )
      .slice(0, 5)
      .reverse()
      .map((match) => {
        const home = match.homeTeamId === team.id;
        const own = home ? match.homeScore! : match.awayScore!;
        const opponent = home ? match.awayScore! : match.homeScore!;
        return own === opponent ? "D" : own > opponent ? "W" : "L";
      }),
  }));
}

export function selectFixtures(matches: LeagueMatch[], now = Date.now()) {
  return matches
    .filter(
      (match) =>
        match.status === "upcoming" && Date.parse(match.kickoff) >= now,
    )
    .sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff))
    .slice(0, 3);
}

export function selectResults(matches: LeagueMatch[]) {
  return matches
    .filter((match) => match.status === "finished")
    .sort((a, b) => Date.parse(b.kickoff) - Date.parse(a.kickoff))
    .slice(0, 3);
}
