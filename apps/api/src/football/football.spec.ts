import { DataSource } from 'typeorm';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type {
  DevicePreferences,
  FootballMatch,
  FootballTeam,
} from '../../../../packages/football-contracts';
import {
  entityId,
  status,
  resultsFor,
  bracketFor,
  deriveStandings,
  safeUrl,
} from './football.model';
import { FootballDevices, validatePreferences } from './football.devices';
import { FootballJobs, deliveryEvents } from './football.jobs';
import { FootballService } from './football.service';
import { FootballController } from './football.controller';
import { TournamentsService } from '../tournaments/tournaments.service';
import {
  TournamentFixtureEntity,
  TournamentSeasonEntity,
} from '../tournaments/tournament.entities';
import { FootballDataClient } from '../football-data/football-data.client';
import { NewsService } from '../news/news.service';
import { MatchEntity } from '../matches/entities/matches.entity';
const mockPushSend = jest.fn();
jest.mock('firebase-admin/messaging', () => ({
  getMessaging: () => ({ send: mockPushSend }),
}));
const now = Date.parse('2026-10-19T12:00:00Z');
const fixture = (overrides: Partial<FootballMatch> = {}): FootballMatch => ({
  id: '100',
  competitionId: 'premier-league',
  season: '2026',
  homeTeamId: 'home',
  awayTeamId: 'away',
  stadiumId: '',
  kickoff: new Date(now + 30 * 60000).toISOString(),
  stage: 'REGULAR_SEASON',
  matchday: '1',
  status: 'upcoming',
  homeScore: null,
  awayScore: null,
  ...overrides,
});
const preferences = (): DevicePreferences => ({
  version: 1,
  teamIds: ['home'],
  playerIds: [],
  competitionIds: [],
  matchIds: [],
  reminders: {},
  notifications: {
    enabled: true,
    kickoff30: true,
    kickoff10: true,
    finalScore: true,
  },
});
describe('Football contracts and derived results', () => {
  it('scopes UUIDs by entity type and provider and keeps repeat imports stable', () => {
    const id = entityId('teams', 'football-data', 1);
    expect(id).toMatch(/^[a-f0-9-]{36}$/);
    expect(id).toBe(entityId('teams', 'football-data', 1));
    expect(id).not.toBe(entityId('players', 'football-data', 1));
    expect(id).not.toBe(entityId('teams', 'sportsdb', 1));
  });
  it('does not count unknown, postponed or incomplete scores as results', () => {
    const result = resultsFor('home', [
      fixture(),
      fixture({ status: 'postponed', homeScore: 3, awayScore: 0 }),
      fixture({ status: 'finished' }),
      fixture({ status: 'finished', homeScore: 0, awayScore: 0 }),
    ]);
    expect(result.stats).toEqual({
      played: 1,
      wins: 0,
      draws: 1,
      losses: 0,
      goals: 0,
      conceded: 0,
      cleanSheets: 1,
      xg: null,
      possession: null,
    });
    expect(result.form).toEqual(['D']);
  });
  it('calculates away results and excludes knockout results from group tables', () => {
    const matches = [
      fixture({
        id: 'group',
        status: 'finished',
        homeScore: 1,
        awayScore: 2,
        stage: 'GROUP_STAGE',
      }),
      fixture({
        id: 'final',
        status: 'finished',
        homeScore: 9,
        awayScore: 0,
        stage: 'FINAL',
      }),
    ];
    const teams = [{ id: 'home' }, { id: 'away' }] as FootballTeam[];
    expect(deriveStandings('world-cup', teams, matches)[0]).toMatchObject({
      teamId: 'away',
      points: 3,
      goalsFor: 2,
      played: 1,
    });
  });
  it('uses published knockout fixtures without inventing advancement', () => {
    expect(bracketFor([fixture({ stage: 'GROUP_STAGE' })])).toEqual([]);
    expect(
      bracketFor([fixture({ stage: 'FINAL', homeTeamId: 'unconfirmed' })])[0]
        .matches[0],
    ).toMatchObject({ homeTeamId: 'unconfirmed', homeScore: undefined });
  });
  it('preserves statuses and rejects unsafe publisher/video URLs', () => {
    expect(status('POSTPONED')).toBe('postponed');
    expect(status('unknown-provider-status')).toBe('unknown');
    expect(safeUrl('javascript:alert(1)')).toBeNull();
    expect(safeUrl('https://user:secret@example.com')).toBeNull();
  });
});
describe('Device ownership and reminder eligibility', () => {
  it('rejects malformed and oversized preference payloads', () => {
    expect(() => validatePreferences(null)).toThrow(BadRequestException);
    expect(() =>
      validatePreferences({ ...preferences(), reminders: { '100': [15] } }),
    ).toThrow(BadRequestException);
    expect(() =>
      validatePreferences({ ...preferences(), teamIds: Array(1001).fill('x') }),
    ).toThrow(BadRequestException);
  });
  it('deduplicates favourite identifiers', () => {
    expect(
      validatePreferences({ ...preferences(), teamIds: ['home', 'home'] })
        .teamIds,
    ).toEqual(['home']);
  });
  it('registers a random ownership secret and stores only its hash', async () => {
    const db = {
      query: jest
        .fn<Promise<unknown[]>, [string, unknown[]]>()
        .mockResolvedValue([]),
    };
    const device = await new FootballDevices(
      db as unknown as DataSource,
    ).register(preferences(), 'valid-token-1234567890');
    const args = db.query.mock.calls[0][1];
    expect(args[1]).not.toBe(device.secret);
    expect(args[1]).toHaveLength(64);
    expect(device.id).toMatch(/^[a-f0-9-]{36}$/);
  });
  it('stores browser preferences before a push token is registered', async () => {
    const db = {
      query: jest
        .fn<Promise<unknown[]>, [string, unknown[]]>()
        .mockResolvedValue([]),
    };
    const device = await new FootballDevices(
      db as unknown as DataSource,
    ).register(preferences(), null);
    expect(db.query.mock.calls[0][0]).toContain('football_devices');
    expect(db.query.mock.calls[0][1][2]).toBeNull();
    expect(device.secret).toBeTruthy();
  });
  it('rejects updates from another device without changing preferences', async () => {
    const db = {
      query: jest.fn().mockResolvedValue([{ secretHash: 'incorrect' }]),
    };
    await expect(
      new FootballDevices(db as unknown as DataSource).update(
        '00000000-0000-0000-0000-000000000001',
        'wrong',
        preferences(),
        null,
      ),
    ).rejects.toThrow(UnauthorizedException);
    expect(db.query).toHaveBeenCalledTimes(1);
  });
  it('accepts the issued credential for preference updates', async () => {
    const db = {
      query: jest
        .fn<Promise<unknown[]>, [string, unknown[]]>()
        .mockResolvedValue([]),
    };
    const devices = new FootballDevices(db as unknown as DataSource);
    const issued = await devices.register(
      preferences(),
      'valid-token-1234567890',
    );
    const savedHash = db.query.mock.calls[0][1][1];
    db.query.mockResolvedValueOnce([{ secretHash: savedHash }]);
    await expect(
      devices.update(issued.id, issued.secret, preferences(), null),
    ).resolves.toMatchObject({ updated: true });
  });
  it('handles denied or disabled permission through saved notification state', () => {
    const p = preferences();
    p.notifications.enabled = false;
    expect(deliveryEvents(fixture(), p, now)).toEqual([]);
  });
  it('sends a saved match reminder without a favourite team', () => {
    const p = preferences();
    p.teamIds = [];
    p.reminders = { '100': [30] };
    expect(deliveryEvents(fixture(), p, now)).toEqual(['kickoff30']);
  });
  it('does not broaden team alerts through saved competitions or match favourites', () => {
    const p = preferences();
    p.teamIds = ['another-team'];
    p.competitionIds = ['premier-league'];
    p.matchIds = ['100'];
    expect(deliveryEvents(fixture(), p, now)).toEqual([]);
  });
  it('does not send reminders for an old kickoff after a postponement', () => {
    expect(
      deliveryEvents(fixture({ status: 'postponed' }), preferences(), now),
    ).toEqual([]);
    expect(
      deliveryEvents(
        fixture({ kickoff: new Date(now + 90 * 60000).toISOString() }),
        preferences(),
        now,
      ),
    ).toEqual([]);
  });
  it('does not deliver World Cup reminders while its data is paused', () => {
    expect(
      deliveryEvents(
        fixture({ competitionId: 'world-cup' }),
        preferences(),
        now,
      ),
    ).toEqual([]);
  });
  it('only alerts final results with actual scores and a recently played match', () => {
    expect(
      deliveryEvents(fixture({ status: 'finished' }), preferences(), now),
    ).toEqual([]);
    expect(
      deliveryEvents(
        fixture({
          status: 'finished',
          kickoff: new Date(now - 3 * 3600000).toISOString(),
          homeScore: 0,
          awayScore: 2,
        }),
        preferences(),
        now,
      ),
    ).toEqual(['finalScore']);
    expect(
      deliveryEvents(
        fixture({
          status: 'finished',
          kickoff: new Date(now - 2 * 86400000).toISOString(),
          homeScore: 0,
          awayScore: 2,
        }),
        preferences(),
        now,
      ),
    ).toEqual([]);
  });
});
describe('Stored football reads', () => {
  const provider = { get: jest.fn() },
    tournaments = {
      seasonYear: (s?: string) => (s === undefined ? undefined : Number(s)),
    },
    news = {};
  const create = () => {
    const club = {
      id: 100,
      competitionId: 'premier-league',
      season: 2026,
      kickoff: new Date(now),
      status: 'SCHEDULED',
      score: { fullTime: { home: null, away: null } },
      payload: {
        id: 100,
        homeTeam: { id: 57, name: 'Arsenal' },
        awayTeam: { id: null, name: null },
        stage: 'REGULAR_SEASON',
        matchday: 1,
      },
    };
    const season = {
      competitionId: 'premier-league',
      season: 2026,
      competition: {
        name: 'Premier League',
        area: { name: 'England' },
        currentSeason: { endDate: '2027-05-30' },
      },
      lastSyncedAt: new Date(now),
    };
    const id = entityId('teams', 'football-data', 57);
    const db = {
      getRepository: jest.fn((entity: unknown) => ({
        find: jest
          .fn()
          .mockResolvedValue(
            entity === TournamentSeasonEntity
              ? [season]
              : entity === TournamentFixtureEntity
                ? [club]
                : [],
          ),
        findOneBy: jest.fn().mockResolvedValue(null),
      })),
      query: jest.fn((sql: string) =>
        Promise.resolve(
          sql.includes('SELECT id,kind')
            ? [
                {
                  id,
                  kind: 'teams',
                  payload: {
                    id,
                    name: 'Arsenal',
                    competitionIds: ['premier-league'],
                  },
                },
              ]
            : sql.includes('football_memberships')
              ? [
                  {
                    entityId: id,
                    competitionId: 'premier-league',
                    season: 2026,
                  },
                ]
              : [],
        ),
      ),
    };
    return {
      db,
      service: new FootballService(
        db as unknown as DataSource,
        tournaments as TournamentsService,
        news as NewsService,
        provider as unknown as FootballDataClient,
      ),
    };
  };
  beforeEach(() => provider.get.mockClear());
  it('returns database fixtures with stable IDs and no provider calls', async () => {
    const { service } = create();
    const d = await service.snapshot('premier-league', 2026);
    expect(d.matches).toHaveLength(1);
    expect(d.matches[0].homeTeamId).toBe(
      entityId('teams', 'football-data', 57),
    );
    expect(d.matches[0].awayTeamId).toBe('unconfirmed-100-away');
    expect(provider.get).not.toHaveBeenCalled();
  });
  it('reuses a snapshot until a score or schedule update invalidates it', async () => {
    const { service, db } = create();
    const first = await service.snapshot();
    const queryCount = db.query.mock.calls.length;
    expect(await service.snapshot()).toBe(first);
    expect(db.query).toHaveBeenCalledTimes(queryCount);
    service.invalidateSnapshots();
    expect(await service.snapshot()).not.toBe(first);
    expect(db.query.mock.calls.length).toBeGreaterThan(queryCount);
  });
  it('isolates seasons and returns unavailable data without importing', async () => {
    const { service } = create();
    const d = await service.snapshot('premier-league', 2025);
    expect(d.matches).toEqual([]);
    expect(d.teams).toEqual([]);
    expect(d.errors['premier-league']).toBeTruthy();
    expect(provider.get).not.toHaveBeenCalled();
  });
  it('publishes only club competitions and never loads World Cup fixtures or archives', async () => {
    const { service, db } = create();
    const data = await service.snapshot();
    expect(data.competitions.map((c) => c.id)).toEqual([
      'premier-league',
      'la-liga',
      'ucl',
      'bundesliga',
    ]);
    expect(db.getRepository.mock.calls.map(([entity]) => entity)).not.toContain(
      MatchEntity,
    );
    expect(
      db.query.mock.calls.some(([sql]) =>
        /wc:match|football_history/.test(sql),
      ),
    ).toBe(false);
    await expect(service.snapshot('world-cup')).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.history()).rejects.toThrow(NotFoundException);
    expect(provider.get).not.toHaveBeenCalled();
  });
  it('leaves World Cup and archive records untouched during catalog backfill', async () => {
    const runner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      query: jest.fn().mockResolvedValue([]),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      isTransactionActive: true,
      manager: {
        getRepository: jest.fn((entity: unknown) => {
          expect(entity).toBe(TournamentSeasonEntity);
          return { find: jest.fn().mockResolvedValue([]) };
        }),
      },
    };
    const service = new FootballService(
      { createQueryRunner: () => runner } as unknown as DataSource,
      tournaments as unknown as TournamentsService,
      news as NewsService,
      provider as unknown as FootballDataClient,
    );
    expect(await service.backfill()).toMatchObject({ archives: 0 });
    expect(
      runner.query.mock.calls.some(([sql]) =>
        /DELETE|TRUNCATE|football_history|INSERT INTO matches|UPDATE matches/.test(
          String(sql),
        ),
      ),
    ).toBe(false);
  });
  it('returns not found for fictional profile aliases', async () => {
    const { service } = create();
    await expect(service.resolve('players', 'fake-player')).rejects.toThrow(
      NotFoundException,
    );
  });
  it('validates pagination before returning directories', async () => {
    const { service } = create();
    await expect(service.directory('teams', { page: '-1' })).rejects.toThrow(
      BadRequestException,
    );
  });
  it('requires scheduler and admin credentials, including when unconfigured', () => {
    const old = process.env.FOOTBALL_SCHEDULER_SECRET;
    delete process.env.FOOTBALL_SCHEDULER_SECRET;
    const controller = new FootballController(
      {} as FootballService,
      {} as FootballDevices,
      {} as FootballJobs,
    );
    try {
      expect(() => controller.runJob('scores', '')).toThrow(
        UnauthorizedException,
      );
    } finally {
      if (old !== undefined) process.env.FOOTBALL_SCHEDULER_SECRET = old;
    }
  });
});
describe('Job concurrency and activation', () => {
  beforeEach(() => jest.spyOn(Date, 'now').mockReturnValue(now));
  afterEach(() => jest.restoreAllMocks());
  it('runs score refreshes in development and production unless Supabase owns scheduling', async () => {
    const environment = process.env.NODE_ENV,
      scheduler = process.env.FOOTBALL_SCHEDULER;
    const jobs = new FootballJobs(
      {} as DataSource,
      {} as FootballService,
      {} as TournamentsService,
      {} as FootballDataClient,
    );
    const run = jest
      .spyOn(jobs, 'runScheduled')
      .mockResolvedValue({ outcomes: [] });
    try {
      process.env.NODE_ENV = 'development';
      delete process.env.FOOTBALL_SCHEDULER;
      await jobs.localScores();
      expect(run).toHaveBeenCalledWith('scores');
      run.mockClear();
      process.env.FOOTBALL_SCHEDULER = 'supabase';
      await jobs.localScores();
      expect(run).not.toHaveBeenCalled();
      delete process.env.FOOTBALL_SCHEDULER;
      process.env.NODE_ENV = 'production';
      await jobs.localScores();
      expect(run).toHaveBeenCalledWith('scores');
    } finally {
      if (environment === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = environment;
      if (scheduler === undefined) delete process.env.FOOTBALL_SCHEDULER;
      else process.env.FOOTBALL_SCHEDULER = scheduler;
    }
  });
  it('runs process reminders only when push is activated', async () => {
    const push = process.env.FOOTBALL_PUSH_ENABLED,
      scheduler = process.env.FOOTBALL_SCHEDULER;
    const jobs = new FootballJobs(
      {} as DataSource,
      {} as FootballService,
      {} as TournamentsService,
      {} as FootballDataClient,
    );
    const run = jest.spyOn(jobs, 'run').mockResolvedValue({ sent: 0 });
    try {
      delete process.env.FOOTBALL_PUSH_ENABLED;
      delete process.env.FOOTBALL_SCHEDULER;
      await jobs.localReminders();
      expect(run).not.toHaveBeenCalled();
      process.env.FOOTBALL_PUSH_ENABLED = 'true';
      await jobs.localReminders();
      expect(run).toHaveBeenCalledWith('reminders');
      run.mockClear();
      process.env.FOOTBALL_SCHEDULER = 'supabase';
      await jobs.localReminders();
      expect(run).not.toHaveBeenCalled();
    } finally {
      if (push === undefined) delete process.env.FOOTBALL_PUSH_ENABLED;
      else process.env.FOOTBALL_PUSH_ENABLED = push;
      if (scheduler === undefined) delete process.env.FOOTBALL_SCHEDULER;
      else process.env.FOOTBALL_SCHEDULER = scheduler;
    }
  });
  it('skips overlapping jobs before doing provider or notification work', async () => {
    const oldPush = process.env.FOOTBALL_PUSH_ENABLED;
    process.env.FOOTBALL_PUSH_ENABLED = 'true';
    const runner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      query: jest.fn().mockResolvedValue([{ locked: false }]),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };
    const db = { createQueryRunner: () => runner };
    const football = { snapshot: jest.fn() };
    const jobs = new FootballJobs(
      db as unknown as DataSource,
      football as unknown as FootballService,
      {} as TournamentsService,
      {} as FootballDataClient,
    );
    try {
      expect(await jobs.run('reminders')).toEqual({ skipped: true });
      expect(football.snapshot).not.toHaveBeenCalled();
      expect(runner.release).toHaveBeenCalled();
    } finally {
      if (oldPush === undefined) delete process.env.FOOTBALL_PUSH_ENABLED;
      else process.env.FOOTBALL_PUSH_ENABLED = oldPush;
    }
  });
  it('never sends automatically before activation', async () => {
    const old = process.env.FOOTBALL_PUSH_ENABLED;
    delete process.env.FOOTBALL_PUSH_ENABLED;
    try {
      const jobs = new FootballJobs(
        {} as DataSource,
        {} as FootballService,
        {} as TournamentsService,
        {} as FootballDataClient,
      );
      expect(await jobs.reminders()).toEqual({ enabled: false, sent: 0 });
    } finally {
      if (old !== undefined) process.env.FOOTBALL_PUSH_ENABLED = old;
    }
  });
  const deliveryHarness = () => {
    const match = fixture();
    const row = {
      id: 'delivery',
      deviceId: 'device',
      matchId: match.id,
      event: 'kickoff30',
      kickoff: new Date(match.kickoff),
      attempts: 0,
      token: 'test-token',
      preferences: preferences(),
    };
    let selected = false;
    const manager = {
      query: jest
        .fn<Promise<unknown[]>, [string, unknown[]?]>()
        .mockImplementation((sql) => {
          if (sql.startsWith('SELECT d.') && !selected) {
            selected = true;
            return Promise.resolve([row]);
          }
          return Promise.resolve([]);
        }),
    };
    const db = {
      query: jest
        .fn<Promise<unknown[]>, [string, unknown[]?]>()
        .mockResolvedValue([]),
      transaction: jest.fn((fn: (manager: unknown) => Promise<unknown>) =>
        fn(manager),
      ),
    };
    const football = {
      snapshot: jest.fn().mockResolvedValue({
        matches: [match],
        teams: [
          { id: 'home', name: 'Home' },
          { id: 'away', name: 'Away' },
        ],
      }),
    };
    return {
      row,
      manager,
      db,
      jobs: new FootballJobs(
        db as unknown as DataSource,
        football as unknown as FootballService,
        {} as TournamentsService,
        {} as FootballDataClient,
      ),
    };
  };
  async function activated(run: () => Promise<void>) {
    const push = process.env.FOOTBALL_PUSH_ENABLED,
      url = process.env.FRONTEND_URL;
    process.env.FOOTBALL_PUSH_ENABLED = 'true';
    process.env.FRONTEND_URL = 'https://frontend.test';
    try {
      await run();
    } finally {
      if (push === undefined) delete process.env.FOOTBALL_PUSH_ENABLED;
      else process.env.FOOTBALL_PUSH_ENABLED = push;
      if (url === undefined) delete process.env.FRONTEND_URL;
      else process.env.FRONTEND_URL = url;
      mockPushSend.mockReset();
    }
  }
  it('retries transient push failures durably without logging push tokens', async () =>
    activated(async () => {
      const h = deliveryHarness();
      mockPushSend.mockRejectedValue({ code: 'messaging/server-unavailable' });
      await expect(h.jobs.reminders()).resolves.toMatchObject({
        failed: 1,
        sent: 0,
      });
      const update = h.manager.query.mock.calls.find(([sql]) =>
        sql.includes('attempts=attempts+1'),
      );
      expect(update?.[1]).toEqual([
        'delivery',
        'pending',
        'messaging/server-unavailable',
        60,
      ]);
    }));
  it('cleans invalid tokens and stops retrying expired registrations', async () =>
    activated(async () => {
      const h = deliveryHarness();
      mockPushSend.mockRejectedValue({
        code: 'messaging/registration-token-not-registered',
      });
      await h.jobs.reminders();
      expect(
        h.manager.query.mock.calls.some(([sql]) =>
          sql.includes('SET token=NULL'),
        ),
      ).toBe(true);
      const update = h.manager.query.mock.calls.find(([sql]) =>
        sql.includes('attempts=attempts+1'),
      );
      expect(update?.[1]?.[1]).toBe('failed');
    }));
  it('cancels rescheduled reminders before attempting delivery', async () =>
    activated(async () => {
      const h = deliveryHarness();
      h.row.kickoff = new Date(
        Date.parse(h.row.kickoff.toISOString()) - 86400000,
      );
      await h.jobs.reminders();
      expect(mockPushSend).not.toHaveBeenCalled();
      expect(
        h.manager.query.mock.calls.some(([sql]) =>
          sql.includes("status='cancelled'"),
        ),
      ).toBe(true);
    }));
  it('cancels queued delivery after the team is removed from favourites', async () =>
    activated(async () => {
      const h = deliveryHarness();
      h.row.preferences = {
        ...preferences(),
        teamIds: [],
        competitionIds: ['premier-league'],
        matchIds: ['100'],
        reminders: {},
      };
      await h.jobs.reminders();
      expect(mockPushSend).not.toHaveBeenCalled();
      expect(
        h.manager.query.mock.calls.some(([sql]) =>
          sql.includes("status='cancelled'"),
        ),
      ).toBe(true);
    }));
  it('keeps a queued saved-match reminder when no team is followed', async () =>
    activated(async () => {
      const h = deliveryHarness();
      h.row.preferences = {
        ...preferences(),
        teamIds: [],
        reminders: { '100': [30] },
      };
      mockPushSend.mockResolvedValue('message-id');
      await expect(h.jobs.reminders()).resolves.toMatchObject({ sent: 1 });
      expect(mockPushSend).toHaveBeenCalledTimes(1);
    }));
  it('records successful delivery and uses a canonical match link', async () =>
    activated(async () => {
      const h = deliveryHarness();
      mockPushSend.mockResolvedValue('message-id');
      await expect(h.jobs.reminders()).resolves.toMatchObject({ sent: 1 });
      expect(mockPushSend).toHaveBeenCalledWith(
        expect.objectContaining({
          webpush: {
            fcmOptions: { link: 'https://frontend.test/matches/100' },
          },
        }),
      );
      expect(
        h.manager.query.mock.calls.some(([sql]) =>
          sql.includes("status='sent'"),
        ),
      ).toBe(true);
    }));
});
