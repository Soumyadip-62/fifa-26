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
      <article className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <MotionReveal>
          <div className="relative h-56 overflow-hidden rounded-[32px] bg-zinc-100 dark:bg-zinc-900 sm:h-72 border border-black/5 dark:border-white/5 shadow-xs">
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
          <div className="grid gap-5 rounded-[28px] border border-black/5 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md p-5 text-sm leading-relaxed text-zinc-600 shadow-sm dark:border-white/10 dark:text-zinc-300 sm:p-6">
            {article.excerpt ? (
              <ReadMoreText
                className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-relaxed"
                maxLength={220}
                text={article.excerpt}
              />
            ) : null}
            <ReadMoreText
              className="max-w-3xl text-xs sm:text-sm leading-relaxed text-zinc-650 dark:text-zinc-300"
              maxLength={520}
              text={article.content ?? "Article content is not available yet."}
            />
            {article.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Badge variant="secondary" className="rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-0 font-semibold px-3 py-1 text-xs shadow-xs" key={tag}>
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
