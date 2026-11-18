/* eslint-disable @typescript-eslint/require-await -- Async mocks implement database/provider interfaces without I/O. */
import {
  TournamentsService,
  validateCompetition,
  validateMatch,
} from './tournaments.service';
import {
  TournamentFixtureEntity,
  TournamentResourceCacheEntity,
  TournamentSeasonEntity,
} from './tournament.entities';
import { FootballDataClient } from '../football-data/football-data.client';
import { DataSource, EntityManager } from 'typeorm';
import type { ProviderMatch } from './provider.types';

const competition = {
  id: 2021,
  code: 'PL',
  name: 'Premier League',
  area: { name: 'England' },
  emblem: null,
  currentSeason: {
    startDate: '2026-08-01',
    endDate: '2027-05-30',
    currentMatchday: 1,
  },
};
const team = {
  id: 1,
  name: 'Arsenal FC',
  shortName: 'Arsenal',
  tla: 'ARS',
  crest: null,
};
const fixture = (id = 101) => ({
  id,
  utcDate: '2026-10-20T12:00:00Z',
  status: 'TIMED',
  matchday: 1,
  stage: 'REGULAR_SEASON',
  homeTeam: team,
  awayTeam: { ...team, id: 2 },
  score: { fullTime: { home: null, away: null } },
});

function setup() {
  const seasons: TournamentSeasonEntity[] = [];
  const fixtures = new Map<number, TournamentFixtureEntity>();
  const caches = new Map<string, TournamentResourceCacheEntity>();
  const locks = new Set<string>();
  const fixtureRepo = {
    find: jest.fn(
      async ({ where }: { where: { competitionId: string; season: number } }) =>
        [...fixtures.values()].filter(
          (row) =>
            row.competitionId === where.competitionId &&
            row.season === where.season,
        ),
    ),
    findOneBy: jest.fn(
      async ({ id }: { id: number }) => fixtures.get(id) ?? null,
    ),
  };
  const seasonRepo = {
    find: jest.fn(async () => [...seasons].sort((a, b) => b.season - a.season)),
    findOne: jest.fn(
      async ({
        where,
      }: {
        where: { competitionId: string; season?: number };
      }) =>
        [...seasons]
          .filter(
            (row) =>
              row.competitionId === where.competitionId &&
              (where.season === undefined || where.season === row.season),
          )
          .sort((a, b) => b.season - a.season)[0] ?? null,
    ),
    save: jest.fn(async (row: TournamentSeasonEntity) => {
      const index = seasons.findIndex(
        (old) =>
          old.competitionId === row.competitionId && old.season === row.season,
      );
      if (index < 0) seasons.push(row);
      else seasons[index] = row;
      return row;
    }),
  };
  const cacheRepo = {
    findOneBy: jest.fn(
      async ({ key }: { key: string }) => caches.get(key) ?? null,
    ),
    create: (row: TournamentResourceCacheEntity) => row,
    save: jest.fn(async (row: TournamentResourceCacheEntity) => {
      caches.set(row.key, row);
      return row;
    }),
  };
  const getRepository = jest.fn((entity: unknown) =>
    entity === TournamentSeasonEntity
      ? seasonRepo
      : entity === TournamentFixtureEntity
        ? fixtureRepo
        : cacheRepo,
  );
  const query = jest.fn(async (_sql: string, params: unknown[]) => {
    const [competitionId, season, batch, observedAt] = params as [
      string,
      number,
      string,
      Date,
    ];
    for (const raw of JSON.parse(batch) as ProviderMatch[]) {
      const old = fixtures.get(raw.id);
      if (!old || old.observedAt <= observedAt)
        fixtures.set(raw.id, {
          id: raw.id,
          competitionId,
          season,
          kickoff: new Date(raw.utcDate),
          status: raw.status,
          score: raw.score,
          payload: raw,
          observedAt,
        });
    }
  });
  const transaction = jest.fn(async (fn: (manager: EntityManager) => unknown) =>
    fn({ getRepository, query } as unknown as EntityManager),
  );
  const db = {
    getRepository,
    transaction,
    createQueryRunner: () => {
      const held = new Set<string>();
      const release = () => {
        for (const key of held) locks.delete(key);
        held.clear();
      };
      return {
        connect: jest.fn(),
        release: jest.fn(release),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(release),
        rollbackTransaction: jest.fn(release),
        isTransactionActive: true,
        manager: { getRepository, query },
        query: jest.fn(async (sql: string, [key]: string[]) => {
          if (sql.includes('pg_try_advisory_xact_lock')) {
            if (locks.has(key)) return [{ locked: false }];
            locks.add(key);
            held.add(key);
            return [{ locked: true }];
          }
          return [];
        }),
      };
    },
  } as unknown as DataSource;
  const get = jest.fn(
    async (path: string): Promise<unknown> =>
      path.endsWith('/PL')
        ? competition
        : path.includes('/teams?')
          ? { teams: [team] }
          : path.includes('/competitions/')
            ? { matches: [fixture()] }
            : { ...fixture(), competition, season: competition.currentSeason },
  );
  const service = new TournamentsService(db, {
    get,
  } as unknown as FootballDataClient);
  const imported = () =>
    seasons.push({
      competitionId: 'premier-league',
      season: 2026,
      competition,
      teams: [team],
      lastSyncedAt: new Date(),
    });
  return {
    service,
    otherService: new TournamentsService(db, {
      get,
    } as unknown as FootballDataClient),
    seasons,
    fixtures,
    caches,
    locks,
    get,
    transaction,
    query,
    imported,
  };
}

