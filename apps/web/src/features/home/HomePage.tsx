import { Suspense } from "react";
import {
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Radio,
  RadioTower,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { getSnapshot, resolveFixtures } from "@/lib/api/football";
import { upcomingFixtures, orderFixtures } from "@/lib/matches/fixture-order";
import { DataFreshness } from "@/components/football/DataFreshness";
import { CompactHero } from "./CompactHero";
import { DashboardPanel } from "./DashboardPanel";
import { DashboardMatchCard } from "./DashboardMatchCard";
import { CompetitionCards } from "./CompetitionCards";
import { FavouriteTeams } from "./FavouriteTeams";
import { LiveMatches } from "./LiveMatches";
import { DashboardScorers } from "./DashboardScorers";
import { DashboardNews } from "./DashboardNews";
import { HomeLoading, PanelLoading } from "./HomeLoading";

async function DashboardContent() {
  // Match freshness component arguments so React deduplicates this database read.
  const data = await getSnapshot(undefined, undefined).catch(() => null);
  if (!data)
    return (
      <div className="home-dashboard">
        <div className="dashboard-unavailable">
          <RadioTower />
          <p className="dashboard-eyebrow">We&apos;ll be right back</p>
          <h1>Taking a short break.</h1>
          <p>
            We couldn&apos;t load the football dashboard. Your saved teams are
            still here. Please try again shortly.
          </p>
          <form action="/" method="get">
            <button type="submit" className="dashboard-cta">
              Try again
              <ArrowRight />
            </button>
          </form>
        </div>
      </div>
    );
  const matches = resolveFixtures(data);
  const live = matches.filter((item) => item.match.status === "live");
  const next = upcomingFixtures(matches);
  const results = orderFixtures(
    matches.filter((item) => item.match.status === "finished"),
  ).slice(0, 2);
  return (
    <div className="home-dashboard">
      <CompactHero
        live={live.length}
        competitions={data.competitions.length}
        teams={data.teams.length}
        players={data.players.length}
      />
      {Object.keys(data.errors).length > 0 && (
        <p className="dashboard-data-notice" role="status">
          Some competition fixtures are unavailable. Available matches are shown
          below.
          <Link href="/competitions">
            Check competitions <ArrowRight />
          </Link>
        </p>
      )}
      <div className="dashboard-grid">
        <Suspense
          fallback={
            <PanelLoading
              title="Live now"
              icon={Radio}
              className="dashboard-live"
            />
          }
        >
          <LiveMatches live={live} next={next[0]} />
        </Suspense>
        <FavouriteTeams teams={data.teams} />
        <CompetitionCards competitions={data.competitions} />
        <div className="dashboard-fixtures-results">
          <DashboardPanel
            id="upcoming-heading"
            title="Upcoming matches"
            icon={CalendarDays}
            href="/matches"
            className="dashboard-upcoming"
          >
            <div className="dashboard-fixture-list">
              {next.slice(0, 2).map((item) => (
                <DashboardMatchCard key={item.match.id} item={item} />
              ))}
            </div>
            {!next.length && (
              <p className="dashboard-panel-note">
                No future fixtures are available in the saved schedules. Check
                the calendar again soon.
              </p>
            )}
          </DashboardPanel>
          <DashboardPanel
            id="results-heading"
            title="Recent results"
            icon={ChartNoAxesColumnIncreasing}
            href="/matches?status=finished"
            className="dashboard-results"
          >
            <div className="dashboard-results-list">
              {results.map((item) => (
                <DashboardMatchCard key={item.match.id} item={item} result />
              ))}
            </div>
            {!results.length && (
              <p className="dashboard-panel-note">
                No completed matches are available yet.
              </p>
            )}
          </DashboardPanel>
        </div>
        <aside
          className="dashboard-sidebar"
          aria-label="Football rankings and news"
        >
          <Suspense
            fallback={
              <PanelLoading
                title="Top scorers"
                icon={ChartNoAxesColumnIncreasing}
              />
            }
          >
            <DashboardScorers players={data.players} />
          </Suspense>
          <Suspense
            fallback={<PanelLoading title="Latest news" icon={RadioTower} />}
          >
            <DashboardNews />
          </Suspense>
        </aside>
      </div>
      <div className="dashboard-freshness">
        <DataFreshness />
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
