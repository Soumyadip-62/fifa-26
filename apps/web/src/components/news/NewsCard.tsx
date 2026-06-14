import Link from "next/link";
import Image from "next/image";
import { images } from "@/assets";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReadMoreText } from "@/components/common/ReadMoreText";
import { FormattedDateTime } from "@/components/common/FormattedDateTime";
import type { NewsArticle } from "@/types/news";

export type NewsCardProps = {
  article: NewsArticle;
};

function getImageSrc(src: string | undefined) {
  if (!src || src === "None") {
    return images.blogs.default;
  }

  if (src.startsWith("/")) {
    return src;
  }

  try {
    const url = new URL(src);

    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : images.blogs.default;
  } catch {
    return images.blogs.default;
  }
}

export function NewsCard({ article }: NewsCardProps) {
  const imageSrc = getImageSrc(article.coverImageUrl);

  return (
    <Link
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
      href={`${article.source}`}
      target="_blank"
    >
      <Card className="h-full overflow-hidden transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg dark:hover:border-emerald-500/60">
        <div className="relative h-56 bg-neutral-100 dark:bg-neutral-900 sm:h-72">
          <Image
            src={imageSrc}
            alt={`${article.title} cover`}
            fill
            sizes="(min-width: 1024px) 360px, 100vw"
            className="object-cover transition group-hover:scale-105"
          />
          {/* <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-neutral-950/70 to-transparent" /> */}
        </div>
        <CardContent className="grid gap-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            {article.tags?.[0] ? (
              <Badge variant="secondary">{article.tags[0]}</Badge>
            ) : null}
            <span><FormattedDateTime date={article.publishedAt} dateOnly={true} /></span>
          </div>
          <h2 className="font-heading text-lg font-bold leading-7 text-neutral-950 dark:text-neutral-50">
            {article.title}
          </h2>
          {article.excerpt ? (
            <ReadMoreText
              className="text-sm leading-6 text-neutral-600 dark:text-neutral-400"
              maxLength={150}
              text={article.excerpt}
            />
          ) : null}
          {article.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {article.tags.slice(1).map((tag) => (
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
