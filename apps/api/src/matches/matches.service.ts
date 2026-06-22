import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MatchEntity } from './entities/matches.entity';
import { Repository } from 'typeorm';

type MatchVenue = {
  city: string;
  stadium: string;
  country?: string | null;
};

type MatchLeague = {
  id: string | null;
  name: string | null;
  badgeUrl: string | null;
  sport: string | null;
};

type MatchScore = {
  home: number | null;
  away: number | null;
};

export type GroupStageMatch = {
  id: string;
  matchNumber: number;
  stage: string;
  group: string;
  matchday: number;
  date: string;
  time: string;
  timezone: string;
  homeTeam: string;
  awayTeam: string;
  venue: MatchVenue;
  status: string;
  season?: string | null;
  league?: MatchLeague | null;
  eventName?: string | null;
  eventAlternateName?: string | null;
  sportsDbEventId?: string | null;
  sportsDbHomeTeamId?: string | null;
  sportsDbAwayTeamId?: string | null;
  homeTeamBadgeUrl?: string | null;
  awayTeamBadgeUrl?: string | null;
  score?: MatchScore;
  timestampUtc?: string | null;
  dateUtc?: string | null;
  timeUtc?: string | null;
  statusCode?: string | null;
  isPostponed?: boolean;
  thumbnailUrl?: string | null;
  posterUrl?: string | null;
  videoUrl?: string | null;
  sourceFilename?: string | null;
  referees?: any[] | null;
  footballDataorgHomeTeamId?: number | null;
  footballDataorgAwayTeamId?: number | null;
};

type GroupStageSchedule = {
  matches: GroupStageMatch[];
};

function mapApiStatus(status: string): string {
  switch (status.toUpperCase()) {
    case 'FINISHED':
      return 'finished';
    case 'IN_PLAY':
    case 'PAUSED':
    case 'LIVE':
      return 'live';
    case 'POSTPONED':
      return 'postponed';
    case 'CANCELLED':
      return 'cancelled';
    case 'TIMED':
    case 'SCHEDULED':
    default:
      return 'scheduled';
  }
}

function mapApiStage(stage: string): string {
  switch (stage.toUpperCase()) {
    case 'GROUP_STAGE':
      return 'Group Stage';
    case 'ROUND_OF_16':
      return 'Round of 16';
    case 'QUARTER_FINALS':
      return 'Quarter-finals';
    case 'SEMI_FINALS':
      return 'Semi-finals';
    case 'THIRD_PLACE':
      return 'Play-off for third place';
    case 'FINAL':
      return 'Final';
    default:
      return stage;
  }
}

function mapFootballDataMatchToGroupStage(
  apiMatch: any,
  localMatches: GroupStageMatch[],
  index: number,
): GroupStageMatch {
  const normalizeTeamName = (name: string | null | undefined) =>
    name ? name.toLowerCase().replace(/[^a-z0-9]/g, '') : '';

  const localMatch = localMatches.find((m) => {
    const localHome = normalizeTeamName(m.homeTeam);
    const localAway = normalizeTeamName(m.awayTeam);
    const apiHomeName = apiMatch.homeTeam?.name
      ? normalizeTeamName(apiMatch.homeTeam.name)
      : '';
    const apiAwayName = apiMatch.awayTeam?.name
      ? normalizeTeamName(apiMatch.awayTeam.name)
      : '';
    const apiHomeShort = apiMatch.homeTeam?.shortName
      ? normalizeTeamName(apiMatch.homeTeam.shortName)
      : '';
    const apiAwayShort = apiMatch.awayTeam?.shortName
      ? normalizeTeamName(apiMatch.awayTeam.shortName)
      : '';

    return (
      localHome &&
      localAway &&
      apiHomeName &&
      apiAwayName &&
      (localHome === apiHomeName || localHome === apiHomeShort) &&
      (localAway === apiAwayName || localAway === apiAwayShort)
    );
  });

  const utcDate = apiMatch.utcDate || '';
  const dateStr = utcDate.split('T')[0] || '';
  const timeStr = utcDate.split('T')[1]?.substring(0, 5) || '';

  let group = apiMatch.group || '';
  if (group.startsWith('GROUP_')) {
    group = group.replace('GROUP_', '');
  }

  const scoreHome = apiMatch.score?.fullTime?.home;
  const scoreAway = apiMatch.score?.fullTime?.away;

  return {
    id: apiMatch.id.toString(),
    matchNumber: localMatch ? localMatch.matchNumber : index + 1,
    stage: mapApiStage(apiMatch.stage || ''),
    group,
    matchday: apiMatch.matchday || 1,
    date: dateStr,
    time: timeStr,
    timezone: 'UTC',
    homeTeam: apiMatch.homeTeam?.name || 'TBD',
    awayTeam: apiMatch.awayTeam?.name || 'TBD',
    venue: localMatch
      ? localMatch.venue
      : {
          city: 'TBD',
          stadium: apiMatch.venue || 'Venue TBD',
        },
    status: mapApiStatus(apiMatch.status || ''),
    season: '2026',
    league: localMatch ? localMatch.league : null,
    eventName: localMatch ? localMatch.eventName : null,
    eventAlternateName: localMatch ? localMatch.eventAlternateName : null,
    sportsDbEventId: localMatch ? localMatch.sportsDbEventId : null,
    sportsDbHomeTeamId: localMatch ? localMatch.sportsDbHomeTeamId : null,
    sportsDbAwayTeamId: localMatch ? localMatch.sportsDbAwayTeamId : null,
    homeTeamBadgeUrl:
      localMatch?.homeTeamBadgeUrl || apiMatch.homeTeam?.crest || null,
    awayTeamBadgeUrl:
      localMatch?.awayTeamBadgeUrl || apiMatch.awayTeam?.crest || null,
    score: {
      home: typeof scoreHome === 'number' ? scoreHome : null,
      away: typeof scoreAway === 'number' ? scoreAway : null,
    },
    timestampUtc: utcDate,
    dateUtc: dateStr,
    timeUtc: timeStr,
    statusCode: apiMatch.status,
    isPostponed: apiMatch.status === 'POSTPONED',
    thumbnailUrl: localMatch ? localMatch.thumbnailUrl : null,
    posterUrl: localMatch ? localMatch.posterUrl : null,
    videoUrl: localMatch ? localMatch.videoUrl : null,
    sourceFilename: localMatch
      ? localMatch.sourceFilename
      : 'api.football-data.org',
  };
}

