import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { FootballJobs } from './football.jobs';
import { FootballService } from './football.service';
import { TournamentsService } from '../tournaments/tournaments.service';
import { FootballDataClient } from '../football-data/football-data.client';
import type {
  FootballCadenceState,
  ScheduledFootballJob,
} from './football.cadence';

function setup() {
  const runner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    query: jest.fn().mockResolvedValue([{ locked: true }]),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    isTransactionActive: true,
  };
  const db = {
    createQueryRunner: () => runner,
    query: jest.fn().mockResolvedValue([]),
  };
  const tournaments = {
    tournamentId: jest.fn((id: string) => id),
    syncAll: jest
      .fn()
      .mockResolvedValue([
        { id: 'premier-league', season: 2026, fixtures: 380, skipped: false },
      ]),
    refreshActive: jest
      .fn()
      .mockResolvedValue([
        { competitionId: 'premier-league', season: 2026, fixtures: 380 },
      ]),
    resource: jest.fn().mockResolvedValue({
      freshness: { fetchedAt: new Date().toISOString(), stale: false },
    }),
  };
  const football = {
    backfill: jest.fn().mockResolvedValue({ catalog: 100 }),
    invalidateSnapshots: jest.fn(),
  };
  const jobs = new FootballJobs(
    db as unknown as DataSource,
    football as unknown as FootballService,
    tournaments as unknown as TournamentsService,
    {} as FootballDataClient,
  );
  const worldCup = jest
    .spyOn(jobs, 'refreshWorldCup')
    .mockResolvedValue({ fixtures: 104 });
  return { jobs, db, runner, tournaments, football, worldCup };
}

