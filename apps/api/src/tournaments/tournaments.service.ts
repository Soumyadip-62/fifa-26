import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { FootballDataClient } from '../football-data/football-data.client';
import { TOURNAMENT_CODES } from './provider.types';
import type {
  ProviderCompetition,
  ProviderMatch,
  ProviderTeam,
  TournamentId,
} from './provider.types';
import {
  TournamentFixtureEntity,
  TournamentResourceCacheEntity,
  TournamentSeasonEntity,
} from './tournament.entities';

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
const validDate = (value: unknown): value is string =>
  typeof value === 'string' && Number.isFinite(Date.parse(value));
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const integer = (value: unknown): value is number =>
  Number.isSafeInteger(value) && Number(value) > 0;
const team = (value: unknown, placeholder = false): value is ProviderTeam =>
  object(value) &&
  (integer(value.id) || (placeholder && value.id === null)) &&
  (typeof value.name === 'string' || (placeholder && value.name === null)) &&
  ['shortName', 'tla', 'crest'].every(
    (field) => value[field] == null || typeof value[field] === 'string',
  ) &&
  (value.area === undefined ||
    (object(value.area) && typeof value.area.name === 'string'));

export function validateMatch(value: unknown): asserts value is ProviderMatch {
  if (
    !object(value) ||
    !integer(value.id) ||
    !validDate(value.utcDate) ||
    (value.lastUpdated !== undefined && !validDate(value.lastUpdated)) ||
    typeof value.status !== 'string' ||
    typeof value.stage !== 'string' ||
    !(value.matchday === null || integer(value.matchday)) ||
    !team(value.homeTeam, true) ||
    !team(value.awayTeam, true) ||
    !object(value.score) ||
    !object(value.score.fullTime) ||
    !['home', 'away'].every((side) => {
      const score = (value.score as Record<string, Record<string, unknown>>)
        .fullTime[side];
      return (
        score === null || (Number.isSafeInteger(score) && Number(score) >= 0)
      );
    })
  )
    throw new ServiceUnavailableException('Invalid football fixture response.');
}

export function validateCompetition(
  value: unknown,
  code: string,
): asserts value is ProviderCompetition {
  if (
    !object(value) ||
    value.code !== code ||
    !integer(value.id) ||
    typeof value.name !== 'string' ||
    !object(value.area) ||
    typeof value.area.name !== 'string' ||
    !object(value.currentSeason) ||
    !validDate(value.currentSeason.startDate) ||
    !validDate(value.currentSeason.endDate) ||
    value.currentSeason.endDate < value.currentSeason.startDate
  ) {
    throw new ServiceUnavailableException(
      'Invalid football competition response.',
    );
  }
}

@Injectable()
export class TournamentsService {
  private readonly logger = new Logger(TournamentsService.name);
  constructor(
    private readonly db: DataSource,
    private readonly provider: FootballDataClient,
  ) {}

  tournamentId(value: string): TournamentId {
    if (!Object.prototype.hasOwnProperty.call(TOURNAMENT_CODES, value))
      throw new NotFoundException('Tournament not supported.');
    return value as TournamentId;
  }

  seasonYear(value?: string): number | undefined {
    if (value === undefined) return undefined;
    if (!/^\d{4}$/.test(value) || Number(value) < 1800 || Number(value) > 2200)
      throw new BadRequestException(
        'Season must be a four-digit starting year.',
      );
    return Number(value);
  }

  async list(season?: number) {
    const rows = await this.db.getRepository(TournamentSeasonEntity).find({
      ...(season === undefined ? {} : { where: { season } }),
      order: { season: 'DESC', competitionId: 'ASC' },
    });
    const latest = new Map<string, TournamentSeasonEntity>();
    for (const row of rows)
      if (!latest.has(row.competitionId)) latest.set(row.competitionId, row);
    return {
      tournaments: [...latest.values()].map((row) => ({
        id: row.competitionId,
        season: row.season,
        competition: row.competition,
        lastSyncedAt: row.lastSyncedAt,
      })),
    };
  }

  async storedSeason(id: TournamentId, season?: number) {
    const row = await this.db.getRepository(TournamentSeasonEntity).findOne({
      where: { competitionId: id, ...(season === undefined ? {} : { season }) },
      order: { season: 'DESC' },
    });
    if (!row)
      throw new ServiceUnavailableException(
        'Tournament season has not been imported yet.',
      );
    return row;
  }

