/* eslint-disable @typescript-eslint/require-await -- Async mocks implement database/HTTP interfaces without I/O. */
import { DataSource } from 'typeorm';
import { FootballDataClient } from './football-data.client';

function setup() {
  let state: { payload: Record<string, number> } | null = null;
  const repository = {
    findOneBy: jest.fn(async () => state),
    save: jest.fn(async (row: { payload: Record<string, number> }) => {
      state = row;
    }),
  };
  const query = jest.fn();
  const db = {
    transaction: async (
      fn: (manager: {
        query: typeof query;
        getRepository: () => typeof repository;
      }) => Promise<unknown>,
    ) => fn({ query, getRepository: () => repository }),
  } as unknown as DataSource;
  return { client: new FootballDataClient(db), repository, query };
}

describe('FootballDataClient', () => {
  const originalFetch = global.fetch;
  const originalToken = process.env.FOOTBALL_DATA_API_KEY;
  beforeEach(() => {
    process.env.FOOTBALL_DATA_API_KEY = 'test-token';
  });
  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
    if (originalToken === undefined) delete process.env.FOOTBALL_DATA_API_KEY;
    else process.env.FOOTBALL_DATA_API_KEY = originalToken;
  });

  it('shares in-flight requests and sends credentials and lineup flags only to the provider', async () => {
    const { client } = setup();
    global.fetch = jest.fn(
      async () => new Response(JSON.stringify({ id: 10 })),
    ) as jest.Mock;
    expect(
      await Promise.all([
        client.get('/matches/10', { unfoldLineups: true }),
        client.get('/matches/10', { unfoldLineups: true }),
      ]),
    ).toEqual([{ id: 10 }, { id: 10 }]);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.football-data.org/v4/matches/10',
      expect.objectContaining({
        headers: { 'X-Auth-Token': 'test-token', 'X-Unfold-Lineups': 'true' },
        signal: expect.any(AbortSignal) as AbortSignal,
      }),
    );
  });

  it('spaces request slots using the shared database budget', async () => {
    jest.useFakeTimers();
    const { client, query } = setup();
    global.fetch = jest.fn(async () => new Response('{}')) as jest.Mock;
    await client.get('/matches/1');
    const second = client.get('/matches/2');
    await jest.advanceTimersByTimeAsync(7499);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(1);
    await second;
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('pg_advisory_xact_lock'),
    );
  });

  it('records provider cooldown and refuses another call until the budget is available', async () => {
    const { client, repository } = setup();
    global.fetch = jest.fn(
      async () =>
        new Response('{}', { status: 429, headers: { 'Retry-After': '60' } }),
    ) as jest.Mock;
    await expect(client.get('/matches/1')).rejects.toThrow('temporarily busy');
    expect(repository.save).toHaveBeenLastCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          cooldownUntil: expect.any(Number) as number,
        }) as Record<string, number>,
      }),
    );
    await expect(client.get('/matches/2')).rejects.toThrow('temporarily busy');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it.each([401, 403, 500])(
    'sanitizes provider HTTP %s failures',
    async (status) => {
      const { client } = setup();
      global.fetch = jest.fn(
        async () => new Response('secret provider body', { status }),
      ) as jest.Mock;
      await expect(client.get('/matches/1')).rejects.toThrow(
        status === 500 ? 'temporarily unavailable' : 'access is unavailable',
      );
    },
  );

  it('handles timeout/network errors and missing configuration without exposing secrets', async () => {
    const { client } = setup();
    global.fetch = jest
      .fn()
      .mockRejectedValue(
        new DOMException('private transport information', 'TimeoutError'),
      );
    await expect(client.get('/matches/1')).rejects.toThrow(
      'temporarily unavailable',
    );
    delete process.env.FOOTBALL_DATA_API_KEY;
    await expect(client.get('/matches/2')).rejects.toThrow('not configured');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
