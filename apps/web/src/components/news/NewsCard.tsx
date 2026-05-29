import Link from "next/link";
import Image from "next/image";
import { images } from "@/assets";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateOnly } from "@/lib/utils/formatDate";
import type { NewsArticle } from "@/types/news";

export type NewsCardProps = {
  article: NewsArticle;
};

export function NewsCard({ article }: NewsCardProps) {
  return (
    <Link className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600" href={`/news/${article.slug}`}>
      <Card className="h-full overflow-hidden bg-white/95 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:bg-neutral-950/90 dark:hover:border-emerald-700">
        <div className="relative h-44 bg-neutral-100 dark:bg-neutral-900">
          <Image
            src={article.coverImageUrl ?? images.blogs.default}
            alt={`${article.title} cover`}
            fill
            sizes="(min-width: 1024px) 360px, 100vw"
            className="object-cover transition group-hover:scale-105"
          />
        </div>
        <CardContent className="grid gap-3 p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            {article.source ? <Badge variant="secondary">{article.source}</Badge> : null}
            <span>{formatDateOnly(article.publishedAt)}</span>
          </div>
          <h2 className="text-xl font-bold leading-tight text-neutral-950 dark:text-neutral-50">{article.title}</h2>
          {article.excerpt ? <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">{article.excerpt}</p> : null}
          {article.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge variant="outline" key={tag}>
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