  async competition(id: TournamentId, season?: number) {
    const row = await this.storedSeason(id, season);
    return { ...row.competition, lastSyncedAt: row.lastSyncedAt };
  }

  async teams(id: TournamentId, season?: number) {
    const row = await this.storedSeason(id, season);
    return {
      teams: row.teams,
      season: row.competition.currentSeason,
      lastSyncedAt: row.lastSyncedAt,
    };
  }

  async matches(id: TournamentId, season?: number) {
    const row = await this.storedSeason(id, season);
    const fixtures = await this.db.getRepository(TournamentFixtureEntity).find({
      where: { competitionId: id, season: row.season },
      order: { kickoff: 'ASC', id: 'ASC' },
    });
    return {
      matches: fixtures.map((fixture) => fixture.payload),
      lastSyncedAt: row.lastSyncedAt,
    };
  }

  async resource(
    id: TournamentId | 'world-cup',
    resource: 'standings' | 'scorers',
    season?: number,
    force = false,
  ) {
    const year =
      id === 'world-cup'
        ? (season ?? 2026)
        : (await this.storedSeason(id, season)).season;
    const code = id === 'world-cup' ? 'WC' : TOURNAMENT_CODES[id];
    return this.cached(
      `${id}:${year}:${resource}`,
      300_000,
      async () => {
        const body = await this.provider.get<Record<string, unknown>>(
          `/competitions/${code}/${resource}?season=${year}${resource === 'scorers' ? '&limit=5' : ''}`,
          force ? { queueTimeoutMs: 120_000 } : undefined,
        );
        const rows = body?.[resource];
        if (
          (body.competition !== undefined &&
            (!object(body.competition) || body.competition.code !== code)) ||
          (body.season !== undefined &&
            (!object(body.season) ||
              !validDate(body.season.startDate) ||
              Number(body.season.startDate.slice(0, 4)) !== year)) ||
          !Array.isArray(rows) ||
          !rows.every((entry) => {
            if (!object(entry)) return false;
            if (resource === 'scorers')
              return (
                object(entry.player) &&
                integer(entry.player.id) &&
                typeof entry.player.name === 'string' &&
                team(entry.team) &&
                typeof entry.goals === 'number'
              );
            return (
              typeof entry.type === 'string' &&
              Array.isArray(entry.table) &&
              entry.table.every(
                (item) =>
                  object(item) &&
                  team(item.team) &&
                  [
                    'position',
                    'playedGames',
                    'won',
                    'draw',
                    'lost',
                    'points',
                    'goalsFor',
                    'goalsAgainst',
                    'goalDifference',
                  ].every((field) => Number.isFinite(item[field])),
              )
            );
          })
        )
          throw new ServiceUnavailableException(
            'Invalid football statistics response.',
          );
        return body;
      },
      undefined,
      force,
    );
  }