describe('Backend fixture and official-table synchronization', () => {
  afterEach(() => jest.restoreAllMocks());

  it('imports schedules and official tables together before reporting success', async () => {
    const h = setup();
    await h.jobs.run('schedules');
    expect(h.tournaments.resource).toHaveBeenCalledWith(
      'premier-league',
      'standings',
      2026,
      true,
    );
    expect(h.worldCup).not.toHaveBeenCalled();
    expect(h.tournaments.resource).toHaveBeenCalledTimes(1);
    expect(h.football.backfill).toHaveBeenCalled();
    expect(
      h.db.query.mock.calls.some(([sql]) =>
        String(sql).includes('"lastSuccessAt"=now()'),
      ),
    ).toBe(true);
  });

  it('refreshes the official table after active scores update', async () => {
    const h = setup();
    await h.jobs.run('scores');
    expect(h.tournaments.resource).toHaveBeenCalledWith(
      'premier-league',
      'standings',
      2026,
      true,
    );
    expect(h.football.backfill).not.toHaveBeenCalled();
    expect(h.worldCup).not.toHaveBeenCalled();
  });

  it('skips idle score wakeups without writing job state or calling providers', async () => {
    const h = setup();
    const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    h.db.query.mockResolvedValueOnce([
      {
        live: false,
        matchday: false,
        nextKickoff: new Date(Date.now() + 86400000),
        lastSuccessAt: new Date(),
      },
    ]);
    const gate = jest.spyOn(h.jobs, 'runScheduled');
    await h.jobs.localScores();
    await expect(gate.mock.results[0].value).resolves.toMatchObject({
      skipped: true,
      reason: 'no-fixture-today',
    });
    expect(log).not.toHaveBeenCalled();
    expect(h.db.query).toHaveBeenCalledTimes(1);
    const gateCalls = h.db.query.mock.calls as unknown as [string, unknown[]][];
    const gateQuery = gateCalls[0]?.[0];
    expect(gateQuery).toMatch(/^SELECT/);
    expect(h.tournaments.refreshActive).not.toHaveBeenCalled();
    expect(h.tournaments.resource).not.toHaveBeenCalled();
  });

  it.each([
    ['localScores', 'scores', 'Local score refresh completed.'],
    [
      'scheduledSchedules',
      'schedules',
      'Scheduled football schedules refresh completed.',
    ],
  ] as const)(
    'logs %s completion only when a refresh runs',
    async (method, job, message) => {
      const h = setup();
      const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      const run = jest.spyOn(h.jobs, 'runScheduled');
      run.mockResolvedValueOnce({ skipped: true, reason: 'not-due' });
      await h.jobs[method]();
      expect(log).not.toHaveBeenCalled();

      // An overlapping worker can also skip after passing the cadence check.
      run.mockResolvedValueOnce({ skipped: true });
      await h.jobs[method]();
      expect(log).not.toHaveBeenCalled();

      run.mockResolvedValueOnce({ outcomes: [] });
      await h.jobs[method]();
      expect(run).toHaveBeenLastCalledWith(job);
      expect(log).toHaveBeenCalledTimes(1);
      expect(log).toHaveBeenCalledWith(message);
    },
  );

  it('runs scores every five minutes while a match is live', async () => {
    const h = setup();
    h.db.query.mockResolvedValueOnce([
      {
        live: true,
        matchday: true,
        nextKickoff: null,
        lastSuccessAt: new Date(Date.now() - 5 * 60_000),
      },
    ]);
    const run = jest.spyOn(h.jobs, 'run').mockResolvedValue({ outcomes: [] });
    await h.jobs.runScheduled('scores');
    expect(run).toHaveBeenCalledWith('scores');
  });

  it('runs schedule imports weekly regardless of matchday status', async () => {
    const h = setup();
    const run = jest.spyOn(h.jobs, 'run').mockResolvedValue({});
    h.db.query.mockResolvedValueOnce([
      {
        live: false,
        matchday: true,
        nextKickoff: null,
        lastSuccessAt: new Date(Date.now() - 7 * 24 * 60 * 60_000),
      },
    ]);
    await h.jobs.runScheduled('schedules');
    expect(run).toHaveBeenCalledWith('schedules');
    run.mockClear();
    h.db.query.mockResolvedValueOnce([
      {
        live: false,
        matchday: false,
        nextKickoff: null,
        lastSuccessAt: new Date(Date.now() - 60 * 60_000),
      },
    ]);
    await expect(h.jobs.runScheduled('schedules')).resolves.toMatchObject({
      skipped: true,
      reason: 'not-due',
    });
    expect(run).not.toHaveBeenCalled();
  });

  it('continues other tables after one provider fails and records the partial failure', async () => {
    const h = setup();
    h.tournaments.syncAll.mockResolvedValue([
      { id: 'premier-league', season: 2026, fixtures: 380, skipped: false },
      { id: 'la-liga', season: 2026, fixtures: 380, skipped: false },
    ]);
    h.tournaments.resource.mockRejectedValueOnce(
      new Error('Provider unavailable'),
    );
    await expect(h.jobs.run('schedules')).rejects.toThrow(
      'Some competition imports failed',
    );
    expect(h.football.invalidateSnapshots).toHaveBeenCalledTimes(1);
    expect(h.tournaments.resource).toHaveBeenCalledWith(
      'la-liga',
      'standings',
      2026,
      true,
    );
    const errorWrite = h.db.query.mock.calls.find(([sql]) =>
      String(sql).includes('"lastError"=$2'),
    ) as unknown as [string, unknown[]];
    expect(JSON.parse(String(errorWrite[1][2]))).toMatchObject({
      tables: [
        { competition: 'premier-league', error: 'Provider unavailable' },
        { competition: 'la-liga' },
      ],
    });
    expect(
      h.db.query.mock.calls.some(([sql]) =>
        String(sql).includes('"lastSuccessAt"=now()'),
      ),
    ).toBe(false);
  });

  it('does not report a stale fallback as a successful table refresh', async () => {
    const h = setup();
    h.tournaments.resource.mockResolvedValue({ freshness: { stale: true } });
    await expect(h.jobs.run('scores')).rejects.toThrow(
      'Some score updates failed',
    );
    expect(h.football.invalidateSnapshots).toHaveBeenCalledTimes(1);
  });

  it('rejects explicit World Cup imports without provider or database work', async () => {
    const h = setup();
    await expect(
      h.jobs.run('schedules', { competition: 'world-cup' }),
    ).rejects.toThrow('paused');
    expect(h.db.query).not.toHaveBeenCalled();
    expect(h.tournaments.syncAll).not.toHaveBeenCalled();
    expect(h.worldCup).not.toHaveBeenCalled();
  });

  it('catches up missing schedules but avoids repeat startup imports', async () => {
    const h = setup();
    const run = jest.spyOn(h.jobs, 'runScheduled').mockResolvedValue({});
    await h.jobs.catchUp();
    expect(run).toHaveBeenCalledWith('schedules');
    run.mockClear();
    await h.jobs.catchUp();
    expect(run).toHaveBeenCalledWith('schedules');
  });

  it('leaves external scheduler mode in control of periodic imports', async () => {
    const old = process.env.FOOTBALL_SCHEDULER;
    process.env.FOOTBALL_SCHEDULER = 'supabase';
    try {
      const h = setup();
      const run = jest.spyOn(h.jobs, 'runScheduled').mockResolvedValue({});
      h.jobs.onApplicationBootstrap();
      await h.jobs.scheduledSchedules();
      await h.jobs.localScores();
      expect(run).not.toHaveBeenCalled();
      expect(h.db.query).not.toHaveBeenCalled();
    } finally {
      if (old === undefined) delete process.env.FOOTBALL_SCHEDULER;
      else process.env.FOOTBALL_SCHEDULER = old;
    }
  });
});

