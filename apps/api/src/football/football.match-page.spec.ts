import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  MatchPageReader,
  normalizeMatchPageQuery,
} from './football.match-page';

const rows = Array.from({ length: 25 }, (_, index) => ({
  id: index + 1,
  competitionId: 'premier-league',
  season: 2026,
  kickoff: new Date(Date.UTC(2026, 10, 28 + index)),
  status: 'SCHEDULED',
  homeScore: null,
  awayScore: null,
  homeId: '57',
  awayId: '61',
  homeName: 'Arsenal',
  awayName: 'Chelsea',
  homeShortName: 'ARS',
  awayShortName: 'CHE',
  homeCrest: 'https://example.com/arsenal.png',
  awayCrest: null,
  stage: 'REGULAR_SEASON',
  matchday: String(index + 1),
  minute: null,
  injuryTime: null,
})).concat([
  {
    id: 100,
    competitionId: 'la-liga',
    season: 2026,
    kickoff: new Date(Date.UTC(2026, 11, 1)),
    status: 'SCHEDULED',
    homeScore: null,
    awayScore: null,
    homeId: '57',
    awayId: '61',
    homeName: 'Arsenal',
    awayName: 'Chelsea',
    homeShortName: 'ARS',
    awayShortName: 'CHE',
    homeCrest: 'https://example.com/arsenal.png',
    awayCrest: null,
    stage: 'REGULAR_SEASON',
    matchday: '1',
    minute: null,
    injuryTime: null,
  },
]);

function setup() {
  const query = jest.fn((sql: string, args: unknown[]) => {
    if (sql.includes('DISTINCT ON (s."competitionId")'))
      return Promise.resolve(
        ['premier-league', 'la-liga'].map((competitionId) => ({
          competitionId,
          season: 2026,
          name:
            competitionId === 'la-liga' ? 'Primera Division' : 'Premier League',
          emblem: null,
          region: '',
          endDate: '2027-06-01',
          currentMatchday: 1,
          lastSyncedAt: new Date(),
        })),
      );
    if (sql.includes('array_remove(array_agg'))
      return Promise.resolve(
        ['premier-league', 'la-liga'].map((competitionId) => ({
          competitionId,
          stages: ['REGULAR_SEASON'],
          fixtureCount: rows.filter(
            (row) => row.competitionId === competitionId,
          ).length,
          observedAt: new Date(),
          hasLive: false,
        })),
      );
    const selected = rows.filter(
      (row) => !args[2] || row.competitionId === args[2],
    );
    if (sql.includes('count(*)::int AS total'))
      return Promise.resolve([{ total: selected.length }]);
    if (sql.includes('LIMIT $10 OFFSET $11'))
      return Promise.resolve(
        selected.slice(Number(args[10]), Number(args[10]) + Number(args[9])),
      );
    throw new Error(`Unexpected query: ${sql}`);
  });
  return {
    query,
    reader: new MatchPageReader({ query } as unknown as DataSource),
  };
}

describe('paginated public match reads', () => {
  it('validates tournament and page bounds', () => {
    expect(() => normalizeMatchPageQuery({ competition: 'world-cup' })).toThrow(
      BadRequestException,
    );
    expect(() => normalizeMatchPageQuery({ page: '0' })).toThrow(
      BadRequestException,
    );
    expect(() => normalizeMatchPageQuery({ pageSize: '51' })).toThrow(
      BadRequestException,
    );
    expect(() => normalizeMatchPageQuery({ page: '1.5' })).toThrow(
      BadRequestException,
    );
    expect(() =>
      normalizeMatchPageQuery({ stage: ['A', 'B'] as unknown as string }),
    ).toThrow(BadRequestException);
  });

  it('uses database pagination, stable ordering and only card fields', async () => {
    const { reader, query } = setup();
    const first = await reader.get({
      competition: 'premier-league',
      page: '1',
      pageSize: '20',
    });
    const second = await reader.get({
      competition: 'premier-league',
      page: '2',
      pageSize: '20',
    });
    expect(first.data).toHaveLength(20);
    expect(second.data).toHaveLength(5);
    expect(first.data[0].match.id).toBe('1');
    expect(second.data[0].match.id).toBe('21');
    expect(second.pagination).toMatchObject({
      total: 25,
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true,
    });
    const paged = query.mock.calls.filter(([sql]) =>
      sql.includes('LIMIT $10 OFFSET $11'),
    );
    expect(paged[1][1].slice(-2)).toEqual([20, 20]);
    expect(paged[0][0]).toContain('f.id ASC');
    expect(paged[0][0]).toContain("f.payload->'homeTeam'->>'name'");
    expect(paged[0][0]).not.toMatch(/SELECT\s+\*/i);
  });

  it('separates tournament and page cache keys and coalesces identical requests', async () => {
    const { reader, query } = setup();
    const [one, duplicate] = await Promise.all([
      reader.get({ competition: 'premier-league', page: '1' }),
      reader.get({ competition: 'premier-league', page: '1' }),
    ]);
    expect(duplicate).toBe(one);
    const countAfterFirst = query.mock.calls.length;
    expect(await reader.get({ competition: 'premier-league', page: '1' })).toBe(
      one,
    );
    expect(query).toHaveBeenCalledTimes(countAfterFirst);
    const other = await reader.get({ competition: 'la-liga', page: '1' });
    expect(other.data).toHaveLength(1);
    expect(other.data[0].match.competitionId).toBe('la-liga');
    expect(query.mock.calls.length).toBeGreaterThan(countAfterFirst);
  });

  it('returns an empty page for an empty tournament', async () => {
    const { reader } = setup();
    const page = await reader.get({ competition: 'ucl', page: '1' });
    expect(page.data).toEqual([]);
    expect(page.pagination).toMatchObject({
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });
});
