export const NEWS_COMPETITIONS = {
  'world-cup': {
    name: 'World Cup',
    query:
      '("FIFA World Cup" OR "World Cup 2026" OR "2026 World Cup") AND (football OR soccer OR FIFA)',
  },
  'premier-league': {
    name: 'Premier League',
    query: '"Premier League" AND (football OR soccer)',
  },
  'la-liga': { name: 'La Liga', query: '"La Liga" OR LaLiga' },
  ucl: { name: 'Champions League', query: '"UEFA Champions League"' },
  bundesliga: {
    name: 'Bundesliga',
    query: 'Bundesliga AND (football OR soccer)',
  },
} as const;

export type NewsCompetitionId = keyof typeof NEWS_COMPETITIONS;
export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  author: string;
  image: string | null;
  language: string;
  category: string[];
  source_category: string[];
  published: string;
  competitionId?: NewsCompetitionId;
}
export interface NewsFeed {
  news: NewsArticle[];
  freshness: { fetchedAt: string; stale: boolean };
  errors?: Partial<Record<NewsCompetitionId, string>>;
}
