import Link from "next/link";
import { CalendarDays, Layers3 } from "lucide-react";
import type {
  Competition,
  FootballMatch,
  FootballTeam,
} from "@/types/football";
import { CompetitionBadge } from "./CompetitionBadge";
import { TeamMark } from "./TeamMark";
import { FavouriteButton } from "./PreferenceControls";

export type ResolvedMatch = {
  match: Omit<FootballMatch, "stadiumId">;
  competition: Competition;
  homeTeam: Pick<FootballTeam, "name" | "shortName" | "logoUrl">;
  awayTeam: Pick<FootballTeam, "name" | "shortName" | "logoUrl">;
};

export function PlatformMatchCard({
  item,
  compact = false,
  linked = true,
}: {
  item: ResolvedMatch;
  compact?: boolean;
  linked?: boolean;
}) {
  const { match, competition, homeTeam, awayTeam } = item;
  const versus =
    match.status === "upcoming" ||
    (["postponed", "cancelled", "unknown"].includes(match.status) &&
      match.homeScore == null &&
      match.awayScore == null);
  const status =
    match.status === "live"
      ? match.minute === "Half-time"
        ? "Half-time"
        : `Live${match.minute ? ` ${match.minute}` : ""}`
      : match.status === "finished"
        ? "Full time"
        : match.status === "unknown"
          ? "Status unavailable"
          : match.status;
  const date = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(match.kickoff));
  return (
    <article
      className={`platform-match ${compact ? "platform-match-compact" : ""}`}
    >
      {linked && (
        <Link
          href={`/matches/${match.id}`}
          className="absolute inset-0 z-10 rounded-lg"
          aria-label={`${homeTeam.name} versus ${awayTeam.name}, ${status}`}
        />
      )}
      <div className="platform-match-save">
        <FavouriteButton kind="matchIds" id={match.id} />
      </div>
      <div className="platform-match-header">
        <CompetitionBadge competition={competition} />
        <span
          className={`platform-match-state ${match.status === "live" ? "is-live" : ""}`}
        >
          {status}
        </span>
      </div>
      <div className="platform-match-scoreboard">
        <div className="platform-match-team">
          <TeamMark team={homeTeam} showName={false} />
          <strong title={homeTeam.name}>
            {homeTeam.shortName || homeTeam.name}
          </strong>
        </div>
        <strong className={`platform-match-score ${versus ? "is-versus" : ""}`}>
          {versus
            ? "vs"
            : `${match.homeScore ?? "–"} – ${match.awayScore ?? "–"}`}
        </strong>
        <div className="platform-match-team">
          <TeamMark team={awayTeam} showName={false} />
          <strong title={awayTeam.name}>
            {awayTeam.shortName || awayTeam.name}
          </strong>
        </div>
      </div>
      <div className="platform-match-footer">
        <span>
          <CalendarDays aria-hidden="true" />
          <time dateTime={match.kickoff}>{date} IST</time>
        </span>
        <span>
          <Layers3 aria-hidden="true" />
          {match.matchday}
        </span>
      </div>
    </article>
  );
}
