import { Suspense } from "react";
const names = {
  "world-cup": "World Cup",
  "premier-league": "Premier League",
  "la-liga": "La Liga",
  ucl: "UCL",
  bundesliga: "Bundesliga",
};
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { SectionHeader } from "@/components/common/SectionHeader";
import { NewsCards } from "@/components/news/NewsCards";
import { getFootballNewsFeed } from "@/lib/api/news";
import type { FootballNewsFeed } from "@/lib/api/news";
import type { CompetitionId } from "@/types/football";

type Props = {
  competitionId?: CompetitionId;
  limit?: number;
  compact?: boolean;
};

async function NewsContent({
  competitionId,
  limit = 6,
  compact = true,
}: Props) {
  let feed: FootballNewsFeed;
  try {
    feed = await getFootballNewsFeed(competitionId);
  } catch {
    return (
      <ErrorState
        title="News unavailable"
        message="We couldn’t load the latest stories. Please try again later."
      />
    );
  }
  return (
    <>
      {feed.stale ? (
        <p role="status" className="text-xs text-muted-foreground">
          Showing saved stories while the latest news is unavailable.
        </p>
      ) : null}
      {Object.keys(feed.errors).length ? (
        <p role="status" className="text-xs text-muted-foreground">
          {Object.values(feed.errors).join(" ")}
        </p>
      ) : null}
      {feed.articles.length ? (
        <NewsCards articles={feed.articles.slice(0, limit)} compact={compact} />
      ) : (
        <EmptyState
          title="No recent stories"
          description="Check back soon for the latest news."
        />
      )}
    </>
  );
}

export function CompetitionNews(props: Props) {
  const title = props.competitionId
    ? `${names[props.competitionId] ?? "Competition"} news`
    : "Football stories";
  return (
    <section className="grid content-start gap-4">
      <SectionHeader as="h2" eyebrow="Latest" title={title} />
      <Suspense fallback={<LoadingState label="Loading news..." />}>
        <NewsContent {...props} />
      </Suspense>
    </section>
  );
}
