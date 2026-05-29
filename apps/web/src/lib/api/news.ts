import { mockNewsArticles } from "@/data/mock/news";
import type { NewsArticle } from "@/types/news";

export async function getNewsArticles(): Promise<NewsArticle[]> {
  return mockNewsArticles;
}

export async function getNewsArticleBySlug(slug: string): Promise<NewsArticle | null> {
  return mockNewsArticles.find((article) => article.slug === slug) ?? null;
}