describe('Football one-shot scheduling', () => {
  const now = Date.parse('2026-11-19T07:00:00Z');
  const minute = 60_000;
  const instances: FootballJobs[] = [];
  let previousScheduler: string | undefined;

  beforeEach(() => {
    previousScheduler = process.env.FOOTBALL_SCHEDULER;
    delete process.env.FOOTBALL_SCHEDULER;
    jest.useFakeTimers({ now });
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });
  afterEach(() => {
    for (const jobs of instances.splice(0)) jobs.onModuleDestroy();
    jest.useRealTimers();
    jest.restoreAllMocks();
    if (previousScheduler === undefined) delete process.env.FOOTBALL_SCHEDULER;
    else process.env.FOOTBALL_SCHEDULER = previousScheduler;
  });

  function timedSetup(overrides: Partial<FootballCadenceState> = {}) {
    const h = setup();
    instances.push(h.jobs);
    const state: FootballCadenceState = {
      live: false,
      matchday: false,
      nextKickoff: new Date(now + 24 * 60 * minute),
      lastSuccessAt: new Date(now),
      ...overrides,
    };
    const successes: Record<ScheduledFootballJob, Date | string | null> = {
      schedules: new Date(now),
      scores: state.lastSuccessAt,
    };
    h.db.query.mockImplementation((sql: string, args: unknown[]) => {
      if (sql.includes(' AS live')) {
        const name = args[1] as ScheduledFootballJob;
        return Promise.resolve([{ ...state, lastSuccessAt: successes[name] }]);
      }
      if (sql.includes('"lastSuccessAt"=now()'))
        successes[args[0] as ScheduledFootballJob] = new Date(Date.now());
      return Promise.resolve([]);
    });
    const gate = jest.spyOn(h.jobs, 'runScheduled');
    const start = async () => {
      h.jobs.onApplicationBootstrap();
      await jest.advanceTimersByTimeAsync(0);
    };
    return { ...h, state, successes, gate, start };
  }

  it('does no idle polling before the weekly import', async () => {
    const h = timedSetup({ nextKickoff: null });
    await h.start();
    h.db.query.mockClear();
    h.gate.mockClear();

    await jest.advanceTimersByTimeAsync(2 * 60 * minute);
    expect(h.db.query).not.toHaveBeenCalled();
    expect(h.gate).not.toHaveBeenCalled();
    expect(h.tournaments.refreshActive).not.toHaveBeenCalled();
    expect(h.tournaments.syncAll).toHaveBeenCalledTimes(0);
    expect(jest.getTimerCount()).toBe(1);
  });

  it('arms no score timer when there are no fixtures, then discovers a new fixture during import', async () => {
    const h = timedSetup({ nextKickoff: null });
    await h.start();
    expect(jest.getTimerCount()).toBe(1);
    h.state.nextKickoff = new Date(now + 30 * minute);
    await h.jobs.run('schedules');
    expect(jest.getTimerCount()).toBe(2);
    await jest.advanceTimersByTimeAsync(30 * minute - 1);
    expect(h.tournaments.refreshActive).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(h.tournaments.refreshActive).toHaveBeenCalledTimes(1);
  });

  it('wakes exactly at kickoff, refreshes live play every five minutes, and sleeps after full time', async () => {
    const h = timedSetup({
      matchday: true,
      nextKickoff: new Date(now + 12 * minute),
    });
    h.tournaments.refreshActive.mockImplementation(() => {
      h.state.nextKickoff = null;
      h.state.live = h.tournaments.refreshActive.mock.calls.length === 1;
      h.state.matchday = h.state.live;
      return Promise.resolve([
        { competitionId: 'premier-league', season: 2026, fixtures: 380 },
      ]);
    });
    await h.start();
    h.db.query.mockClear();
    await jest.advanceTimersByTimeAsync(12 * minute - 1);
    expect(h.db.query).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(h.tournaments.refreshActive).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(5 * minute - 1);
    expect(h.tournaments.refreshActive).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(1);
    expect(h.tournaments.refreshActive).toHaveBeenCalledTimes(2);
    expect(jest.getTimerCount()).toBe(1);
    h.db.query.mockClear();
    await jest.advanceTimersByTimeAsync(10 * minute);
    expect(h.db.query).not.toHaveBeenCalled();
  });

  it('replaces the old timer when imports move kickoff earlier or postpone it', async () => {
    const h = timedSetup({ nextKickoff: new Date(now + 120 * minute) });
    await h.start();
    h.state.nextKickoff = new Date(now + 10 * minute);
    await h.jobs.run('schedules');
    h.state.nextKickoff = new Date(now + 45 * minute);
    await h.jobs.run('schedules');
    await jest.advanceTimersByTimeAsync(45 * minute - 1);
    expect(h.tournaments.refreshActive).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(h.tournaments.refreshActive).toHaveBeenCalledTimes(1);
  });

  it('reconstructs the remaining live interval from persisted success after a restart', async () => {
    const first = timedSetup({ live: true, matchday: true, nextKickoff: null });
    await first.start();
    await jest.advanceTimersByTimeAsync(2 * minute);
    first.jobs.onModuleDestroy();
    expect(jest.getTimerCount()).toBe(0);
    const restarted = timedSetup({
      live: true,
      matchday: true,
      nextKickoff: null,
    });
    await restarted.start();
    await jest.advanceTimersByTimeAsync(3 * minute - 1);
    expect(restarted.tournaments.refreshActive).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(restarted.tournaments.refreshActive).toHaveBeenCalledTimes(1);
    expect(first.tournaments.refreshActive).not.toHaveBeenCalled();
  });

  it('backs off failed scores even when a schedule import replans the timer', async () => {
    const h = timedSetup({
      live: true,
      matchday: true,
      nextKickoff: null,
      lastSuccessAt: null,
    });
    h.tournaments.refreshActive.mockRejectedValueOnce(
      new Error('Provider down'),
    );
    await h.start();
    await jest.advanceTimersByTimeAsync(1);
    expect(h.tournaments.refreshActive).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(minute);
    await h.jobs.run('schedules');
    await jest.advanceTimersByTimeAsync(4 * minute - 1);
    expect(h.tournaments.refreshActive).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(1);
    expect(h.tournaments.refreshActive).toHaveBeenCalledTimes(2);
  });

  it('retries an advisory-lock skip without an immediate timer loop', async () => {
    const h = timedSetup({
      live: true,
      matchday: true,
      nextKickoff: null,
      lastSuccessAt: null,
    });
    h.runner.query.mockResolvedValueOnce([{ locked: false }]);
    await h.start();
    await jest.advanceTimersByTimeAsync(1);
    expect(h.runner.query).toHaveBeenCalledTimes(1);
    expect(h.tournaments.refreshActive).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(5 * minute - 1);
    expect(h.runner.query).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(1);
    expect(h.tournaments.refreshActive).toHaveBeenCalledTimes(1);
  });

  it('recovers a failed startup read without retrying on every timer tick', async () => {
    const h = timedSetup();
    h.successes.schedules = null;
    h.db.query.mockRejectedValueOnce(new Error('Database unavailable'));
    await h.start();
    expect(h.tournaments.syncAll).not.toHaveBeenCalled();
    h.db.query.mockClear();
    await jest.advanceTimersByTimeAsync(5 * minute - 1);
    expect(h.db.query).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(h.gate).toHaveBeenCalledTimes(2);
    expect(h.tournaments.syncAll).toHaveBeenCalledTimes(1);
  });

  it('prevents overlapping local refreshes and never rearms after shutdown during a refresh', async () => {
    const h = timedSetup({
      live: true,
      matchday: true,
      nextKickoff: null,
      lastSuccessAt: null,
    });
    let finish!: (
      value: Array<{ competitionId: string; season: number; fixtures: number }>,
    ) => void;
    h.tournaments.refreshActive.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    await h.start();
    await jest.advanceTimersByTimeAsync(1);
    await h.jobs.localScores();
    await jest.advanceTimersByTimeAsync(10 * minute);
    expect(h.tournaments.refreshActive).toHaveBeenCalledTimes(1);
    h.jobs.onModuleDestroy();
    finish([{ competitionId: 'premier-league', season: 2026, fixtures: 380 }]);
    await jest.advanceTimersByTimeAsync(0);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('does not register process timers in Supabase scheduler mode', async () => {
    process.env.FOOTBALL_SCHEDULER = 'supabase';
    const h = timedSetup();
    await h.start();
    expect(jest.getTimerCount()).toBe(0);
    expect(h.db.query).not.toHaveBeenCalled();
  });
});
