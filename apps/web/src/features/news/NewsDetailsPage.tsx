import { notFound } from "next/navigation";
import { getPlatformArticle } from "@/lib/api/football";
import { NewsImage } from "@/components/news/NewsImage";
export async function NewsDetailsPage({ slug }: { slug: string }) {
  const article = await getPlatformArticle(slug);
  if (!article) notFound();
  return (
    <article className="page-shell article-shell">
      <header className="grid gap-4">
        <p className="text-xs text-primary">
          {article.sourceName ?? "Football news"} ·{" "}
          <time dateTime={article.publishedAt}>
            {new Intl.DateTimeFormat("en-GB", {
              dateStyle: "medium",
              timeZone: "Asia/Kolkata",
            }).format(new Date(article.publishedAt))}
          </time>
        </p>
        <h1 className="font-heading text-3xl font-black sm:text-5xl">
          {article.title}
        </h1>
      </header>
      <div className="relative aspect-video overflow-hidden rounded-lg">
        <NewsImage src={article.imageUrl} sizes="100vw" />
      </div>
      <p className="text-lg leading-8">{article.excerpt}</p>
      <p className="text-sm text-muted-foreground">
        This is a publisher-provided preview. Read the full article at its
        original source.
      </p>
      {article.sourceUrl ? (
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground"
        >
          Read at {article.sourceName}
        </a>
      ) : null}
    </article>
  );
}
