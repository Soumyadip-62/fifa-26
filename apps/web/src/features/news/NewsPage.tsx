import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { SectionHeader } from "@/components/common/SectionHeader";
import { NewsList } from "@/components/news/NewsList";
import { getNewsArticles } from "@/lib/api/news";

export async function NewsPage() {
  try {
    const articles = await getNewsArticles();

    return (
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="News"
          title="News and blogs"
          description="Editorial content served through the same function shape future backend data will use."
        />
        {articles.length ? (
          <NewsList articles={articles} />
        ) : (
          <EmptyState title="No articles found" description="Articles will appear here once data is available." />
        )}
      </div>
    );
  } catch {
    return (
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="News" title="News and blogs" />
        <ErrorState message="Failed to load news articles." />
      </div>
    );
  }
}
