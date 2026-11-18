import { DataSource } from 'typeorm';
import { FootballJobs } from './football.jobs';
import { FootballService } from './football.service';
import { TournamentsService } from '../tournaments/tournaments.service';
import { FootballDataClient } from '../football-data/football-data.client';

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
  const football = { backfill: jest.fn().mockResolvedValue({ catalog: 100 }) };
  const jobs = new FootballJobs(
    db as unknown as DataSource,
    football as unknown as FootballService,
    tournaments as unknown as TournamentsService,
    {} as FootballDataClient,
  );
  const worldCup = jest
    .spyOn(jobs, 'refreshWorldCup')
    .mockResolvedValue({ fixtures: 104 });
  return { jobs, db, tournaments, football, worldCup };
}

describe('Backend fixture and official-table synchronization', () => {
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
    h.db.query.mockResolvedValueOnce([
      {
        live: false,
        matchday: false,
        nextKickoff: new Date(Date.now() + 86400000),
        lastSuccessAt: new Date(),
      },
    ]);
    await expect(h.jobs.runScheduled('scores')).resolves.toMatchObject({
      skipped: true,
      reason: 'no-fixture-today',
    });
    expect(h.db.query).toHaveBeenCalledTimes(1);
    const gateCalls = h.db.query.mock.calls as unknown as [string, unknown[]][];
    const gateQuery = gateCalls[0]?.[0];
    expect(gateQuery).toMatch(/^SELECT/);
    expect(h.tournaments.refreshActive).not.toHaveBeenCalled();
    expect(h.tournaments.resource).not.toHaveBeenCalled();
  });

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

  it('runs schedule imports hourly on matchdays and every two hours otherwise', async () => {
    const h = setup();
    const run = jest.spyOn(h.jobs, 'run').mockResolvedValue({});
    h.db.query.mockResolvedValueOnce([
      {
        live: false,
        matchday: true,
        nextKickoff: null,
        lastSuccessAt: new Date(Date.now() - 60 * 60_000),
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