  async details(id: number) {
    if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647)
      throw new NotFoundException('Match not found.');
    const fixture = await this.db
      .getRepository(TournamentFixtureEntity)
      .findOneBy({ id });
    if (!fixture) throw new NotFoundException('Match not found.');
    return this.cached(
      `match:${id}`,
      60_000,
      async () => {
        const raw = await this.provider.get<ProviderMatch>(`/matches/${id}`, {
          unfoldLineups: true,
        });
        validateMatch(raw);
        if (
          raw.id !== id ||
          raw.competition?.code !==
            TOURNAMENT_CODES[this.tournamentId(fixture.competitionId)] ||
          !raw.season ||
          !validDate(raw.season.startDate) ||
          !validDate(raw.season.endDate) ||
          Number(raw.season.startDate.slice(0, 4)) !== fixture.season
        )
          throw new ServiceUnavailableException(
            'Invalid football match response.',
          );
        return raw;
      },
      (manager, payload, observedAt) =>
        this.saveFixture(
          manager,
          fixture.competitionId,
          fixture.season,
          payload as ProviderMatch,
          observedAt,
        ),
    );
  }

  private async cached(
    key: string,
    ttlMs: number,
    load: () => Promise<Record<string, unknown>>,
    persist?: (
      manager: EntityManager,
      payload: Record<string, unknown>,
      observedAt: Date,
    ) => Promise<void>,
    force = false,
  ) {
    const refreshAfter = force ? Date.now() : 0;
    const repository = this.db.getRepository(TournamentResourceCacheEntity);
    let saved = await repository.findOneBy({ key });
    const previousFetch = saved?.fetchedAt.getTime();
    const fresh = (row: TournamentResourceCacheEntity) =>
      row.expiresAt.getTime() > Date.now() &&
      (!force ||
        (row.fetchedAt.getTime() >= refreshAfter &&
          row.fetchedAt.getTime() !== previousFetch));
    const response = (row: TournamentResourceCacheEntity, stale: boolean) => ({
      ...row.payload,
      freshness: { fetchedAt: row.fetchedAt.toISOString(), stale },
    });
    if (saved && !force && fresh(saved)) return response(saved, false);
    const runner = this.db.createQueryRunner();
    let locked = false;
    try {
      await runner.connect();
      await runner.startTransaction();
      const deadline = Date.now() + 20_000;
      while (!locked) {
        const lockRows = (await runner.query(
          'SELECT pg_try_advisory_xact_lock(hashtext($1)) AS locked',
          [`tournament:cache:${key}`],
        )) as Array<{ locked: boolean }>;
        locked = lockRows[0]?.locked === true;
        if (!locked) {
          saved = await repository.findOneBy({ key });
          if (saved) return response(saved, !fresh(saved));
          if (Date.now() > deadline)
            throw new ServiceUnavailableException(
              'Football data is temporarily busy.',
            );
          await sleep(100);
        }
      }
      saved = await repository.findOneBy({ key });
      if (saved && fresh(saved)) return response(saved, false);
      const observedAt = new Date();
      const payload = await load();
      const fetchedAt = new Date();
      const row = repository.create({
        key,
        payload,
        fetchedAt,
        expiresAt: new Date(fetchedAt.getTime() + ttlMs),
      });
      if (persist) await persist(runner.manager, payload, observedAt);
      await runner.manager
        .getRepository(TournamentResourceCacheEntity)
        .save(row);
      await runner.commitTransaction();
      return response(row, false);
    } catch (error) {
      this.logger.warn(
        `Resource ${key} refresh failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      if (saved) return response(saved, true);
      throw error;
    } finally {
      if (runner.isTransactionActive) await runner.rollbackTransaction();
      await runner.release();
    }
  }

  private async saveFixture(
    manager: EntityManager,
    id: string,
    season: number,
    raw: ProviderMatch,
    observedAt: Date,
  ) {
    await this.saveFixtures(manager, id, season, [raw], observedAt);
  }

  private async saveFixtures(
    manager: EntityManager,
    id: string,
    season: number,
    fixtures: ProviderMatch[],
    observedAt: Date,
  ) {
    await manager.query(
      `INSERT INTO tournament_fixtures
      ("id", "competitionId", "season", "kickoff", "status", "score", "payload", "observedAt")
      SELECT (item->>'id')::int, $1, $2, (item->>'utcDate')::timestamptz,
        item->>'status', item->'score', item, $4 FROM jsonb_array_elements($3::jsonb) AS item
      ON CONFLICT ("id") DO UPDATE SET "kickoff"=EXCLUDED."kickoff", "status"=EXCLUDED."status",
        "score"=EXCLUDED."score", "payload"=EXCLUDED."payload", "observedAt"=EXCLUDED."observedAt"
      WHERE tournament_fixtures."observedAt" <= EXCLUDED."observedAt"
        AND tournament_fixtures."competitionId"=EXCLUDED."competitionId" AND tournament_fixtures."season"=EXCLUDED."season" AND (tournament_fixtures.payload->>'lastUpdated' IS NULL OR EXCLUDED.payload->>'lastUpdated' IS NULL OR (tournament_fixtures.payload->>'lastUpdated')::timestamptz <= (EXCLUDED.payload->>'lastUpdated')::timestamptz)`,
      [id, season, JSON.stringify(fixtures), observedAt],
    );
  }

  async sync(id: TournamentId, requestedSeason?: number) {
    const runner = this.db.createQueryRunner();
    let locked = false;
    try {
      await runner.connect();
      await runner.startTransaction();
      const lockRows = (await runner.query(
        'SELECT pg_try_advisory_xact_lock(hashtext($1)) AS locked',
        [`tournament:sync:${id}`],
      )) as Array<{ locked: boolean }>;
      locked = lockRows[0]?.locked === true;
      if (!locked) return { id, skipped: true };
      const code = TOURNAMENT_CODES[id];
      const options = { queueTimeoutMs: 120_000 };
      const metadata = await this.provider.get<ProviderCompetition>(
        `/competitions/${code}`,
        options,
      );
      validateCompetition(metadata, code);
      const selected =
        requestedSeason === undefined
          ? metadata.currentSeason
          : [metadata.currentSeason, ...(metadata.seasons ?? [])].find(
              (entry) =>
                Number(entry.startDate.slice(0, 4)) === requestedSeason,
            );
      if (!selected)
        throw new BadRequestException(
          'Season not available for this competition.',
        );
      const competition = { ...metadata, currentSeason: selected };
      validateCompetition(competition, code);
      const season = Number(selected.startDate.slice(0, 4));
      const teams = await this.provider.get<{ teams: ProviderTeam[] }>(
        `/competitions/${code}/teams?season=${season}`,
        options,
      );
      if (
        !Array.isArray(teams?.teams) ||
        !teams.teams.length ||
        !teams.teams.every((entry) => team(entry))
      )
        throw new ServiceUnavailableException(
          'Invalid football teams response.',
        );
      const observedAt = new Date();
      const fixtures = await this.provider.get<{ matches: ProviderMatch[] }>(
        `/competitions/${code}/matches?season=${season}`,
        options,
      );
      if (!Array.isArray(fixtures?.matches) || !fixtures.matches.length)
        throw new ServiceUnavailableException(
          'Invalid or empty football schedule response.',
        );
      const ids = new Set<number>();
      for (const fixture of fixtures.matches) {
        validateMatch(fixture);
        if (
          ids.has(fixture.id) ||
          (fixture.competition && fixture.competition.code !== code) ||
          (fixture.season &&
            Number(fixture.season.startDate.slice(0, 4)) !== season)
        )
          throw new ServiceUnavailableException(
            'Invalid football schedule response.',
          );
        ids.add(fixture.id);
      }
      await this.saveFixtures(
        runner.manager,
        id,
        season,
        fixtures.matches,
        observedAt,
      );
      await runner.manager.getRepository(TournamentSeasonEntity).save({
        competitionId: id,
        season,
        competition,
        teams: teams.teams,
        lastSyncedAt: new Date(),
      });
      await runner.commitTransaction();
      this.logger.log(
        `Synced ${id} ${season}: ${fixtures.matches.length} fixtures`,
      );
      return { id, season, fixtures: fixtures.matches.length, skipped: false };
    } finally {
      if (runner.isTransactionActive) await runner.rollbackTransaction();
      await runner.release();
    }
  }

  async syncAll(id?: TournamentId, season?: number) {
    const results: Array<Record<string, unknown>> = [];
    for (const competition of id
      ? [id]
      : (Object.keys(TOURNAMENT_CODES) as TournamentId[])) {
      try {
        results.push(await this.sync(competition, season));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Sync failed';
        this.logger.error(`Sync failed for ${competition}: ${message}`);
        results.push({ id: competition, error: message });
      }
    }
    return results;
  }

  async refreshActive() {
    const due = await this.db.query<
      Array<{ competitionId: TournamentId; season: number }>
    >(
      `SELECT DISTINCT "competitionId", season FROM tournament_fixtures WHERE status IN ('IN_PLAY','PAUSED','SUSPENDED') OR (kickoff BETWEEN now()-interval '48 hours' AND now()+interval '20 minutes' AND status IN ('SCHEDULED','TIMED'))`,
    );
    const results: Array<Record<string, unknown>> = [];
    for (const row of due) {
      try {
        const observedAt = new Date();
        const body = await this.provider.get<{ matches: ProviderMatch[] }>(
          `/competitions/${TOURNAMENT_CODES[row.competitionId]}/matches?season=${row.season}`,
          { queueTimeoutMs: 120_000 },
        );
        if (!Array.isArray(body.matches) || !body.matches.length)
          throw new ServiceUnavailableException('Invalid score update.');
        const seen = new Set<number>();
        for (const m of body.matches) {
          validateMatch(m);
          if (
            seen.has(m.id) ||
            m.competition?.code !== TOURNAMENT_CODES[row.competitionId] ||
            Number(m.season?.startDate.slice(0, 4)) !== row.season
          )
            throw new ServiceUnavailableException('Invalid score update.');
          seen.add(m.id);
        }
        await this.db.transaction((manager) =>
          this.saveFixtures(
            manager,
            row.competitionId,
            row.season,
            body.matches,
            observedAt,
          ),
        );
        results.push({ ...row, fixtures: body.matches.length });
      } catch {
        results.push({
          ...row,
          error: 'Score update failed; saved fixtures retained.',
        });
      }
    }
    return results;
  }
}
