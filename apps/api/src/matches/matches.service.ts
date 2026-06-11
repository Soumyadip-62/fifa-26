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

@Injectable()
export class MatchesService {
  private readonly matches: GroupStageMatch[];
  private readonly qualifierMatches: GroupStageMatch[];

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

  findAll() {
    return this.matches;
  }
  findAllQualifierMatches() {
    return this.qualifierMatches;
  }

  findOne(matchId: string) {
    const match = this.matches.find(
      ({ id, matchNumber }) =>
        id === matchId || matchNumber.toString() === matchId,
    );

    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    return match;
  }
}
