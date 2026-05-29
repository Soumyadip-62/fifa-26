import type { NewsArticle } from "@/types/news";
import { NewsCard } from "./NewsCard";

export type NewsListProps = {
  articles: NewsArticle[];
};

export function NewsList({ articles }: NewsListProps) {
  console.log(articles);

  return (
    <section
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      aria-label="News articles"
    >
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </section>
  );
}
