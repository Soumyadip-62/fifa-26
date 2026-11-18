import { ChartNoAxesColumnIncreasing } from "lucide-react";
import Image from "next/image";
import type { MatchDetails } from "@/types/football";
import { MatchEmpty, MatchPanel } from "./MatchPanel";

export function MatchStatistics({ details }: { details: MatchDetails }) {
  const { stats, homeTeam, awayTeam } = details;
  const published = stats.filter(
    (stat) => Number.isFinite(stat.home) && Number.isFinite(stat.away),
  );
  const state = details.availability?.statistics?.state;
  return (
    <MatchPanel
      title="Match stats"
      icon={ChartNoAxesColumnIncreasing}
      className="nm-stats"
    >
      <div className="nm-stats-teams">
        {[homeTeam, awayTeam].map((team) => (
          <span key={team.id}>
            {team.logoUrl ? (
              <Image
                src={team.logoUrl}
                alt={team.name}
                width={30}
                height={34}
              />
            ) : (
              team.shortName
            )}
          </span>
        ))}
      </div>
      {published.length ? (
        <dl className="nm-stat-list">
          {published.map((stat) => {
            const total = stat.home + stat.away;
            const homeWidth =
              total > 0
                ? Math.max(0, Math.min(100, (stat.home / total) * 100))
                : 0;
            const suffix =
              stat.suffix || (/possession/i.test(stat.label) ? "%" : "");
            return (
              <div key={stat.label} className="nm-stat-label">
                <dt>{stat.label.trim()}</dt>
                <dd className="nm-stat-home">
                  <span className="sr-only">{homeTeam.name}: </span>
                  {stat.home}
                  {suffix}
                </dd>
                <dd className="nm-stat-away">
                  <span className="sr-only">{awayTeam.name}: </span>
                  {stat.away}
                  {suffix}
                </dd>
                <dd
                  className={`nm-stat-track ${total === 0 ? "is-empty" : ""}`}
                  aria-hidden="true"
                >
                  <span style={{ width: `${homeWidth}%` }} />
                </dd>
              </div>
            );
          })}
        </dl>
      ) : (
        <MatchEmpty
          title={
            state === "pending"
              ? "Stats pending"
              : state === "not_applicable"
                ? "Stats not applicable"
                : "Stats unavailable"
          }
        >
          {state === "pending"
            ? "Match statistics are pending."
            : state === "not_applicable"
              ? "Statistics do not apply to this match."
              : "The provider has not supplied match statistics."}
        </MatchEmpty>
      )}
    </MatchPanel>
  );
}
