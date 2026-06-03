import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export type WorldCupScoreLine = [number, number];

export type WorldCupMatchScore = {
  ft: WorldCupScoreLine;
  ht?: WorldCupScoreLine;
  et?: WorldCupScoreLine;
  p?: WorldCupScoreLine;
};

export type WorldCupGoal = {
  name: string;
  minute: number;
  offset?: number;
  owngoal?: boolean;
  penalty?: boolean;
};

export type WorldCupMatch = {
  num?: number;
  round: string;
  date: string;
  time?: string;
  team1: string;
  team2: string;
  score?: WorldCupMatchScore;
  goals1?: WorldCupGoal[];
  goals2?: WorldCupGoal[];
  group?: string;
  ground: string;
};

export type WorldCupByYear = {
  name: string;
  matches: WorldCupMatch[];
};

export type WorldCupTeamMeta = {
  name: string;
  name_normalised?: string;
  image_url?: string | null;
  sportsdb_team_id?: string | null;
};

export type WorldCupFinalTeam = {
  name: string;
  logoUrl: string | null;
  sportsdbTeamId: string | null;
};

export type WorldCupFinalMatchData = WorldCupMatch & {
  team1LogoUrl: string | null;
  team1SportsdbTeamId: string | null;
  team2LogoUrl: string | null;
  team2SportsdbTeamId: string | null;
  team1Details: WorldCupFinalTeam;
  team2Details: WorldCupFinalTeam;
};

export type WorldCupFinalMatch = {
  year: number;
  tournament: string;
  match: WorldCupFinalMatchData;
};

@Injectable()
export class HistoryService {
  private readonly history: WorldCupByYear[] = [];
  private readonly finals: WorldCupFinalMatch[] = [];
  private readonly teamsByName: Map<string, WorldCupTeamMeta>;

  constructor() {
    const worldCupByYearPath = join(
      process.cwd(),
      'fifa-data',
      'worldcup-by-year',
    );
    const teamsPath = join(process.cwd(), 'fifa-data', 'teams-data.json');

    this.teamsByName = this.createTeamsByNameMap(this.readTeams(teamsPath));
    this.history = this.readWorldCupHistory(worldCupByYearPath);
    this.finals = this.getFinalMatches(this.history);
  }

  getAllFinals() {
    return this.finals;
  }

  private readWorldCupHistory(basePath: string) {
    return readdirSync(basePath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => {
        const year = Number(entry.name);
        const filePath = join(basePath, entry.name, 'worldcup.json');

        return { filePath, year };
      })
      .filter(
        ({ filePath, year }) => Number.isFinite(year) && existsSync(filePath),
      )
      .sort((first, second) => first.year - second.year)
      .map(({ filePath }) => {
        return JSON.parse(readFileSync(filePath, 'utf8')) as WorldCupByYear;
      });
  }

  private readTeams(filePath: string) {
    return JSON.parse(readFileSync(filePath, 'utf8')) as WorldCupTeamMeta[];
  }

  private createTeamsByNameMap(teams: WorldCupTeamMeta[]) {
    const teamsByName = new Map<string, WorldCupTeamMeta>();

    teams.forEach((team) => {
      [team.name, team.name_normalised].forEach((name) => {
        if (name) {
          teamsByName.set(this.normalizeTeamName(name), team);
        }
      });
    });

    return teamsByName;
  }

  private getFinalMatches(history: WorldCupByYear[]) {
    return history.flatMap((worldCup) => {
      const year = this.getWorldCupYear(worldCup.name);

      return worldCup.matches
        .filter((match) => this.isFinalMatch(match))
        .map((match) => ({
          year,
          tournament: worldCup.name,
          match: this.enrichFinalMatch(match),
        }));
    });
  }

  private enrichFinalMatch(match: WorldCupMatch): WorldCupFinalMatchData {
    const team1Details = this.getFinalTeam(match.team1);
    const team2Details = this.getFinalTeam(match.team2);

    return {
      ...match,
      team1LogoUrl: team1Details.logoUrl,
      team1SportsdbTeamId: team1Details.sportsdbTeamId,
      team2LogoUrl: team2Details.logoUrl,
      team2SportsdbTeamId: team2Details.sportsdbTeamId,
      team1Details,
      team2Details,
    };
  }

  private getFinalTeam(teamName: string): WorldCupFinalTeam {
    const team = this.teamsByName.get(this.normalizeTeamName(teamName));

    return {
      name: teamName,
      logoUrl: team?.image_url ?? null,
      sportsdbTeamId: team?.sportsdb_team_id ?? null,
    };
  }

  private getWorldCupYear(name: string) {
    const year = Number(name.match(/\d{4}/)?.[0]);

    return Number.isFinite(year) ? year : 0;
  }

  private isFinalMatch(match: WorldCupMatch) {
    return match.round.toLowerCase().startsWith('final');
  }

  private normalizeTeamName(name: string) {
    return name
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/&/g, 'and')
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .toLowerCase();
  }
}
