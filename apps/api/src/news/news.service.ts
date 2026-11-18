import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { DataSource } from 'typeorm';
import { TournamentResourceCacheEntity } from '../tournaments/tournament.entities';
import { NEWS_COMPETITIONS } from './news.types';
import type { NewsArticle, NewsCompetitionId, NewsFeed } from './news.types';
import { matchNewsSearch, selectMatchNews } from './match-news';
import type { MatchNewsFixture, MatchNewsSearch } from './match-news';

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
function safeUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

// Currents returns an envelope; never cast the envelope to an article array.
export function normalizeNews(
  body: unknown,
  competitionId?: NewsCompetitionId,
): NewsArticle[] {
  const rows = Array.isArray(body)
    ? body
    : object(body) && Array.isArray(body.news)
      ? body.news
      : null;
  if (!rows || (object(body) && body.status === 'error'))
    throw new ServiceUnavailableException('News is temporarily unavailable.');
  const seen = new Set<string>();
  const articles: NewsArticle[] = [];
  for (const row of rows) {
    if (
      !object(row) ||
      typeof row.title !== 'string' ||
      !row.title.trim() ||
      typeof row.published !== 'string'
    )
      continue;
    const url = safeUrl(row.url);
    const published = Date.parse(row.published);
    if (!url || !Number.isFinite(published) || seen.has(url)) continue;
    seen.add(url);
    articles.push({
      id:
        typeof row.id === 'string' && row.id
          ? row.id
          : createHash('sha256').update(url).digest('hex'),
      title: row.title.trim(),
      description: typeof row.description === 'string' ? row.description : '',
      url,
      author: typeof row.author === 'string' ? row.author : '',
      image: safeUrl(row.image),
      language: typeof row.language === 'string' ? row.language : 'en',
      category: Array.isArray(row.category)
        ? row.category.filter(
            (item): item is string => typeof item === 'string',
          )
        : [],
      source_category: Array.isArray(row.source_category)
        ? row.source_category.filter(
            (item): item is string => typeof item === 'string',
          )
        : [],
      published: new Date(published).toISOString(),
      ...(competitionId ? { competitionId } : {}),
    });
  }
  if (rows.length && !articles.length)
    throw new ServiceUnavailableException('News is temporarily unavailable.');
  return articles
    .sort((a, b) => Date.parse(b.published) - Date.parse(a.published))
    .slice(0, 20);
}

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly pending = new Map<string, Promise<NewsFeed>>();
  private retryAfter = 0;
  constructor(private readonly db: DataSource) {}

  getMatchNews(fixture: MatchNewsFixture): Promise<NewsFeed> {
    if (fixture.competitionId === 'world-cup')
      throw new NotFoundException('News competition not supported.');
    const search = matchNewsSearch(fixture);
    return this.feed(
      search.key,
      search.query,
      search.competitionId,
      false,
      search,
    );
  }

  getCompetitionNews(id: string): Promise<NewsFeed> {
    if (
      id === 'world-cup' ||
      !Object.prototype.hasOwnProperty.call(NEWS_COMPETITIONS, id)
    )
      throw new NotFoundException('News competition not supported.');
    const competitionId = id as NewsCompetitionId;
    return this.feed(
      `news:v1:competition:${id}`,
      NEWS_COMPETITIONS[competitionId].query,
      competitionId,
    );
  }

  async getLatestNews(): Promise<NewsFeed> {
    const ids = Object.keys(NEWS_COMPETITIONS).filter(
      (id) => id !== 'world-cup',
    ) as NewsCompetitionId[];
    const results = await Promise.allSettled(
      ids.map((id) => this.getCompetitionNews(id)),
    );
    const news: NewsArticle[] = [];
    const errors: Partial<Record<NewsCompetitionId, string>> = {};
    const times: string[] = [];
    let stale = false;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        news.push(...result.value.news);
        times.push(result.value.freshness.fetchedAt);
        stale ||= result.value.freshness.stale;
      } else {
        errors[ids[index]] =
          `${NEWS_COMPETITIONS[ids[index]].name} news is temporarily unavailable.`;
      }
    });
    if (!times.length)
      throw new ServiceUnavailableException('News is temporarily unavailable.');
    const seen = new Set<string>();
    return {
      news: news
        .sort((a, b) => Date.parse(b.published) - Date.parse(a.published))
        .filter((article) => {
          if (seen.has(article.url)) return false;
          seen.add(article.url);
          return true;
        }),
      freshness: { fetchedAt: times.sort()[0], stale },
      errors,
    };
  }

  getNewsByKeywords(keywords: string): Promise<NewsFeed> {
    const query = keywords.trim();
    if (!query || query.length > 120)
      throw new BadRequestException(
        'News keywords must contain 1 to 120 characters.',
      );
    return this.feed(
      `news:v1:keywords:${createHash('sha256').update(query.toLowerCase()).digest('hex')}`,
      query,
      undefined,
      true,
    );
  }

  private feed(
    key: string,
    query: string,
    competitionId?: NewsCompetitionId,
    keywords = false,
    matchSearch?: MatchNewsSearch,
  ): Promise<NewsFeed> {
    const pending = this.pending.get(key);
    if (pending) return pending;
    const result = this.cachedFeed(
      key,
      query,
      competitionId,
      keywords,
      matchSearch,
    ).finally(() => this.pending.delete(key));
    this.pending.set(key, result);
    return result;
  }

  private async cachedFeed(
    key: string,
    query: string,
    competitionId?: NewsCompetitionId,
    keywords = false,
    matchSearch?: MatchNewsSearch,
  ): Promise<NewsFeed> {
    const repository = this.db.getRepository(TournamentResourceCacheEntity);
    let saved = await repository.findOneBy({ key });
    const response = (
      row: TournamentResourceCacheEntity,
      stale: boolean,
    ): NewsFeed => ({
      news: row.payload.news as NewsArticle[],
      freshness: { fetchedAt: row.fetchedAt.toISOString(), stale },
    });
    if (saved && saved.expiresAt.getTime() > Date.now())
      return response(saved, false);
    const runner = this.db.createQueryRunner();
    try {
      await runner.connect();
      await runner.startTransaction();
      const deadline = Date.now() + 20_000;
      while (true) {
        const rows = (await runner.query(
          'SELECT pg_try_advisory_xact_lock(hashtext($1)) AS locked',
          [key],
        )) as Array<{ locked: boolean }>;
        if (rows[0]?.locked) break;
        saved = await runner.manager
          .getRepository(TournamentResourceCacheEntity)
          .findOneBy({ key });
        if (saved)
          return response(saved, saved.expiresAt.getTime() <= Date.now());
        if (Date.now() >= deadline)
          throw new ServiceUnavailableException(
            'News is temporarily unavailable.',
          );
        await sleep(100);
      }
      saved = await runner.manager
        .getRepository(TournamentResourceCacheEntity)
        .findOneBy({ key });
      if (saved && saved.expiresAt.getTime() > Date.now())
        return response(saved, false);
      if (Date.now() < this.retryAfter)
        throw new ServiceUnavailableException(
          'News is temporarily unavailable.',
        );
      const apiUrl = process.env.NEWS_API_URL;
      const apiKey = process.env.NEWS_API_TOKEN;
      if (!apiUrl || !apiKey)
        throw new ServiceUnavailableException(
          'News is temporarily unavailable.',
        );
      const url = new URL('/v1/search', apiUrl);
      url.searchParams.set(keywords ? 'keywords' : 'query', query);
      url.searchParams.set('language', 'en');
      url.searchParams.set('page_size', '20');
      url.searchParams.set('category', 'sports');
      url.searchParams.set('type', '1');
      if (matchSearch) {
        url.searchParams.set('start_date', matchSearch.startDate);
        url.searchParams.set('end_date', matchSearch.endDate);
      }
      const result = await fetch(url, {
        headers: {
          Authorization: apiKey.startsWith('Bearer ')
            ? apiKey
            : `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(15_000),
      });
      if (result.status === 429) {
        const retry = result.headers.get('Retry-After');
        const seconds = Number(retry);
        this.retryAfter =
          Date.now() +
          (retry && Number.isFinite(seconds)
            ? Math.max(60_000, seconds * 1000)
            : 60_000);
      }
      if (!result.ok)
        throw new ServiceUnavailableException(
          'News is temporarily unavailable.',
        );
      const normalized = normalizeNews(
        (await result.json()) as unknown,
        competitionId,
      );
      const news = matchSearch
        ? selectMatchNews(normalized, matchSearch)
        : normalized;
      const fetchedAt = new Date();
      // One shared hourly cache per competition, not one provider call per visitor.
      const row = repository.create({
        key,
        payload: { news },
        fetchedAt,
        expiresAt: new Date(
          fetchedAt.getTime() +
            (matchSearch ? (news.length ? 600_000 : 60_000) : 3_600_000),
        ),
      });
      await runner.manager
        .getRepository(TournamentResourceCacheEntity)
        .save(row);
      await runner.commitTransaction();
      return response(row, false);
    } catch {
      this.logger.warn(
        `News feed ${competitionId ?? 'search'} could not refresh.`,
      );
      if (saved && Date.now() - saved.fetchedAt.getTime() < 86_400_000)
        return response(saved, true);
      throw new ServiceUnavailableException('News is temporarily unavailable.');
    } finally {
      if (runner.isTransactionActive) await runner.rollbackTransaction();
      await runner.release();
    }
  }
}
