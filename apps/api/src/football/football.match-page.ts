import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type {
  Competition,
  CompetitionId,
  MatchListItem,
  MatchPageResponse,
} from '../../../../packages/football-contracts';
import { FootballReadCache, matchCacheTtl } from './football-cache';
import { entityId, status } from './football.model';
import { TOURNAMENT_CODES } from '../tournaments/provider.types';

const competitionIds = Object.keys(TOURNAMENT_CODES) as CompetitionId[];
type MatchStatusFilter = 'all' | 'live' | 'upcoming' | 'finished';
type MatchDayFilter = 'all' | 'today' | 'tomorrow' | 'past' | 'upcoming';

export type MatchPageQuery = {
  competition?: string;
  season?: number;
  status?: string;
  stage?: string;
  day?: string;
  q?: string;
  page?: string;
  pageSize?: string;
};

type NormalizedQuery = {
  competition: CompetitionId | null;
  season: number | null;
  status: MatchStatusFilter;
  stage: string | null;
  day: MatchDayFilter;
  q: string;
  page: number;
  limit: number;
};

type SeasonRow = {
  competitionId: CompetitionId;
  season: number;
  name: string;
  emblem: string | null;
  region: string;
  endDate: string;
  currentMatchday: number | null;
  lastSyncedAt: Date;
};
type SummaryRow = {
  competitionId: CompetitionId;
  stages: string[] | null;
  fixtureCount: number | string;
  observedAt: Date | null;
  hasLive: boolean;
};
type MatchRow = {
  id: number;
  competitionId: CompetitionId;
  season: number;
  kickoff: Date;
  status: string;
  homeScore: string | null;
  awayScore: string | null;
  homeId: string | null;
  awayId: string | null;
  homeName: string | null;
  awayName: string | null;
  homeShortName: string | null;
  awayShortName: string | null;
  homeCrest: string | null;
  awayCrest: string | null;
  stage: string | null;
  matchday: string | null;
  minute: string | null;
  injuryTime: string | null;
};

function positiveInteger(value: unknown, fallback: number, max: number) {
  if (value === undefined) return fallback;
  if (
    typeof value !== 'string' ||
    !/^[1-9]\d*$/.test(value) ||
    Number(value) > max
  )
    throw new BadRequestException(`Expected an integer from 1 to ${max}.`);
  return Number(value);
}

export function normalizeMatchPageQuery(
  query: MatchPageQuery,
): NormalizedQuery {
  if (
    (query.stage !== undefined && typeof query.stage !== 'string') ||
    (query.q !== undefined && typeof query.q !== 'string') ||
    (query.season !== undefined &&
      (!Number.isInteger(query.season) || query.season < 1))
  )
    throw new BadRequestException('Invalid match filter.');
  const competition = query.competition ?? 'all';
  if (
    competition !== 'all' &&
    !competitionIds.includes(competition as CompetitionId)
  )
    throw new BadRequestException('Unknown competition.');
  const statusFilter = query.status ?? 'all';
  if (!['all', 'live', 'upcoming', 'finished'].includes(statusFilter))
    throw new BadRequestException('Unknown match status.');
  const day = query.day ?? 'all';
  if (!['all', 'today', 'tomorrow', 'past', 'upcoming'].includes(day))
    throw new BadRequestException('Unknown day filter.');
  const stage =
    query.stage && query.stage !== 'all' ? query.stage.trim() : null;
  const q = query.q?.trim() ?? '';
  if ((stage?.length ?? 0) > 80 || q.length > 100)
    throw new BadRequestException('Filter is too long.');
  return {
    competition: competition === 'all' ? null : (competition as CompetitionId),
    season: query.season ?? null,
    status: statusFilter as MatchStatusFilter,
    stage,
    day: day as MatchDayFilter,
    q,
    page: positiveInteger(query.page, 1, 10_000),
    limit: positiveInteger(query.pageSize, 24, 50),
  };
}

const localDay = (date: Date) =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Kolkata' }).format(date);

export class MatchPageReader {
  private readonly cache = new FootballReadCache();

  constructor(private readonly db: DataSource) {}

  clear() {
    this.cache.clear();
  }

  async get(query: MatchPageQuery): Promise<MatchPageResponse> {
    const filters = normalizeMatchPageQuery(query);
    const today = localDay(new Date());
    const tomorrow = localDay(new Date(Date.now() + 86_400_000));
    const key = `match-page:${JSON.stringify({ ...filters, today })}`;
    return this.cache.get(
      key,
      (value: MatchPageResponse) =>
        filters.status === 'live' ||
        filters.day === 'today' ||
        value.data.some((item) => {
          const kickoff = Date.parse(item.match.kickoff);
          return (
            item.match.status === 'live' ||
            (item.match.status === 'upcoming' &&
              kickoff >= Date.now() - 4 * 60 * 60_000 &&
              kickoff <= Date.now() + 15 * 60_000)
          );
        })
          ? matchCacheTtl.live
          : filters.status === 'finished' || filters.day === 'past'
            ? matchCacheTtl.finished
            : matchCacheTtl.upcoming,
      () => this.load(filters, today, tomorrow),
    );
  }

