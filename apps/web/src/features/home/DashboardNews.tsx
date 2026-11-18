import { Newspaper } from "lucide-react";
import { NewsImage } from "@/components/news/NewsImage";
import { getFootballNewsFeed, type FootballNewsFeed } from "@/lib/api/news";
import { DashboardPanel } from "./DashboardPanel";

export async function DashboardNews() {
  let feed: FootballNewsFeed | null = null;
  try {
    feed = await getFootballNewsFeed();
  } catch {
    /* News can fail independently of match data. */
  }
  return (
    <DashboardPanel
      id="news-heading"
      title="Latest news"
      icon={Newspaper}
      href="/news"
      className="dashboard-news"
    >
      {feed?.stale && (
        <p className="dashboard-panel-note" role="status">
          Showing saved stories while news refreshes.
        </p>
      )}
      {feed && Object.keys(feed.errors).length > 0 && (
        <p className="dashboard-panel-note" role="status">
          Some competition feeds are temporarily unavailable.
        </p>
      )}
      {feed?.articles.length ? (
        <div className="dashboard-news-list">
          {feed.articles.slice(0, 4).map((article) => (
            <a
              key={article.id}
              href={article.sourceUrl ?? `/news/${article.slug}`}
              target={article.sourceUrl ? "_blank" : undefined}
              rel={article.sourceUrl ? "noopener noreferrer" : undefined}
              className="dashboard-news-item"
            >
              <span className="dashboard-news-image">
                <NewsImage src={article.imageUrl} sizes="88px" />
              </span>
              <span className="dashboard-news-copy">
                <strong>{article.title}</strong>
                <span>
                  {article.sourceName ?? article.category}
                  <span aria-hidden="true"> · </span>
                  <time dateTime={article.publishedAt}>
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "short",
                      timeZone: "Asia/Kolkata",
                    }).format(new Date(article.publishedAt))}
                  </time>
                </span>
              </span>
            </a>
          ))}
        </div>
      ) : (
        <p className="dashboard-panel-note">
          {feed
            ? "No recent stories. Check back for the latest football news."
            : "News is temporarily unavailable. Please check back shortly."}
        </p>
      )}
    </DashboardPanel>
  );
}
