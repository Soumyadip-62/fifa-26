import type { NewsArticle } from "@/types/news";
import { NewsCard } from "./NewsCard";

export type NewsListProps = {
  articles: NewsArticle[];
};

export function NewsList({ articles }: NewsListProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2" aria-label="News articles">
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </section>
  );
}
