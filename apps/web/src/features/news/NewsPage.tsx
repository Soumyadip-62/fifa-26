"use client";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";

import { LoadingState } from "@/components/common/LoadingState";
import { SectionHeader } from "@/components/common/SectionHeader";
import { NewsList } from "@/components/news/NewsList";
import { getNewsArticles } from "@/lib/api/news";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";

export function NewsPage() {
  const {
    data: articles = [],
    isError,
    isSuccess,
  } = useSuspenseQuery({
    queryKey: ["news"],
    queryFn: getNewsArticles,
  });

  return (
    <div className="mx-auto max-w-7xl">
      <Suspense fallback={<LoadingState label="Loading news articles..." />}>
        {isError ? (
          <ErrorState message="Failed to load news articles." />
        ) : (
          <div className="mx-auto grid w-full gap-6 px-4 py-8 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="News"
              title="News and blogs"
              description="Editorial content served through the same function shape future backend data will use."
            />
            {isSuccess && articles.length ? (
              <NewsList articles={articles} />
            ) : (
              <EmptyState
                title="No articles found"
                description="Articles will appear here once data is available."
              />
            )}
          </div>
        )}
      </Suspense>
    </div>
  );
}