  private async metadata(season: number | null) {
    return this.cache.get(
      `match-meta:${season ?? 'latest'}`,
      matchCacheTtl.metadata,
      async () => {
        const seasons = await this.db.query<SeasonRow[]>(
          `SELECT DISTINCT ON (s."competitionId") s."competitionId",s.season,
          s.competition->>'name' AS name,s.competition->>'emblem' AS emblem,
          s.competition->'area'->>'name' AS region,
          s.competition->'currentSeason'->>'endDate' AS "endDate",
          (s.competition->'currentSeason'->>'currentMatchday')::int AS "currentMatchday",
          s."lastSyncedAt"
         FROM tournament_seasons s
         WHERE s."competitionId"=ANY($1::text[]) AND ($2::int IS NULL OR s.season=$2)
         ORDER BY s."competitionId",s.season DESC`,
          [competitionIds, season],
        );
        const summaries = await this.db.query<SummaryRow[]>(
          `SELECT f."competitionId",array_remove(array_agg(DISTINCT f.payload->>'stage'),NULL) AS stages,
          count(*)::int AS "fixtureCount",max(f."observedAt") AS "observedAt",
          bool_or(f.status IN ('IN_PLAY','PAUSED')) AS "hasLive"
         FROM tournament_fixtures f
         JOIN (SELECT "competitionId",max(season) AS season FROM tournament_seasons
           WHERE "competitionId"=ANY($1::text[]) AND ($2::int IS NULL OR season=$2)
           GROUP BY "competitionId") latest
           ON latest."competitionId"=f."competitionId" AND latest.season=f.season
         GROUP BY f."competitionId"`,
          [competitionIds, season],
        );
        const summary = new Map(
          summaries.map((row) => [row.competitionId, row]),
        );
        const selected = new Map(
          seasons.map((row) => [row.competitionId, row]),
        );
        const competitions: Competition[] = competitionIds.map((id) => {
          const row = selected.get(id);
          return {
            id,
            name: id === 'la-liga' ? 'La Liga' : (row?.name ?? id),
            shortName:
              id === 'ucl'
                ? 'UCL'
                : id === 'la-liga'
                  ? 'La Liga'
                  : (row?.name ?? id),
            region: row?.region ?? '',
            season: row
              ? `${row.season}/${row.endDate?.slice(2, 4) ?? ''}`
              : 'Unavailable',
            format: id === 'ucl' ? 'League phase + knockout' : 'League',
            accent: 'violet',
            hasBracket: id === 'ucl',
            emblem: row?.emblem,
            currentMatchday: row?.currentMatchday,
          };
        });
        const stages = [
          ...new Set(summaries.flatMap((row) => row.stages ?? [])),
        ].sort();
        const errors: MatchPageResponse['errors'] = {};
        const availability: MatchPageResponse['availability'] = {};
        for (const id of competitionIds) {
          const row = selected.get(id);
          const info = summary.get(id);
          const fetchedAt = info?.observedAt ?? row?.lastSyncedAt ?? null;
          if (!info || Number(info.fixtureCount) === 0)
            errors[id] =
              'This season has not been imported or has no published fixtures.';
          const staleAfter = info?.hasLive ? 30 * 60_000 : 8 * 86_400_000;
          availability[id] = {
            state: errors[id]
              ? 'unavailable'
              : fetchedAt &&
                  Date.now() - new Date(fetchedAt).getTime() > staleAfter
                ? 'stale'
                : 'available',
            fetchedAt: fetchedAt ? new Date(fetchedAt).toISOString() : null,
            message: errors[id],
          };
        }
        return { competitions, stages, errors, availability };
      },
    );
  }

