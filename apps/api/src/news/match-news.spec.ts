import {
  matchNewsRelevance,
  matchNewsSearch,
  selectMatchNews,
} from './match-news';
import type { MatchNewsFixture } from './match-news';
import type { NewsArticle } from './news.types';

const fixture: MatchNewsFixture = {
  id: '564746',
  competitionId: 'la-liga',
  kickoff: '2026-11-08T20:00:00Z',
  homeTeam: { name: 'Club Atlético de Madrid', shortName: 'Atleti' },
  awayTeam: { name: 'FC Barcelona', shortName: 'Barça' },
};
const now = Date.parse('2026-11-16T12:00:00Z');
const article = (overrides: Partial<NewsArticle> = {}): NewsArticle => ({
  id: 'report',
  title: 'Barcelona beat Atletico Madrid 2-1',
  description: 'Fermin scores twice in a comeback win.',
  url: 'https://publisher.example/match-report',
  published: '2026-11-08T23:00:00Z',
  author: '',
  image: null,
  language: 'en',
  category: ['sports'],
  source_category: [],
  ...overrides,
});

describe('Fixture news search and relevance', () => {
  it('searches both opponents with common aliases and a bounded match-date window', () => {
    const search = matchNewsSearch(fixture, now);
    expect(search.query).toContain(' AND ');
    expect(search.query).toContain('"atletico"');
    expect(search.query).toContain('"barcelona"');
    expect(search.query).toContain('"barca"');
    expect(search.startDate).toBe('2026-11-06T20:00:00.000Z');
    expect(search.endDate).toBe('2026-11-10T20:00:00.000Z');
    expect(
      Date.parse(search.endDate) - Date.parse(search.startDate),
    ).toBeLessThanOrEqual(7 * 86400000);
  });
  it('keeps cache keys stable between visits and invalidates rescheduled fixtures', () => {
    expect(matchNewsSearch(fixture, now).key).toBe(
      matchNewsSearch(fixture, now + 3600000).key,
    );
    expect(
      matchNewsSearch({ ...fixture, kickoff: '2026-11-09T20:00:00Z' }, now).key,
    ).not.toBe(matchNewsSearch(fixture, now).key);
  });
  it('never sends a future-only or oversized window for a distant upcoming game', () => {
    const search = matchNewsSearch(
      { ...fixture, kickoff: '2027-02-01T12:00:00Z' },
      now,
    );
    expect(Date.parse(search.endDate)).toBe(now);
    expect(Date.parse(search.startDate)).toBeLessThan(now);
    expect(
      Date.parse(search.endDate) - Date.parse(search.startDate),
    ).toBeLessThanOrEqual(7 * 86400000);
  });
  it('accepts accent variants and match URLs but excludes unrelated teams and old meetings', () => {
    const search = matchNewsSearch(fixture, now);
    expect(
      matchNewsRelevance(
        article({ title: 'Barça win at Atlético de Madrid' }),
        search,
      ),
    ).toBeGreaterThan(0);
    expect(
      matchNewsRelevance(
        article({
          title: 'Fermin inspires comeback win',
          description: 'A memorable night.',
          url: 'https://publisher.example/atletico-madrid-barcelona-match-report',
        }),
        search,
      ),
    ).toBeGreaterThan(0);
    expect(
      matchNewsRelevance(
        article({
          title: 'Barcelona beat Real Madrid',
          description: 'Another win.',
        }),
        search,
      ),
    ).toBe(-1);
    expect(
      matchNewsRelevance(
        article({ published: '2026-10-01T12:00:00Z' }),
        search,
      ),
    ).toBe(-1);
  });
  it('drops transfer stories mentioning both clubs and ranks direct match reports first', () => {
    const search = matchNewsSearch(fixture, now);
    const transfer = article({
      id: 'transfer',
      title: 'Atletico Madrid star wants to join Barcelona',
      description: 'His future is uncertain after their last match.',
    });
    const reaction = article({
      id: 'reaction',
      title: 'Flick explains comeback win',
      description: 'Barcelona beat Atletico Madrid after a brace.',
    });
    const selected = selectMatchNews([reaction, transfer, article()], search);
    expect(selected.map((a) => a.id)).toEqual(['report', 'reaction']);
  });

  it('prefers post-match reports over starting-lineup previews once a fixture is finished', () => {
    const search = matchNewsSearch({ ...fixture, status: 'FINISHED' }, now);
    const preview = article({
      id: 'preview',
      title: 'Atletico Madrid vs Barcelona starting XI preview',
      published: '2026-11-08T19:00:00Z',
    });
    expect(
      selectMatchNews([preview, article()], search).map((a) => a.id),
    ).toEqual(['report', 'preview']);
    expect(search.key).not.toBe(
      matchNewsSearch({ ...fixture, status: 'TIMED' }, now).key,
    );
  });
});
