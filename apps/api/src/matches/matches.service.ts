import { Injectable, NotFoundException } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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

      const mappedMatches = apiMatches.map((apiMatch: any, index: number) =>
        mapFootballDataMatchToGroupStage(apiMatch, this.matches, index),
      );

      this.fetchedMatches = mappedMatches;
      this.lastFetchedTime = now;
      return mappedMatches;
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
}
