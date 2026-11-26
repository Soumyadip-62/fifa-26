import { apiUrl } from "@/lib/api/config";
import type { NewsArticle } from "@/types/news";
import { cache } from "react";
import type { CompetitionId, FootballNews } from "@/types/football";
import { isActiveCompetition } from "@/lib/competitions";

export type FootballNewsFeed = {
  articles: FootballNews[];
  errors: Partial<Record<CompetitionId, string>>;
  stale: boolean;
  fetchedAt?: string;
};

export const getFootballNewsFeed = cache(
  async (competitionId?: CompetitionId): Promise<FootballNewsFeed> => {
    if (competitionId && !isActiveCompetition(competitionId))
      throw new Error("Competition is currently unavailable.");
    const path = competitionId
      ? `/news/competitions/${competitionId}`
      : "/news";
    const response = await fetch(apiUrl(path), {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(40_000),
    });
    if (!response.ok) throw new Error("News is temporarily unavailable.");
    const feed = (await response.json()) as {
      news: Array<ApiNewsArticle & { competitionId: CompetitionId }>;
      freshness?: { fetchedAt: string; stale: boolean };
      errors?: Partial<Record<CompetitionId, string>>;
    };
    if (!Array.isArray(feed.news))
      throw new Error("News is temporarily unavailable.");
    const ids: CompetitionId[] = [
      "premier-league",
      "la-liga",
      "ucl",
      "bundesliga",
    ];
    return {
      articles: feed.news
        .filter(
          (article) =>
            ids.includes(article.competitionId) &&
            (!competitionId || article.competitionId === competitionId),
        )
        .map((article) => ({
          id: `${article.competitionId}:${article.id}`,
          slug: article.id,
          title: article.title,
          excerpt: article.description,
          body: article.description,
          competitionId: article.competitionId,
          category: article.category?.[0] ?? "Football",
          publishedAt: article.published,
          imageUrl:
            toImageUrl(article.image) ??
            "/assets/images/blogs/default-news.svg",
          sourceUrl: article.url,
          sourceName: new URL(article.url).hostname.replace(/^www\./, ""),
        })),
      errors: Object.fromEntries(
        Object.entries(feed.errors ?? {}).filter(([id]) =>
          isActiveCompetition(id),
        ),
      ),
      stale: feed.freshness?.stale ?? false,
      fetchedAt: feed.freshness?.fetchedAt,
    };
  },
);

type ApiNewsArticle = {
  id: string;
  title: string;
  description: string;
  url: string;
  author: string;
  image?: string | null;
  language: string;
  category: string[];
  source_category: string[];
  published: string;
};

function toImageUrl(image: string | null | undefined) {
  if (!image || image === "None") {
    return undefined;
  }

  if (image.startsWith("/")) {
    return image;
  }

  try {
    const url = new URL(image);

    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function normalizeNewsArticle(article: ApiNewsArticle): NewsArticle {
  return {
    id: article.id,
    title: article.title,
    slug: article.id,
    excerpt: article.description,
    content: article.description,
    coverImageUrl: toImageUrl(article.image),
    source: article.url,
    author: article.author,
    publishedAt: article.published,
    tags: article.category,
  };
}

export async function getNewsArticles(): Promise<NewsArticle[]> {
  try {
    const response = await fetch(apiUrl("/news"));

    if (!response.ok) {
      throw new Error("Failed to fetch news");
    }

    const data = await response
      .json()
      .then((data) => data.news as ApiNewsArticle[]);

    return data.map(normalizeNewsArticle);
  } catch {
    return [];
  }
}

export async function getNewsArticlesByKeywords(
  keywords: string,
): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      apiUrl(`/news/${encodeURIComponent(keywords)}`),
    );

    if (!response.ok) {
      throw new Error("Failed to fetch news by keywords");
    }

    const data = await response.json();
    const articles = (
      Array.isArray(data) ? data : data.news || data.articles || []
    ) as ApiNewsArticle[];
    return articles.map(normalizeNewsArticle);
  } catch {
    return [];
  }
}

export async function getNewsArticleBySlug(
  slug: string,
): Promise<NewsArticle | null> {
  const response = await fetch(
    apiUrl(`/football/articles/${encodeURIComponent(slug)}`),
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Article preview unavailable.");
  const a = await response.json();
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    content: a.excerpt,
    source: a.sourceUrl,
    publishedAt: a.publishedAt,
  };
}
