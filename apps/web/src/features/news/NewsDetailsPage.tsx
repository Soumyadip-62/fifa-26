import Link from "next/link";
import Image from "next/image";
import { images } from "@/assets";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { MotionReveal } from "@/components/common/MotionReveal";
import { ReadMoreText } from "@/components/common/ReadMoreText";
import { SectionHeader } from "@/components/common/SectionHeader";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getNewsArticleBySlug } from "@/lib/api/news";
import { FormattedDateTime } from "@/components/common/FormattedDateTime";

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
        <MotionReveal>
          <div className="relative h-56 overflow-hidden rounded-lg bg-neutral-100 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-neutral-900 dark:shadow-none sm:h-72">
            <Image
              src={article.coverImageUrl ?? images.blogs.default}
              alt={`${article.title} cover`}
              fill
              priority
              sizes="(min-width: 1024px) 896px, 100vw"
              className="object-cover"
            />
          </div>
        </MotionReveal>
        <MotionReveal delay={0.04}>
          <SectionHeader
            eyebrow={article.source ?? "News"}
            title={article.title}
            description={
              <>
                <FormattedDateTime date={article.publishedAt} dateOnly={true} />
                {article.author ? ` by ${article.author}` : ""}
              </>
            }
          />
        </MotionReveal>
        <MotionReveal delay={0.08}>
          <div className="grid gap-5 rounded-lg border border-neutral-200/80 bg-white/95 p-5 text-base leading-8 text-neutral-700 shadow-[0_18px_45px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-neutral-950/85 dark:text-neutral-300 dark:shadow-none sm:p-6">
            {article.excerpt ? (
              <ReadMoreText
                className="text-base font-medium leading-7 text-neutral-950 dark:text-neutral-50 sm:text-lg"
                maxLength={220}
                text={article.excerpt}
              />
            ) : null}
            <ReadMoreText
              className="max-w-3xl text-base leading-8 text-neutral-700 dark:text-neutral-300"
              maxLength={520}
              text={article.content ?? "Article content is not available yet."}
            />
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
        </MotionReveal>
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
