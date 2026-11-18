import type { FootballNews } from "@/types/football";
import { NewsImage } from "./NewsImage";

export function NewsCards({
  articles,
  compact = false,
}: {
  articles: FootballNews[];
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact ? "grid gap-3" : "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
      }
    >
      {articles.map((article) => (
        <a
          key={article.id}
          href={article.sourceUrl ?? `/news/${article.slug}`}
          target={article.sourceUrl ? "_blank" : undefined}
          rel={article.sourceUrl ? "noopener noreferrer" : undefined}
          className={
            compact
              ? "grid grid-cols-[112px_1fr] overflow-hidden rounded-lg border border-border bg-card transition hover:border-primary/30 dark:border-border dark:bg-card sm:grid-cols-[150px_1fr]"
              : "overflow-hidden rounded-lg border border-border bg-card transition hover:border-primary/30 dark:border-border dark:bg-card"
          }
        >
          <div
            className={compact ? "relative min-h-28" : "relative aspect-[16/9]"}
          >
            <NewsImage
              src={article.imageUrl}
              sizes={
                compact
                  ? "150px"
                  : "(min-width:1280px) 33vw, (min-width:640px) 50vw, 100vw"
              }
            />
          </div>
          <div className="grid content-start gap-2 p-4">
            <p className="text-[10px] font-bold text-primary">
              {article.sourceName ?? article.category}
            </p>
            <h3 className="font-heading text-sm font-bold sm:text-base">
              {article.title}
            </h3>
            {!compact && article.excerpt ? (
              <p className="line-clamp-3 text-xs leading-6 text-muted-foreground">
                {article.excerpt}
              </p>
            ) : null}
            <time
              dateTime={article.publishedAt}
              className="text-[10px] text-muted-foreground"
            >
              {new Intl.DateTimeFormat("en-GB", {
                dateStyle: "medium",
                timeZone: "Asia/Kolkata",
              }).format(new Date(article.publishedAt))}
            </time>
            <span className="text-[10px] font-semibold text-primary">
              Read at source ↗
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
