/* eslint-disable @typescript-eslint/require-await -- Async database and fetch mocks implement promise-based interfaces without I/O. */
import { DataSource } from 'typeorm';
import { NewsService, normalizeNews } from './news.service';
import { NEWS_COMPETITIONS } from './news.types';
import type { NewsFeed } from './news.types';
import { TournamentResourceCacheEntity } from '../tournaments/tournament.entities';
const requestUrl = (input: Parameters<typeof fetch>[0]) =>
  new URL(
    input instanceof URL
      ? input.href
      : typeof input === 'string'
        ? input
        : input.url,
  );

const article = (id = 'one') => ({
  id,
  title: `Football headline ${id}`,
  description: 'Article preview',
  url: `https://publisher.example/story/${id}`,
  author: 'Reporter',
  image: 'None',
  language: 'en',
  category: ['sports'],
  source_category: ['sports'],
  published: '2026-10-18 12:00:00 +0000',
});

function setup() {
  const records = new Map<string, TournamentResourceCacheEntity>();
  const locks = new Set<string>();
  const repository = {
    findOneBy: jest.fn(
      async ({ key }: { key: string }) => records.get(key) ?? null,
    ),
    create: (row: TournamentResourceCacheEntity) => row,
    save: jest.fn(async (row: TournamentResourceCacheEntity) => {
      records.set(row.key, row);
      return row;
    }),
  };
  const db = {
    getRepository: () => repository,
    createQueryRunner: () => {
      const held = new Set<string>();
      const unlock = () => {
        for (const key of held) locks.delete(key);
        held.clear();
      };
      return {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(unlock),
        rollbackTransaction: jest.fn(unlock),
        release: jest.fn(unlock),
        isTransactionActive: true,
        manager: { getRepository: () => repository },
        query: jest.fn(async (_sql: string, [key]: string[]) => {
          if (locks.has(key)) return [{ locked: false }];
          locks.add(key);
          held.add(key);
          return [{ locked: true }];
        }),
      };
    },
  } as unknown as DataSource;
  return {
    service: new NewsService(db),
    second: new NewsService(db),
    records,
    repository,
  };
}

