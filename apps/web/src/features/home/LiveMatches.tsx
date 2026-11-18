import Link from "next/link";
import { Radio, ArrowRight, CircleDot } from "lucide-react";
import { getPlatformMatch } from "@/lib/api/football";
import type { ResolvedMatch } from "@/components/football/PlatformMatchCard";
import { DashboardPanel } from "./DashboardPanel";
import { DashboardMatchCard } from "./DashboardMatchCard";
import { HomeLiveRefresh } from "./HomeLiveRefresh";

export async function LiveMatches({
  live,
  next,
}: {
  live: ResolvedMatch[];
  next?: ResolvedMatch;
}) {
  const featured = live[0] ?? next;
  const details = live[0]
    ? await getPlatformMatch(live[0].match.id).catch(() => null)
    : null;
  const current = details
    ? {
        match: details.match,
        competition: details.competition,
        homeTeam: details.homeTeam,
        awayTeam: details.awayTeam,
      }
    : featured;
  const events =
    details?.events
      .filter((event) => event.type === "goal" || event.type === "red")
      .slice(-3) ?? [];
  return (
    <DashboardPanel
      id="live-heading"
      title="Live now"
      icon={Radio}
      href="/live"
      className="dashboard-live"
    >
      <HomeLiveRefresh active={live.length > 0} />
      {!live.length && (
        <div className="dashboard-live-empty">
          <span className="quiet-dot" />
          <p>
            <strong>No matches live right now.</strong>
            {next
              ? " Next kick-off is coming up."
              : " Check the calendar for more football."}
          </p>
        </div>
      )}
      {current ? (
        <DashboardMatchCard item={current} featured />
      ) : (
        <div className="dashboard-empty">
          <CircleDot />
          <p>The pitch is quiet for now.</p>
          <Link href="/matches">
            Explore the match calendar <ArrowRight />
          </Link>
        </div>
      )}
      {live.length > 0 && !details && (
        <p className="dashboard-panel-note" role="status">
          Live details are temporarily unavailable. Showing the saved score.
        </p>
      )}
      {events.length > 0 && (
        <ul className="dashboard-match-events" aria-label="Latest match events">
          {events.map((event) => (
            <li key={event.id}>
              <span>{event.minute}</span>
              <strong>{event.label}</strong>
              {event.detail && <small>{event.detail}</small>}
            </li>
          ))}
        </ul>
      )}
      {live.length > 1 && (
        <div className="dashboard-other-live" aria-label="More live matches">
          {live.slice(1, 4).map((item) => (
            <Link key={item.match.id} href={`/matches/${item.match.id}`}>
              <span className="quiet-dot" />
              {item.homeTeam.shortName}
              <strong>
                {item.match.homeScore ?? "–"} – {item.match.awayScore ?? "–"}
              </strong>
              {item.awayTeam.shortName}
            </Link>
          ))}
        </div>
      )}
    </DashboardPanel>
  );
}
