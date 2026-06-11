import { mockNewsArticles } from "@/data/mock/news";
import { apiUrl } from "@/lib/api/config";
import type { NewsArticle } from "@/types/news";

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

function toSlug(article: ApiNewsArticle) {
  const titleSlug = article.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return titleSlug || article.id;
}

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
    slug: toSlug(article),
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

export async function getNewsArticlesByKeywords(keywords: string): Promise<NewsArticle[]> {
  try {
    const response = await fetch(apiUrl(`/news/${encodeURIComponent(keywords)}`));

    if (!response.ok) {
      throw new Error("Failed to fetch news by keywords");
    }

    const data = await response.json();
    const articles = (Array.isArray(data) ? data : data.news || data.articles || []) as ApiNewsArticle[];
    return articles.map(normalizeNewsArticle);
  } catch {
    return [];
  }
}

export async function getNewsArticleBySlug(
  slug: string,
): Promise<NewsArticle | null> {
  return mockNewsArticles.find((article) => article.slug === slug) ?? null;
}