describe('NewsService', () => {
  const originalFetch = global.fetch;
  const originalUrl = process.env.NEWS_API_URL;
  const originalToken = process.env.NEWS_API_TOKEN;
  beforeEach(() => {
    process.env.NEWS_API_URL = 'https://news-provider.example/v1/';
    process.env.NEWS_API_TOKEN = 'test-secret';
    global.fetch = jest.fn(
      async () =>
        new Response(JSON.stringify({ status: 'ok', news: [article()] })),
    );
  });
  afterEach(() => {
    global.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.NEWS_API_URL;
    else process.env.NEWS_API_URL = originalUrl;
    if (originalToken === undefined) delete process.env.NEWS_API_TOKEN;
    else process.env.NEWS_API_TOKEN = originalToken;
  });

  it('normalizes envelopes, dates and missing images while removing malformed and duplicate items', () => {
    const rows = normalizeNews(
      {
        news: [
          article(),
          article(),
          { ...article('two'), url: 'javascript:alert(1)' },
          { ...article('three'), published: 'invalid' },
        ],
      },
      'ucl',
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].image).toBeNull();
    expect(rows[0].published).toBe('2026-10-18T12:00:00.000Z');
    expect(rows[0].competitionId).toBe('ucl');
    expect(normalizeNews({ news: [] })).toEqual([]);
    expect(() => normalizeNews({ status: 'error', news: [] })).toThrow(
      'temporarily unavailable',
    );
    expect(() =>
      normalizeNews({ news: [{ title: 'invalid article' }] }),
    ).toThrow('temporarily unavailable');
  });

  it('uses a different football query per competition and keeps provider authentication on the backend', async () => {
    const { service } = setup();
    for (const id of Object.keys(NEWS_COMPETITIONS).filter(
      (id) => id !== 'world-cup',
    )) {
      const feed = await service.getCompetitionNews(id);
      expect(feed.news[0].competitionId).toBe(id);
    }
    const calls = (global.fetch as jest.MockedFunction<typeof fetch>).mock
      .calls;
    expect(calls).toHaveLength(4);
    expect(
      new Set(calls.map(([url]) => requestUrl(url).searchParams.get('query')))
        .size,
    ).toBe(4);
    for (const [url, options] of calls) {
      expect(requestUrl(url).pathname).toBe('/v1/search');
      expect(requestUrl(url).searchParams.get('category')).toBe('sports');
      expect(requestUrl(url).searchParams.get('type')).toBe('1');
      expect(options?.headers).toEqual({ Authorization: 'Bearer test-secret' });
    }
  });

  it('shares the hourly cache across backend instances and never refetches fresh feeds', async () => {
    const { service, second, records } = setup();
    const first = await service.getCompetitionNews('premier-league');
    expect(await second.getCompetitionNews('premier-league')).toEqual(first);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const record = records.get('news:v1:competition:premier-league')!;
    expect(record.expiresAt.getTime() - record.fetchedAt.getTime()).toBe(
      3_600_000,
    );
  });

  it('searches the match date and persists relevant match news separately from league headlines', async () => {
    const { service, second, records } = setup();
    const kickoff = new Date(Date.now() - 86400000).toISOString();
    global.fetch = jest.fn(
      async () =>
        new Response(
          JSON.stringify({
            news: [
              {
                ...article(),
                title: 'Barcelona beat Atletico Madrid in comeback win',
                published: new Date(
                  Date.parse(kickoff) + 3600000,
                ).toISOString(),
              },
            ],
          }),
        ),
    );
    const fixture = {
      id: '564746',
      competitionId: 'la-liga' as const,
      kickoff,
      homeTeam: { name: 'Club Atlético de Madrid', shortName: 'Atleti' },
      awayTeam: { name: 'FC Barcelona', shortName: 'Barça' },
    };
    const result = await service.getMatchNews(fixture);
    expect(result.news).toHaveLength(1);
    const url = requestUrl(
      (global.fetch as jest.MockedFunction<typeof fetch>).mock.calls[0][0],
    );
    expect(url.searchParams.get('query')).toContain(' AND ');
    expect(url.searchParams.get('start_date')).toBeTruthy();
    expect(url.searchParams.get('end_date')).toBeTruthy();
    expect([...records.keys()][0]).toMatch(/^news:v2:match:564746:/);
    expect(await second.getMatchNews(fixture)).toEqual(result);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    [...records.values()][0].expiresAt = new Date(0);
    global.fetch = jest.fn(async () => new Response('{}', { status: 503 }));
    expect((await service.getMatchNews(fixture)).freshness.stale).toBe(true);
  });

  it('retries genuinely empty match coverage after a short cache interval', async () => {
    const { service, records } = setup();
    global.fetch = jest.fn(
      async () => new Response(JSON.stringify({ news: [] })),
    );
    await service.getMatchNews({
      id: 'future',
      competitionId: 'la-liga',
      kickoff: new Date().toISOString(),
      homeTeam: { name: 'Atletico Madrid' },
      awayTeam: { name: 'Barcelona' },
    });
    const record = [...records.values()][0];
    expect(record.expiresAt.getTime() - record.fetchedAt.getTime()).toBe(60000);
  });

  it('deduplicates simultaneous requests for the same competition', async () => {
    const { service } = setup();
    const [first, second] = await Promise.all([
      service.getCompetitionNews('ucl'),
      service.getCompetitionNews('ucl'),
    ]);
    expect(first).toEqual(second);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('returns saved stories with stale metadata on provider failure and preserves the cache', async () => {
    const { service, records } = setup();
    const first = await service.getCompetitionNews('la-liga');
    records.get('news:v1:competition:la-liga')!.expiresAt = new Date(0);
    global.fetch = jest.fn(
      async () => new Response('unavailable', { status: 500 }),
    );
    const fallback = await service.getCompetitionNews('la-liga');
    expect(fallback.news).toEqual(first.news);
    expect(fallback.freshness.stale).toBe(true);
    expect(records.get('news:v1:competition:la-liga')!.payload.news).toEqual(
      first.news,
    );
  });

  it('handles rate limits without repeated immediate provider calls', async () => {
    const { service } = setup();
    global.fetch = jest.fn(
      async () =>
        new Response('{}', { status: 429, headers: { 'Retry-After': '120' } }),
    );
    await expect(service.getCompetitionNews('ucl')).rejects.toThrow(
      'temporarily unavailable',
    );
    await expect(service.getCompetitionNews('ucl')).rejects.toThrow(
      'temporarily unavailable',
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid competitions and keywords without making provider calls', () => {
    const { service } = setup();
    expect(() => service.getCompetitionNews('__proto__')).toThrow(
      'not supported',
    );
    expect(() => service.getNewsByKeywords(' ')).toThrow();
    expect(() => service.getCompetitionNews('world-cup')).toThrow(
      'not supported',
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('combines available competitions, sorts by date, deduplicates source URLs and reports partial failures', async () => {
    const { service } = setup();
    jest
      .spyOn(service, 'getCompetitionNews')
      .mockImplementation(async (id): Promise<NewsFeed> => {
        if (id === 'la-liga') throw new Error('offline');
        return {
          news: normalizeNews(
            { news: [article(id === 'ucl' ? 'duplicate' : 'one')] },
            id as keyof typeof NEWS_COMPETITIONS,
          ),
          freshness: {
            fetchedAt: new Date().toISOString(),
            stale: id === 'ucl',
          },
        };
      });
    const feed = await service.getLatestNews();
    expect(feed.news).toHaveLength(2);
    expect(feed.errors?.['la-liga']).toContain('temporarily unavailable');
    expect(feed.freshness.stale).toBe(true);
  });

  it('returns a controlled failure when all competition feeds are unavailable', async () => {
    const { service } = setup();
    jest
      .spyOn(service, 'getCompetitionNews')
      .mockRejectedValue(new Error('offline'));
    await expect(service.getLatestNews()).rejects.toThrow(
      'temporarily unavailable',
    );
  });

  it('sanitizes timeouts and missing credentials without serving mock headlines', async () => {
    const { service } = setup();
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error('sensitive transport error'));
    await expect(service.getCompetitionNews('premier-league')).rejects.toThrow(
      'News is temporarily unavailable.',
    );
    delete process.env.NEWS_API_TOKEN;
    await expect(service.getCompetitionNews('premier-league')).rejects.toThrow(
      'News is temporarily unavailable.',
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
