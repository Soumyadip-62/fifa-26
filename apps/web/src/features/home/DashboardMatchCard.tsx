import Link from "next/link";
import { ArrowUpRight, Clock3, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TeamMark } from "@/components/football/TeamMark";
import { FavouriteButton } from "@/components/football/PreferenceControls";
import type { ResolvedMatch } from "@/components/football/PlatformMatchCard";

export function kickoffLabel(kickoff: string) {
  return (
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(new Date(kickoff)) + " IST"
  );
}

export function DashboardMatchCard({
  item,
  featured = false,
  result = false,
}: {
  item: ResolvedMatch;
  featured?: boolean;
  result?: boolean;
}) {
  const { match, competition, homeTeam, awayTeam } = item;
  const live = match.status === "live";
  const status = live
    ? match.minute === "Half-time"
      ? "Half-time"
      : `Live${match.minute ? ` ${match.minute}` : ""}`
    : match.status === "finished"
      ? "Full time"
      : match.status === "upcoming"
        ? "Scheduled"
        : match.status;
  const score =
    match.status === "upcoming"
      ? "vs"
      : `${match.homeScore ?? "–"} – ${match.awayScore ?? "–"}`;
  return (
    <article
      className={`dashboard-match ${featured ? "dashboard-match-featured" : ""} ${result ? "dashboard-match-result" : ""} ${live ? "is-live" : ""}`}
    >
      <Link
        href={`/matches/${match.id}`}
        className="dashboard-match-link"
        aria-label={`${homeTeam.name} versus ${awayTeam.name}, ${status}, ${kickoffLabel(match.kickoff)}`}
      >
        <div className="dashboard-match-top">
          <Badge className="dashboard-competition-badge">
            <Trophy aria-hidden="true" />
            {competition.shortName === "UEFA Champions League"
              ? "Champions League"
              : competition.shortName}
          </Badge>
          <span
            className={`dashboard-match-status ${live ? "live-status" : ""}`}
          >
            {live && <span />}
            {status}
          </span>
        </div>
        <div className="dashboard-scoreboard">
          <div className="dashboard-score-team">
            <TeamMark
              team={homeTeam}
              showName={false}
              size={featured ? "lg" : "md"}
            />
            <span title={homeTeam.name}>
              {homeTeam.shortName || homeTeam.name}
            </span>
          </div>
          <strong
            className={`dashboard-score ${match.status === "upcoming" ? "score-versus" : ""}`}
            aria-label={
              match.status === "upcoming" ? "versus" : `Score ${score}`
            }
          >
            {score}
          </strong>
          <div className="dashboard-score-team">
            <TeamMark
              team={awayTeam}
              showName={false}
              size={featured ? "lg" : "md"}
            />
            <span title={awayTeam.name}>
              {awayTeam.shortName || awayTeam.name}
            </span>
          </div>
        </div>
        <div className="dashboard-match-footer">
          <span>
            <Clock3 aria-hidden="true" />
            <time dateTime={match.kickoff}>{kickoffLabel(match.kickoff)}</time>
          </span>
          {featured && <ArrowUpRight aria-hidden="true" />}
        </div>
      </Link>
      <div className="dashboard-match-save">
        <FavouriteButton kind="matchIds" id={match.id} />
      </div>
    </article>
  );
}
