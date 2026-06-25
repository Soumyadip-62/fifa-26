import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Repository } from 'typeorm';
import { QualifiedTeamEntity } from './entities/qualified-team.entity';

type QualificationStage =
  | 'ROUND_OF_32'
  | 'ROUND_OF_16'
  | 'QUARTER_FINALS'
  | 'SEMI_FINALS'
  | 'FINAL'
  | 'WINNER';

type QualifiedTeamRecord = {
  id: string;
  competitionCode: string;
  season: string;
  teamKey: string;
  footballDataTeamId: number | null;
  sportsdbTeamId: string | null;
  teamName: string;
  shortName: string | null;
  tla: string | null;
  crest: string | null;
  stage: QualificationStage;
  group: string | null;
  position: number | null;
  points: number | null;
  source: string;
  qualifiedAt: Date;
  lastSyncedAt: Date;
  metadata: Record<string, unknown>;
};

const COMPETITION_CODE = 'WC';
const SEASON = '2026';
const STAGE_ORDER: QualificationStage[] = [
  'ROUND_OF_32',
  'ROUND_OF_16',
  'QUARTER_FINALS',
  'SEMI_FINALS',
  'FINAL',
  'WINNER',
];

const KNOCKOUT_STAGE_TO_QUALIFICATION: Record<string, QualificationStage> = {
  LAST_32: 'ROUND_OF_32',
  LAST_16: 'ROUND_OF_16',
  QUARTER_FINALS: 'QUARTER_FINALS',
  SEMI_FINALS: 'SEMI_FINALS',
  FINAL: 'FINAL',
};

const KNOCKOUT_WINNER_ADVANCES_TO: Record<string, QualificationStage> = {
  LAST_32: 'ROUND_OF_16',
  LAST_16: 'QUARTER_FINALS',
  QUARTER_FINALS: 'SEMI_FINALS',
  SEMI_FINALS: 'FINAL',
  FINAL: 'WINNER',
};

@Injectable()
export class PointsTableService {
  private readonly logger = new Logger(PointsTableService.name);
  private cache: any = null;
  private lastFetched = 0;
  private readonly CACHE_TTL = 60 * 1000; // 1 minute cache
  private teamsMap = new Map<string, string>();

  constructor(
    @InjectRepository(QualifiedTeamEntity)
    private readonly qualifiedTeamRepository: Repository<QualifiedTeamEntity>,
  ) {
    this.loadTeamsMap();
  }