describe('TournamentsService', () => {
  it('serves stored metadata, teams and fixtures without a provider request', async () => {
    const { service, imported, get } = setup();
    imported();
    expect((await service.list()).tournaments).toHaveLength(1);
    expect((await service.competition('premier-league')).code).toBe('PL');
    expect((await service.teams('premier-league')).teams).toHaveLength(1);
    expect((await service.matches('premier-league')).matches).toEqual([]);
    await expect(service.matches('premier-league', 2025)).rejects.toThrow(
      'not been imported',
    );
    expect(get).not.toHaveBeenCalled();
  });

  it('upserts duplicate imports, changed dates and newly announced knockout fixtures without deleting old rows', async () => {
    const state = setup();
    await state.service.sync('premier-league');
    await state.service.sync('premier-league');
    expect(state.seasons).toHaveLength(1);
    expect(state.fixtures.size).toBe(1);
    state.get.mockImplementation(async (path) =>
      path.endsWith('/PL')
        ? competition
        : path.includes('/teams?')
          ? { teams: [team] }
          : {
              matches: [
                { ...fixture(), utcDate: '2026-10-21T15:00:00Z' },
                {
                  ...fixture(102),
                  stage: 'QUARTER_FINALS',
                  homeTeam: { ...team, id: null, name: null },
                },
              ],
            },
    );
    await state.service.sync('premier-league');
    expect(state.fixtures.get(101)?.kickoff.toISOString()).toBe(
      '2026-10-21T15:00:00.000Z',
    );
    expect(state.fixtures.size).toBe(2);
    state.get.mockImplementation(async (path) =>
      path.endsWith('/PL')
        ? competition
        : path.includes('/teams?')
          ? { teams: [team] }
          : { matches: [fixture(102)] },
    );
    await state.service.sync('premier-league');
    expect(state.fixtures.size).toBe(2);
    expect(state.query.mock.calls[0][0]).toContain('ON CONFLICT');
    expect(state.query.mock.calls[0][0]).toContain(
      '"observedAt" <= EXCLUDED."observedAt"',
    );
  });

  it('discovers new seasons while retaining previous seasons', async () => {
    const state = setup();
    await state.service.sync('premier-league');
    state.get.mockImplementation(async (path) =>
      path.endsWith('/PL')
        ? {
            ...competition,
            currentSeason: {
              ...competition.currentSeason,
              startDate: '2027-08-01',
              endDate: '2028-05-30',
            },
          }
        : path.includes('/teams?')
          ? { teams: [team] }
          : { matches: [fixture(202)] },
    );
    await state.service.sync('premier-league');
    expect(state.seasons.map((row) => row.season)).toEqual([2026, 2027]);
    expect((await state.service.storedSeason('premier-league')).season).toBe(
      2027,
    );
    expect(
      (await state.service.matches('premier-league', 2026)).matches,
    ).toHaveLength(1);
  });

  it('validates the complete import before writing and preserves a successful import on failure', async () => {
    const state = setup();
    await state.service.sync('premier-league');
    const syncedAt = state.seasons[0].lastSyncedAt;
    state.transaction.mockClear();
    state.get.mockImplementation(async (path) =>
      path.endsWith('/PL')
        ? competition
        : path.includes('/teams?')
          ? { teams: [team] }
          : {
              matches: [fixture(102), { ...fixture(103), utcDate: 'invalid' }],
            },
    );
    await expect(state.service.sync('premier-league')).rejects.toThrow(
      'Invalid',
    );
    expect(state.transaction).not.toHaveBeenCalled();
    expect(state.fixtures.size).toBe(1);
    expect(state.seasons[0].lastSyncedAt).toBe(syncedAt);
    expect(state.locks.size).toBe(0);
  });

  it('skips overlapping syncs and does not call the provider for unknown detail IDs', async () => {
    const state = setup();
    state.locks.add('tournament:sync:premier-league');
    expect(await state.service.sync('premier-league')).toEqual({
      id: 'premier-league',
      skipped: true,
    });
    await expect(state.service.details(999)).rejects.toThrow('Match not found');
    expect(state.get).not.toHaveBeenCalled();
  });

  it('caches details for 60 seconds, persists scores and falls back to expired saved details', async () => {
    const state = setup();
    await state.service.sync('premier-league');
    state.get.mockClear();
    state.get.mockResolvedValue({
      ...fixture(),
      status: 'FINISHED',
      score: { fullTime: { home: 0, away: 1 } },
      competition,
      season: competition.currentSeason,
    });
    const response = await state.service.details(101);
    expect(response.freshness.stale).toBe(false);
    expect(state.fixtures.get(101)?.score.fullTime).toEqual({
      home: 0,
      away: 1,
    });
    await state.service.details(101);
    expect(state.get).toHaveBeenCalledTimes(1);
    expect(state.get).toHaveBeenCalledWith('/matches/101', {
      unfoldLineups: true,
    });
    state.caches.get('match:101')!.expiresAt = new Date(0);
    state.get.mockRejectedValue(new Error('provider unavailable'));
    expect((await state.service.details(101)).freshness.stale).toBe(true);
    expect(state.caches.get('match:101')!.payload.status).toBe('FINISHED');
  });

  it('deduplicates concurrent cache refreshes across service instances', async () => {
    const state = setup();
    await state.service.sync('premier-league');
    state.get.mockClear();
    let resolve!: (value: unknown) => void;
    state.get.mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const first = state.service.details(101);
    while (!resolve) await new Promise((done) => setTimeout(done, 1));
    const second = state.otherService.details(101);
    resolve({ ...fixture(), competition, season: competition.currentSeason });
    const results = await Promise.all([first, second]);
    expect(results.every((result) => !result.freshness.stale)).toBe(true);
    expect(state.get).toHaveBeenCalledTimes(1);
  });

  it('keeps a newer detail response when an older schedule request finishes later', async () => {
    const state = setup();
    await state.service.sync('premier-league');
    let release!: (value: unknown) => void;
    state.get.mockImplementation(async (path) =>
      path.endsWith('/PL')
        ? competition
        : path.includes('/teams?')
          ? { teams: [team] }
          : path.includes('/competitions/')
            ? new Promise((done) => {
                release = done;
              })
            : {
                ...fixture(),
                status: 'FINISHED',
                competition,
                season: competition.currentSeason,
              },
    );
    const syncing = state.service.sync('premier-league');
    while (!release) await new Promise((done) => setTimeout(done, 1));
    await new Promise((done) => setTimeout(done, 2));
    await state.service.details(101);
    release({ matches: [fixture()] });
    await syncing;
    expect(state.fixtures.get(101)?.status).toBe('FINISHED');
  });

  it('caches statistics separately for five minutes without fetching other resources', async () => {
    const state = setup();
    state.imported();
    state.get.mockResolvedValue({ scorers: [] });
    await state.service.resource('premier-league', 'scorers');
    await state.service.resource('premier-league', 'scorers');
    expect(state.get).toHaveBeenCalledTimes(1);
    const cache = state.caches.get('premier-league:2026:scorers')!;
    expect(cache.expiresAt.getTime() - cache.fetchedAt.getTime()).toBe(300_000);
  });

  it('rejects unsupported tournaments, invalid season inputs, malformed payloads and negative scores', () => {
    const { service } = setup();
    expect(() => service.tournamentId('__proto__')).toThrow();
    expect(() => service.seasonYear('2026x')).toThrow();
    expect(() =>
      validateCompetition({ ...competition, code: 'PD' }, 'PL'),
    ).toThrow();
    expect(() =>
      validateMatch({
        ...fixture(),
        score: { fullTime: { home: -1, away: 0 } },
      }),
    ).toThrow();
  });

  it('persists official World Cup standings without needing an imported club season', async () => {
    const state = setup();
    state.get.mockResolvedValue({
      competition: { code: 'WC' },
      season: { startDate: '2026-06-11' },
      standings: [],
    });
    await state.service.resource('world-cup', 'standings', 2026);
    expect(state.get).toHaveBeenCalledWith(
      '/competitions/WC/standings?season=2026',
      undefined,
    );
    expect(
      state.caches.get('world-cup:2026:standings')?.payload.standings,
    ).toEqual([]);
  });

  it('refreshes a fresh official table for jobs and retains it on provider failure', async () => {
    const state = setup();
    state.imported();
    const table = {
      competition: { code: 'PL' },
      standings: [
        {
          type: 'TOTAL',
          table: [
            {
              team,
              position: 1,
              playedGames: 2,
              won: 1,
              draw: 1,
              lost: 0,
              points: 4,
              goalsFor: 3,
              goalsAgainst: 1,
              goalDifference: 2,
            },
          ],
        },
      ],
    };
    state.get.mockResolvedValue(table);
    await state.service.resource('premier-league', 'standings');
    await state.service.resource('premier-league', 'standings', 2026, true);
    expect(state.get).toHaveBeenCalledTimes(2);
    state.get.mockRejectedValue(new Error('Provider offline'));
    const result = await state.service.resource(
      'premier-league',
      'standings',
      2026,
      true,
    );
    expect(result.freshness.stale).toBe(true);
    expect(state.caches.get('premier-league:2026:standings')?.payload).toEqual(
      table,
    );
  });

  it('rejects cross-competition official tables before saving them', async () => {
    const state = setup();
    state.imported();
    state.get.mockResolvedValue({ competition: { code: 'PD' }, standings: [] });
    await expect(
      state.service.resource('premier-league', 'standings'),
    ).rejects.toThrow('Invalid football statistics');
    expect(state.caches.size).toBe(0);
  });
});