  private async load(
    filters: NormalizedQuery,
    today: string,
    tomorrow: string,
  ): Promise<MatchPageResponse> {
    const metadata = await this.metadata(filters.season);
    const base = `FROM tournament_fixtures f
      JOIN (SELECT "competitionId",max(season) AS season FROM tournament_seasons
        WHERE "competitionId"=ANY($1::text[]) AND ($2::int IS NULL OR season=$2)
        GROUP BY "competitionId") latest
        ON latest."competitionId"=f."competitionId" AND latest.season=f.season
      JOIN tournament_seasons s ON s."competitionId"=f."competitionId" AND s.season=f.season
      WHERE ($3::text IS NULL OR f."competitionId"=$3)
        AND ($4::text='all' OR ($4='live' AND f.status IN ('IN_PLAY','PAUSED'))
          OR ($4='upcoming' AND f.status IN ('SCHEDULED','TIMED') AND f.kickoff>=now())
          OR ($4='finished' AND f.status='FINISHED'))
        AND ($5::text IS NULL OR f.payload->>'stage'=$5)
        AND ($6::text='all' OR ($6='today' AND (f.kickoff AT TIME ZONE 'Asia/Kolkata')::date=$8::date)
          OR ($6='tomorrow' AND (f.kickoff AT TIME ZONE 'Asia/Kolkata')::date=$9::date)
          OR ($6='past' AND f.status='FINISHED')
          OR ($6='upcoming' AND f.status IN ('SCHEDULED','TIMED') AND f.kickoff>=now()))
        AND ($7::text='' OR position(lower($7) in lower(concat_ws(' ',
          f.payload->'homeTeam'->>'name',f.payload->'awayTeam'->>'name',s.competition->>'name'))) > 0)`;
    const args = [
      competitionIds,
      filters.season,
      filters.competition,
      filters.status,
      filters.stage,
      filters.day,
      filters.q,
      today,
      tomorrow,
    ];
    const [countRows, rows] = await Promise.all([
      this.db.query<Array<{ total: number | string }>>(
        `SELECT count(*)::int AS total ${base}`,
        args,
      ),
      this.db.query<MatchRow[]>(
        `SELECT f.id,f."competitionId",f.season,f.kickoff,f.status,
          f.score->'fullTime'->>'home' AS "homeScore",
          f.score->'fullTime'->>'away' AS "awayScore",
          f.payload->'homeTeam'->>'id' AS "homeId",
          f.payload->'awayTeam'->>'id' AS "awayId",
          f.payload->'homeTeam'->>'name' AS "homeName",
          f.payload->'awayTeam'->>'name' AS "awayName",
          f.payload->'homeTeam'->>'shortName' AS "homeShortName",
          f.payload->'awayTeam'->>'shortName' AS "awayShortName",
          f.payload->'homeTeam'->>'crest' AS "homeCrest",
          f.payload->'awayTeam'->>'crest' AS "awayCrest",
          f.payload->>'stage' AS stage,f.payload->>'matchday' AS matchday,
          f.payload->>'minute' AS minute,f.payload->>'injuryTime' AS "injuryTime"
         ${base}
         ORDER BY CASE WHEN f.status IN ('IN_PLAY','PAUSED') THEN 0
             WHEN f.status IN ('SCHEDULED','TIMED') THEN 1
             WHEN f.status='FINISHED' THEN 2 ELSE 3 END,
           CASE WHEN f.status='FINISHED' THEN f.kickoff END DESC,
           CASE WHEN f.status<>'FINISHED' THEN f.kickoff END ASC,f.id ASC
         LIMIT $10 OFFSET $11`,
        [...args, filters.limit, (filters.page - 1) * filters.limit],
      ),
    ]);
    const competitions = new Map(
      metadata.competitions.map((item) => [item.id, item]),
    );
    const data: MatchListItem[] = rows.map((row) => {
      const id = String(row.id);
      const team = (side: 'home' | 'away') => {
        const providerId = side === 'home' ? row.homeId : row.awayId;
        const name = side === 'home' ? row.homeName : row.awayName;
        const shortName =
          side === 'home' ? row.homeShortName : row.awayShortName;
        const crest = side === 'home' ? row.homeCrest : row.awayCrest;
        return {
          id: providerId
            ? entityId('teams', 'football-data', providerId)
            : `unconfirmed-${id}-${side}`,
          name: name || 'Team to be confirmed',
          shortName: shortName || name || 'TBC',
          logoUrl: crest ?? '',
        };
      };
      const home = team('home');
      const away = team('away');
      const minute =
        row.status === 'PAUSED'
          ? 'Half-time'
          : row.minute
            ? `${row.minute}${row.injuryTime ? `+${row.injuryTime}` : ''}'`
            : undefined;
      return {
        match: {
          id,
          competitionId: row.competitionId,
          season: String(row.season),
          homeTeamId: home.id,
          awayTeamId: away.id,
          status: status(row.status),
          kickoff: new Date(row.kickoff).toISOString(),
          stage: row.stage ?? 'UNKNOWN',
          matchday: row.matchday
            ? `Matchday ${row.matchday}`
            : (row.stage ?? ''),
          minute,
          homeScore: row.homeScore === null ? null : Number(row.homeScore),
          awayScore: row.awayScore === null ? null : Number(row.awayScore),
        },
        competition: competitions.get(row.competitionId)!,
        homeTeam: home,
        awayTeam: away,
      };
    });
    const total = Number(countRows[0]?.total ?? 0);
    const totalPages = Math.ceil(total / filters.limit);
    return {
      data,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
        hasNextPage: filters.page < totalPages,
        hasPreviousPage: filters.page > 1 && total > 0,
      },
      ...metadata,
    };
  }
}