  private loadTeamsMap() {
    try {
      const teamsPath = join(process.cwd(), 'fifa-data', 'teams-data.json');
      const teams = JSON.parse(readFileSync(teamsPath, 'utf8'));
      for (const team of teams) {
        const sportsdbId = team.sportsdb_team_id;
        if (sportsdbId) {
          if (team.name) {
            this.teamsMap.set(this.normalizeTeamName(team.name), sportsdbId);
          }
          if (team.name_normalised) {
            this.teamsMap.set(
              this.normalizeTeamName(team.name_normalised),
              sportsdbId,
            );
          }
          if (team.fifa_code) {
            this.teamsMap.set(team.fifa_code.toUpperCase(), sportsdbId);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load teams map in PointsTableService:', err);
    }
  }

  private normalizeTeamName(name: string): string {
    return name
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/&/g, 'and')
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .toLowerCase();
  }

  private getSportsdbId(team: any): string | null {
    if (!team) return null;
    if (team.name) {
      const id = this.teamsMap.get(this.normalizeTeamName(team.name));
      if (id) return id;
    }
    if (team.shortName) {
      const id = this.teamsMap.get(this.normalizeTeamName(team.shortName));
      if (id) return id;
    }
    if (team.tla) {
      const id = this.teamsMap.get(team.tla.toUpperCase());
      if (id) return id;
    }
    return null;
  }

  private enrichStandings(data: any): void {
    if (!data || !Array.isArray(data.standings)) return;
    for (const standing of data.standings) {
      if (standing && Array.isArray(standing.table)) {
        for (const entry of standing.table) {
          if (entry && entry.team) {
            const sportsdbId = this.getSportsdbId(entry.team);
            if (sportsdbId) {
              entry.team.sportsdb_team_id = sportsdbId;
              entry.team.sportsdbTeamId = sportsdbId;
            }
          }
        }
      }
    }
  }

  private teamKey(team: any): string {
    if (!team) return '';
    if (team.id) return `fd:${team.id}`;
    if (team.tla) return `tla:${team.tla}`;
    return `name:${this.normalizeTeamName(team.name || team.shortName || '')}`;
  }

  private toQualificationRecord(
    team: any,
    stage: QualificationStage,
    syncedAt: Date,
    source: string,
    metadata: Record<string, unknown> = {},
  ): QualifiedTeamRecord | null {
    const teamName = team?.name || team?.shortName;

    if (!teamName) {
      return null;
    }

    const teamKey = this.teamKey(team);
    const sportsdbTeamId = this.getSportsdbId(team);

    return {
      id: `${COMPETITION_CODE}:${SEASON}:${teamKey}:${stage}`,
      competitionCode: COMPETITION_CODE,
      season: SEASON,
      teamKey,
      footballDataTeamId: typeof team.id === 'number' ? team.id : null,
      sportsdbTeamId,
      teamName,
      shortName: team.shortName || null,
      tla: team.tla || null,
      crest: team.crest || null,
      stage,
      group: typeof metadata.group === 'string' ? metadata.group : null,
      position:
        typeof metadata.position === 'number' ? metadata.position : null,
      points: typeof metadata.points === 'number' ? metadata.points : null,
      source,
      qualifiedAt: syncedAt,
      lastSyncedAt: syncedAt,
      metadata,
    };
  }

  private addQualificationRecord(
    records: Map<string, QualifiedTeamRecord>,
    record: QualifiedTeamRecord | null,
  ) {
    if (!record) return;
    records.set(record.id, record);
  }

  private deriveGroupStageQualifications(
    standingsData: any,
    syncedAt: Date,
    records: Map<string, QualifiedTeamRecord>,
  ) {
    const groupStandings = Array.isArray(standingsData?.standings)
      ? standingsData.standings.filter((standing) =>
          /^Group\s+[A-L]$/i.test(standing?.group || ''),
        )
      : [];

    const completedGroups = groupStandings.filter(
      (standing) =>
        Array.isArray(standing.table) &&
        standing.table.length > 0 &&
        standing.table.every((entry) => entry.playedGames >= 3),
    );

    for (const standing of completedGroups) {
      for (const entry of standing.table.slice(0, 2)) {
        this.addQualificationRecord(
          records,
          this.toQualificationRecord(
            entry.team,
            'ROUND_OF_32',
            syncedAt,
            'group_top_two',
            {
              group: standing.group,
              position: entry.position,
              points: entry.points,
              goalDifference: entry.goalDifference,
              goalsFor: entry.goalsFor,
            },
          ),
        );
      }
    }

    if (completedGroups.length === groupStandings.length && groupStandings.length > 0) {
      const thirdPlaceTeams = completedGroups
        .map((standing) => {
          const entry = standing.table?.[2];
          return entry
            ? {
                standing,
                entry,
              }
            : null;
        })
        .filter(Boolean)
        .sort((a: any, b: any) => {
          if (b.entry.points !== a.entry.points) {
            return b.entry.points - a.entry.points;
          }
          if (b.entry.goalDifference !== a.entry.goalDifference) {
            return b.entry.goalDifference - a.entry.goalDifference;
          }
          if (b.entry.goalsFor !== a.entry.goalsFor) {
            return b.entry.goalsFor - a.entry.goalsFor;
          }
          return a.entry.team.name.localeCompare(b.entry.team.name);
        });

      for (const qualifier of thirdPlaceTeams.slice(0, 8) as any[]) {
        this.addQualificationRecord(
          records,
          this.toQualificationRecord(
            qualifier.entry.team,
            'ROUND_OF_32',
            syncedAt,
            'best_third_place',
            {
              group: qualifier.standing.group,
              position: qualifier.entry.position,
              points: qualifier.entry.points,
              goalDifference: qualifier.entry.goalDifference,
              goalsFor: qualifier.entry.goalsFor,
            },
          ),
        );
      }
    }
  }

  private getWinnerTeam(match: any): any | null {
    const winner = match?.score?.winner;

    if (winner === 'HOME_TEAM') return match.homeTeam;
    if (winner === 'AWAY_TEAM') return match.awayTeam;

    const homeScore = match?.score?.fullTime?.home;
    const awayScore = match?.score?.fullTime?.away;

    if (typeof homeScore !== 'number' || typeof awayScore !== 'number') {
      return null;
    }

    if (homeScore > awayScore) return match.homeTeam;
    if (awayScore > homeScore) return match.awayTeam;

    return null;
  }

  private deriveKnockoutQualifications(
    matchesData: any,
    syncedAt: Date,
    records: Map<string, QualifiedTeamRecord>,
  ) {
    const matches = Array.isArray(matchesData?.matches) ? matchesData.matches : [];

    for (const match of matches) {
      const participantStage = KNOCKOUT_STAGE_TO_QUALIFICATION[match.stage];

      if (participantStage) {
        for (const team of [match.homeTeam, match.awayTeam]) {
          this.addQualificationRecord(
            records,
            this.toQualificationRecord(
              team,
              participantStage,
              syncedAt,
              'knockout_fixture_participant',
              {
                matchId: match.id,
                stage: match.stage,
                status: match.status,
              },
            ),
          );
        }
      }

      if (match.status !== 'FINISHED') {
        continue;
      }

      const nextStage = KNOCKOUT_WINNER_ADVANCES_TO[match.stage];
      const winnerTeam = this.getWinnerTeam(match);

      if (nextStage && winnerTeam) {
        this.addQualificationRecord(
          records,
          this.toQualificationRecord(
            winnerTeam,
            nextStage,
            syncedAt,
            'knockout_winner',
            {
              matchId: match.id,
              stage: match.stage,
              status: match.status,
              score: match.score?.fullTime || null,
            },
          ),
        );
      }
    }
  }

  private deriveQualifiedTeams(
    standingsData: any,
    matchesData: any,
    syncedAt = new Date(),
  ): QualifiedTeamRecord[] {
    const records = new Map<string, QualifiedTeamRecord>();

    this.deriveGroupStageQualifications(standingsData, syncedAt, records);
    this.deriveKnockoutQualifications(matchesData, syncedAt, records);

    return [...records.values()];
  }

  private buildQualificationMap(records: QualifiedTeamEntity[]) {
    const map = new Map<string, any>();

    for (const record of records) {
      const stages = map.get(record.teamKey)?.stages || [];
      const nextStages = stages.includes(record.stage)
        ? stages
        : [...stages, record.stage];
      nextStages.sort(
        (a, b) =>
          STAGE_ORDER.indexOf(a as QualificationStage) -
          STAGE_ORDER.indexOf(b as QualificationStage),
      );

      map.set(record.teamKey, {
        stages: nextStages,
        latestStage: nextStages[nextStages.length - 1] || null,
        group: record.group,
        qualifiedAt: record.qualifiedAt,
        lastSyncedAt: record.lastSyncedAt,
      });
    }

    return map;
  }

  private async enrichStandingsWithQualifications(data: any) {
    if (!data || !Array.isArray(data.standings)) return;

    const records = await this.qualifiedTeamRepository.find({
      where: {
        competitionCode: COMPETITION_CODE,
        season: SEASON,
      },
    });
    const qualificationMap = this.buildQualificationMap(records);

    for (const standing of data.standings) {
      if (!Array.isArray(standing.table)) continue;

      for (const entry of standing.table) {
        const qualification = qualificationMap.get(this.teamKey(entry.team));
        entry.qualification = qualification || {
          stages: [],
          latestStage: null,
          group: null,
          qualifiedAt: null,
          lastSyncedAt: null,
        };
        entry.team.qualification = entry.qualification;
      }
    }

    data.qualificationSummary = {
      season: SEASON,
      qualifiedTeams: records,
      lastSyncedAt:
        records
          .map((record) => record.lastSyncedAt)
          .sort((a, b) => b.getTime() - a.getTime())[0] || null,
    };
  }

  private async fetchFootballData(path: string) {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;
    const response = await fetch(`https://api.football-data.org/v4${path}`, {
      headers: {
        'X-Auth-Token': apiKey || '',
      },
    });

    if (!response.ok) {
      throw new Error(`Football-data.org API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getStandings(): Promise<any> {
    const now = Date.now();
    if (this.cache && now - this.lastFetched < this.CACHE_TTL) {
      return this.cache;
    }

    try {
      const data = await this.fetchFootballData('/competitions/WC/standings');
      this.enrichStandings(data);
      await this.enrichStandingsWithQualifications(data);
      this.cache = data;
      this.lastFetched = now;
      return data;
    } catch (error) {
      console.error(
        'Error fetching standings from football-data.org API, falling back to local calculation:',
        error,
      );
      const data = this.calculateLocalStandings();
      try {
        await this.enrichStandingsWithQualifications(data);
      } catch (qualificationError) {
        this.logger.warn(
          `Could not enrich local standings with qualifications: ${qualificationError}`,
        );
      }
      return data;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async syncQualifiedTeamsCron() {
    await this.syncQualifiedTeams();
  }

  async syncQualifiedTeams() {
    this.logger.log('Syncing qualified teams...');

    const [standingsData, matchesData] = await Promise.all([
      this.fetchFootballData('/competitions/WC/standings'),
      this.fetchFootballData('/competitions/WC/matches?season=2026'),
    ]);

    this.enrichStandings(standingsData);

    const syncedAt = new Date();
    const records = this.deriveQualifiedTeams(
      standingsData,
      matchesData,
      syncedAt,
    );

    await this.qualifiedTeamRepository.delete({
      competitionCode: COMPETITION_CODE,
      season: SEASON,
    });

    if (records.length > 0) {
      await this.qualifiedTeamRepository.save(records);
    }

    this.cache = null;
    this.lastFetched = 0;

    return {
      season: SEASON,
      syncedAt,
      qualifiedTeams: records,
      count: records.length,
    };
  }

  async getQualifiedTeams() {
    return this.qualifiedTeamRepository.find({
      where: {
        competitionCode: COMPETITION_CODE,
        season: SEASON,
      },
      order: {
        stage: 'ASC',
        teamName: 'ASC',
      },
    });
  }

  private calculateLocalStandings(): any {
    try {
      const teamsPath = join(process.cwd(), 'fifa-data', 'teams-data.json');
      const teams = JSON.parse(readFileSync(teamsPath, 'utf8'));

      const schedulePath = join(
        process.cwd(),
        'fifa-data',
        'group-stage-schedule.json',
      );
      const schedule = JSON.parse(readFileSync(schedulePath, 'utf8'));

      // Group teams by their group field (A-L)
      const groups: Record<string, any[]> = {};
      teams.forEach((team: any) => {
        const groupLetter = team.group;
        if (groupLetter) {
          const groupName = `Group ${groupLetter}`;
          if (!groups[groupName]) {
            groups[groupName] = [];
          }
          groups[groupName].push({
            team: {
              id:
                parseInt(team.sportsdb_team_id) ||
                Math.floor(Math.random() * 10000),
              name: team.name,
              shortName: team.name,
              tla: team.fifa_code || team.name.slice(0, 3).toUpperCase(),
              crest: team.image_url || '',
              sportsdb_team_id: team.sportsdb_team_id || null,
              sportsdbTeamId: team.sportsdb_team_id || null,
            },
            playedGames: 0,
            form: null,
            won: 0,
            draw: 0,
            lost: 0,
            points: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
          });
        }
      });

      // Calculate table stats from matches
      const matches = schedule.matches || [];
      matches.forEach((match: any) => {
        // Only count finished group stage matches
        const isGroupStage = match.stage === 'Group Stage' || match.group;
        const isFinished = match.status === 'finished';
        const hasScore =
          match.score && match.score.home !== null && match.score.away !== null;

        if (isGroupStage && isFinished && hasScore && match.group) {
          const groupName = `Group ${match.group}`;
          const groupTable = groups[groupName];

          if (groupTable) {
            const homeTeamEntry = groupTable.find(
              (entry) =>
                entry.team.name.toLowerCase() === match.homeTeam.toLowerCase(),
            );
            const awayTeamEntry = groupTable.find(
              (entry) =>
                entry.team.name.toLowerCase() === match.awayTeam.toLowerCase(),
            );

            if (homeTeamEntry && awayTeamEntry) {
              const homeScore = match.score.home;
              const awayScore = match.score.away;

              homeTeamEntry.playedGames += 1;
              awayTeamEntry.playedGames += 1;

              homeTeamEntry.goalsFor += homeScore;
              homeTeamEntry.goalsAgainst += awayScore;

              awayTeamEntry.goalsFor += awayScore;
              awayTeamEntry.goalsAgainst += homeScore;

              if (homeScore > awayScore) {
                homeTeamEntry.won += 1;
                homeTeamEntry.points += 3;
                awayTeamEntry.lost += 1;
              } else if (homeScore < awayScore) {
                awayTeamEntry.won += 1;
                awayTeamEntry.points += 3;
                homeTeamEntry.lost += 1;
              } else {
                homeTeamEntry.draw += 1;
                homeTeamEntry.points += 1;
                awayTeamEntry.draw += 1;
                awayTeamEntry.points += 1;
              }
            }
          }
        }
      });

      // Finalize and sort standings in each group
      const standings = Object.keys(groups)
        .sort()
        .map((groupName) => {
          const table = groups[groupName];

          table.forEach((entry) => {
            entry.goalDifference = entry.goalsFor - entry.goalsAgainst;
          });

          // Sort by points desc -> goalDifference desc -> goalsFor desc -> name asc
          table.sort((a, b) => {
            if (b.points !== a.points) {
              return b.points - a.points;
            }
            if (b.goalDifference !== a.goalDifference) {
              return b.goalDifference - a.goalDifference;
            }
            if (b.goalsFor !== a.goalsFor) {
              return b.goalsFor - a.goalsFor;
            }
            return a.team.name.localeCompare(b.team.name);
          });

          // Add positions
          table.forEach((entry, index) => {
            entry.position = index + 1;
          });

          return {
            stage: 'ALL',
            type: 'TOTAL',
            group: groupName,
            table,
          };
        });

      return {
        filters: { season: '2026' },
        area: { id: 2267, name: 'World', code: 'INT', flag: null },
        competition: {
          id: 2000,
          name: 'FIFA World Cup',
          code: 'WC',
          type: 'CUP',
          emblem: 'https://crests.football-data.org/wm26.png',
        },
        season: {
          id: 2398,
          startDate: '2026-06-11',
          endDate: '2026-07-19',
          currentMatchday: 1,
          winner: null,
        },
        standings,
      };
    } catch (err) {
      console.error('Failed to calculate local standings:', err);
      return {
        filters: { season: '2026' },
        standings: [],
      };
    }
  }
}
