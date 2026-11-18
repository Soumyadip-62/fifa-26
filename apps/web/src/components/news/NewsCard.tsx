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
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary h-full"
      href={`${article.source}`}
      target="_blank"
    >
      <Card className="h-full overflow-hidden border border-border bg-card dark:bg-card backdrop-blur-md rounded-lg shadow-none transition hover:scale-[1.01] hover:shadow-md">
        <div className="relative h-48 bg-secondary dark:bg-card sm:h-56">
          <Image
            src={imageSrc}
            alt={`${article.title} cover`}
            fill
            sizes="(min-width: 1024px) 360px, 100vw"
            className="object-cover transition group-hover:scale-105"
          />
        </div>
        <CardContent className="grid gap-3.5 p-5">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-muted-foreground dark:text-muted-foreground">
            {article.tags?.[0] ? (
              <Badge
                className="rounded-full bg-secondary text-muted-foreground dark:bg-secondary dark:text-secondary-foreground border-0"
                variant="secondary"
              >
                {article.tags[0]}
              </Badge>
            ) : null}
            <span>
              <FormattedDateTime date={article.publishedAt} dateOnly={true} />
            </span>
          </div>
          <h2 className="font-heading text-base font-black leading-normal text-foreground dark:text-white group-hover:text-primary transition duration-200">
            {article.title}
          </h2>
          {article.excerpt ? (
            <ReadMoreText
              className="text-xs leading-relaxed text-muted-foreground dark:text-muted-foreground"
              maxLength={150}
              text={article.excerpt}
            />
          ) : null}
          {article.tags?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {article.tags.slice(1).map((tag) => (
                <Badge
                  className="rounded-full border-border bg-zinc-150/30 text-muted-foreground dark:border-border dark:bg-zinc-850 dark:text-muted-foreground"
                  variant="outline"
                  key={tag}
                >
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
