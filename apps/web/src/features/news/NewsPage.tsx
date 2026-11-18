import { SectionHeader } from "@/components/common/SectionHeader";
import { getFootballData } from "@/lib/api/football";
import { NewsExplorer } from "./NewsExplorer";
import { getFootballNewsFeed } from "@/lib/api/news";
import { ErrorState } from "@/components/common/ErrorState";
import type { FootballNewsFeed } from "@/lib/api/news";

export async function NewsPage() {
  const { competitions, teams } = await getFootballData();
  let feed: FootballNewsFeed;
  try {
    feed = await getFootballNewsFeed();
  } catch {
    return (
      <div className="page-shell">
        <SectionHeader eyebrow="Newsroom" title="Football news" />
        <ErrorState
          title="News unavailable"
          message="We couldn’t load the latest stories. Please try again later."
        />
      </div>
    );
  }
  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Newsroom"
        title="Football news"
        description="Reports, previews and stories from every supported competition."
      />
      {feed.stale ? (
        <p role="status" className="text-sm text-muted-foreground">
          Showing saved stories while the latest news is unavailable.
        </p>
      ) : null}
      {Object.keys(feed.errors).length ? (
        <p role="status" className="text-sm text-muted-foreground">
          {Object.values(feed.errors).join(" ")}
        </p>
      ) : null}
      <NewsExplorer
        articles={feed.articles}
        competitions={competitions}
        teams={teams}
      />
    </div>
  );
}