@Injectable()
export class MatchesService {
  private readonly matches: GroupStageMatch[];
  private readonly qualifierMatches: GroupStageMatch[];
  private fetchedMatches: GroupStageMatch[] = [];
  private lastFetchedTime = 0;
  private readonly CACHE_TTL_MS = 60 * 1000; // 1 minute cache

  @InjectRepository(MatchEntity)
  private readonly matchRepository: Repository<MatchEntity>;

  constructor() {
    const schedulePath = join(
      process.cwd(),
      'fifa-data',
      'group-stage-schedule.json',
    );
    const schedule = JSON.parse(
      readFileSync(schedulePath, 'utf8'),
    ) as GroupStageSchedule;

    const qualifierMatchesPath = join(
      process.cwd(),
      'fifa-data',
      'qualifier-matches-schedule.json',
    );
    const qualifierMatches = JSON.parse(
      readFileSync(qualifierMatchesPath, 'utf8'),
    ) as GroupStageSchedule;

    this.matches = schedule.matches;
    this.qualifierMatches = qualifierMatches.matches;
  }

  async findAll(): Promise<GroupStageMatch[]> {
    const now = Date.now();
    if (
      this.fetchedMatches.length > 0 &&
      now - this.lastFetchedTime < this.CACHE_TTL_MS
    ) {
      return this.fetchedMatches;
    }

    try {
      const dbMatches = await this.matchRepository.find({
        order: { matchNumber: 'ASC' },
      });
      this.fetchedMatches = dbMatches as GroupStageMatch[];
      return dbMatches as any;
    } catch (error) {
      console.error(
        'Error fetching matches from football-data.org API, falling back to local data:',
        error,
      );
      return this.fetchedMatches.length > 0
        ? this.fetchedMatches
        : this.matches;
    }
  }

  findAllQualifierMatches() {
    return this.qualifierMatches;
  }

