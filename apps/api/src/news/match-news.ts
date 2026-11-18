import { createHash } from 'node:crypto';
import type { NewsArticle, NewsCompetitionId } from './news.types';

export type MatchNewsFixture = {
  id: string;
  competitionId: NewsCompetitionId;
  kickoff: string;
  status?: string;
  homeTeam: { name: string; shortName?: string };
  awayTeam: { name: string; shortName?: string };
};
export type MatchNewsSearch = {
  key: string;
  query: string;
  competitionId: NewsCompetitionId;
  kickoff: number;
  finished: boolean;
  startDate: string;
  endDate: string;
  homeAliases: string[];
  awayAliases: string[];
};

const fold = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
function aliases(team: MatchNewsFixture['homeTeam']) {
  const names = [team.name, team.shortName ?? ''].map(fold);
  const variants = names.flatMap((name) => [
    name,
    name
      .replace(/\b(club|fc|cf|afc|sc)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
    name
      .replace(/\b(club|football|futbol|fc|cf|afc|sc|de)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  ]);
  if (variants.includes('atletico madrid')) variants.push('atletico');
  return [...new Set(variants.filter((name) => name.length >= 3))];
}

export function matchNewsSearch(
  fixture: MatchNewsFixture,
  now = Date.now(),
): MatchNewsSearch {
  const kickoff = Date.parse(fixture.kickoff);
  const finished = fixture.status?.toUpperCase() === 'FINISHED';
  if (!Number.isFinite(kickoff)) throw new Error('Invalid match kickoff.');
  const homeAliases = aliases(fixture.homeTeam),
    awayAliases = aliases(fixture.awayTeam);
  if (!homeAliases.length || !awayAliases.length)
    throw new Error('Confirmed opponents are required for match news.');
  const day = 86400000;
  const end = Math.min(kickoff + 2 * day, now);
  const start = Math.min(kickoff - 2 * day, end - 2 * day);
  const terms = (names: string[]) =>
    `(${names.map((name) => `"${name}"`).join(' OR ')})`;
  const digest = createHash('sha256')
    .update(
      JSON.stringify([
        fixture.competitionId,
        fixture.kickoff,
        finished,
        homeAliases,
        awayAliases,
      ]),
    )
    .digest('hex')
    .slice(0, 20);
  return {
    key: `news:v2:match:${fixture.id}:${digest}`,
    query: `${terms(homeAliases)} AND ${terms(awayAliases)}`,
    competitionId: fixture.competitionId,
    kickoff,
    finished,
    startDate: new Date(start).toISOString(),
    endDate: new Date(end).toISOString(),
    homeAliases,
    awayAliases,
  };
}

type ArticleText = Pick<
  NewsArticle,
  'title' | 'description' | 'url' | 'published'
>;
const mentions = (text: string, names: string[]) =>
  names.some((name) => ` ${text} `.includes(` ${name} `));
const matchTerms =
  /\b(vs?|versus|beat|win|wins|won|victory|defeat|loss|draw|comeback|clash|preview|report|highlights|lineups?|kickoff|goals?|brace|double|match|remontada)\b/i;

export function matchNewsRelevance(
  article: ArticleText,
  search: MatchNewsSearch,
): number {
  const published = Date.parse(article.published);
  if (
    !Number.isFinite(published) ||
    published < Date.parse(search.startDate) ||
    published > Date.parse(search.endDate)
  )
    return -1;
  let pathname = '';
  try {
    pathname = new URL(article.url).pathname;
  } catch {
    /* Provider validation rejects unsafe URLs before selection. */
  }
  const title = fold(article.title),
    text = fold(`${article.title} ${article.description} ${pathname}`);
  if (
    !mentions(text, search.homeAliases) ||
    !mentions(text, search.awayAliases)
  )
    return -1;
  // Both clubs can also appear in transfer speculation. A match feed needs match context.
  if (!matchTerms.test(title) && !matchTerms.test(fold(article.description)))
    return -1;
  if (
    /\b(transfer|transfers|join|signing|exit comments)\b/.test(title) &&
    !matchTerms.test(title)
  )
    return -1;
  const report =
    /\b(win|wins|won|beat|beats|victory|defeat|draw|comeback|report|highlights|brace|double)\b/.test(
      title,
    );
  const preview =
    /\b(preview|lineups?|starting xi|kickoff|live updates)\b/.test(title);
  return (
    (mentions(title, search.homeAliases) && mentions(title, search.awayAliases)
      ? 6
      : 0) +
    (matchTerms.test(title) ? 4 : 0) +
    (search.finished && published >= search.kickoff && report ? 6 : 0) -
    (search.finished && preview ? 2 : 0) +
    Math.max(0, 3 - Math.abs(published - search.kickoff) / 86400000)
  );
}

export function selectMatchNews(
  articles: NewsArticle[],
  search: MatchNewsSearch,
) {
  return articles
    .map((article) => ({ article, score: matchNewsRelevance(article, search) }))
    .filter((item) => item.score >= 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.article.published.localeCompare(a.article.published),
    )
    .slice(0, 12)
    .map((item) => item.article);
}
