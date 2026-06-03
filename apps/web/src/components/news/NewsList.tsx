import type { NewsArticle } from "@/types/news";
import { MotionReveal } from "../common/MotionReveal";
import { NewsCard } from "./NewsCard";

export type NewsListProps = {
  articles: NewsArticle[];
};

export function NewsList({ articles }: NewsListProps) {
  return (
    <section
      className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
      aria-label="News articles"
    >
      {articles.map((article, index) => (
        <MotionReveal delay={Math.min(index * 0.04, 0.2)} key={article.id}>
          <NewsCard article={article} />
        </MotionReveal>
      ))}
    </section>
  );
}