  async findOne(matchId: string) {
    if (this.fetchedMatches.length === 0) {
      await this.findAll();
    }

    const match = this.fetchedMatches.find(
      ({ id, matchNumber }) =>
        id === matchId || matchNumber.toString() === matchId,
    );

    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    return match;
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async syncMatchesToDb() {
    console.log('Syncing matches to database...');
    const existingMatches = await this.matchRepository.find({
      select: {
        id: true,
        isNotified: true,
        status: true,
      },
    });
    const isNotifiedMap = new Map<string, boolean>();
    const existingStatusMap = new Map<string, string>();
    existingMatches.forEach((m) => {
      isNotifiedMap.set(m.id, m.isNotified);
      existingStatusMap.set(m.id, m.status);
    });

    try {
      const apiKey = process.env.FOOTBALL_DATA_API_KEY;
      const response = await fetch(
        'https://api.football-data.org/v4/competitions/WC/matches?season=2026',
        {
          headers: {
            'X-Auth-Token': apiKey || '',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Football-data.org API error: ${response.statusText}`);
      }

      const data = await response.json();
      const apiMatches = data.matches || [];

      const teamsDataPath = join(process.cwd(), 'fifa-data', 'teams-data.json');
      let teamsData: any[] = [];
      try {
        teamsData = JSON.parse(readFileSync(teamsDataPath, 'utf8'));
      } catch (e) {
        console.error('Could not read teams-data.json', e);
      }
      const mapStatus = (apiStatus: string | undefined): string => {
        if (!apiStatus) return 'scheduled';
        switch (apiStatus.toUpperCase()) {
          case 'IN_PLAY':
          case 'PAUSED':
            return 'live';
          case 'FINISHED':
          case 'AWARDED':
            return 'finished';
          case 'POSTPONED':
          case 'SUSPENDED':
            return 'postponed';
          case 'CANCELED':
          case 'CANCELLED':
            return 'cancelled';
          case 'SCHEDULED':
          case 'TIMED':
          default:
            return 'scheduled';
        }
      };

      const mappedMatches = apiMatches.map((m: any) => {
        const homeName = m.homeTeam?.name;
        const homeShort = m.homeTeam?.shortName;
        const homeTla = m.homeTeam?.tla;
        const awayName = m.awayTeam?.name;
        const awayShort = m.awayTeam?.shortName;
        const awayTla = m.awayTeam?.tla;

        const homeTeamData = teamsData.find(
          (t) =>
            t.name === homeName ||
            t.name_normalised === homeName ||
            t.fifa_code === homeTla ||
            t.name === homeShort ||
            t.name_normalised === homeShort,
        );

        const awayTeamData = teamsData.find(
          (t) =>
            t.name === awayName ||
            t.name_normalised === awayName ||
            t.fifa_code === awayTla ||
            t.name === awayShort ||
            t.name_normalised === awayShort,
        );

        const localMatch =
          this.matches.find(
            (lm) =>
              lm.homeTeam === homeTeamData?.name &&
              lm.awayTeam === awayTeamData?.name,
          ) ||
          this.qualifierMatches.find(
            (lm) =>
              lm.homeTeam === homeTeamData?.name &&
              lm.awayTeam === awayTeamData?.name,
          );

        return {
          id: String(m.id),
          matchNumber: localMatch?.matchNumber || m.matchday || 0,
          stage: m.stage || 'UNKNOWN',
          group: m.group || null,
          matchday: m.matchday || null,
          date: m.utcDate ? m.utcDate.split('T')[0] : '',
          time: m.utcDate ? m.utcDate.split('T')[1].substring(0, 5) : '',
          timezone: 'UTC',
          homeTeam: homeTeamData?.name || m.homeTeam?.name || 'TBD',
          awayTeam: awayTeamData?.name || m.awayTeam?.name || 'TBD',
          venue: localMatch?.venue || {
            city: null,
            stadium: m.venue || null, // football-data API usually provides stadium string
            country: null,
          },
          status: mapStatus(m.status),
          season: m.season?.startDate
            ? m.season.startDate.split('-')[0]
            : '2026',
          league: {
            id: '4429',
            name: 'FIFA World Cup',
            badgeUrl:
              'https://r2.thesportsdb.com/images/media/league/badge/e7er5g1696521789.png',
            sport: 'Soccer',
          },
          eventName: `${homeTeamData?.name || m.homeTeam?.name || 'TBD'} vs ${awayTeamData?.name || m.awayTeam?.name || 'TBD'}`,
          eventAlternateName: `${awayTeamData?.name || m.awayTeam?.name || 'TBD'} @ ${homeTeamData?.name || m.homeTeam?.name || 'TBD'}`,
          sportsDbEventId: null,
          sportsDbHomeTeamId: homeTeamData?.sportsdb_team_id || null,
          sportsDbAwayTeamId: awayTeamData?.sportsdb_team_id || null,
          homeTeamBadgeUrl:
            homeTeamData?.image_url || m.homeTeam?.crest || null,
          awayTeamBadgeUrl:
            awayTeamData?.image_url || m.awayTeam?.crest || null,
          score: {
            home: m.score?.fullTime?.home ?? null,
            away: m.score?.fullTime?.away ?? null,
          },
          timestampUtc: m.utcDate || null,
          dateUtc: m.utcDate ? m.utcDate.split('T')[0] : null,
          timeUtc: m.utcDate ? m.utcDate.split('T')[1].substring(0, 5) : null,
          statusCode: m.status || null,
          isPostponed: false,
          thumbnailUrl: null,
          posterUrl: null,
          videoUrl: null,
          sourceFilename: null,
          referees: m.referees || [],
          footballDataorgHomeTeamId: m.homeTeam?.id || null,
          footballDataorgAwayTeamId: m.awayTeam?.id || null,
          isNotified: isNotifiedMap.get(String(m.id)) ?? false,
        };
      });

      // Efficiently upsert matches based on the 'id' primary key.
      // This avoids the race condition of clearing the table and is much better for database performance (MVCC bloat).
      
      const matchesToUpsert = mappedMatches.filter(m => {
        // If the match is already known to be finished in our DB, skip the update to optimize syncing
        if (existingStatusMap.get(m.id) === 'finished') {
          return false;
        }
        return true;
      });

      await this.matchRepository.upsert(matchesToUpsert, ['id']);
    } catch (error) {
      console.error(
        'Error fetching matches from football-data.org API, falling back to local data:',
        error,
      );
      return this.fetchedMatches.length > 0
        ? this.fetchedMatches
        : this.matches;
    }
  }
}
