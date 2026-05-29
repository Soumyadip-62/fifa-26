import Link from "next/link";
import Image from "next/image";
import { images } from "@/assets";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { SectionHeader } from "@/components/common/SectionHeader";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getNewsArticleBySlug } from "@/lib/api/news";
import { formatDateOnly } from "@/lib/utils/formatDate";

export type NewsDetailsPageProps = {
  slug: string;
};

export async function NewsDetailsPage({ slug }: NewsDetailsPageProps) {
  try {
    const article = await getNewsArticleBySlug(slug);

    if (!article) {
      return (
        <div className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <EmptyState title="Article not found" description="The requested article is not available in the mock data." />
          <Link className={buttonVariants({ variant: "outline" })} href="/news">
            Back to news
          </Link>
        </div>
      );
    }

    return (
      <article className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative h-72 overflow-hidden rounded-2xl bg-neutral-100 shadow-sm dark:bg-neutral-900">
          <Image
            src={article.coverImageUrl ?? images.blogs.default}
            alt={`${article.title} cover`}
            fill
            priority
            sizes="(min-width: 1024px) 896px, 100vw"
            className="object-cover"
          />
        </div>
        <SectionHeader
          eyebrow={article.source ?? "News"}
          title={article.title}
          description={`${formatDateOnly(article.publishedAt)}${article.author ? ` by ${article.author}` : ""}`}
        />
        <div className="grid gap-5 rounded-xl border border-neutral-200 bg-white p-6 text-base leading-8 text-neutral-700 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
          {article.excerpt ? <p className="text-lg font-medium text-neutral-950 dark:text-neutral-50">{article.excerpt}</p> : null}
          <p>{article.content ?? "Article content is not available yet."}</p>
          {article.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge variant="outline" key={tag}>
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    );
  } catch {
    return (
      <div className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState message="Failed to load article details." />
      </div>
    );
  }
}
