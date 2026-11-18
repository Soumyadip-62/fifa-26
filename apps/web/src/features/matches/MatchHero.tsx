import Image from "next/image";
import Link from "next/link";
import { CircleDot } from "lucide-react";
import { CompetitionBadge } from "@/components/football/CompetitionBadge";
import { ReminderButton } from "@/components/football/PreferenceControls";
import type { MatchDetails, MatchDetailsTeam } from "@/types/football";
import { scoreLabel } from "@/lib/matches/detail-labels";

function HeroTeam({ team }: { team: MatchDetailsTeam }) {
  const confirmed = !team.id.startsWith("unconfirmed-");
  const content = (
    <>
      <span className="nm-hero-crest">
        {team.logoUrl ? (
          <Image
            src={team.logoUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 62px, 84px"
            className="object-contain"
          />
        ) : (
          <span aria-hidden="true">?</span>
        )}
      </span>
      <span>{team.name}</span>
    </>
  );
  return confirmed ? (
    <Link href={`/teams/${team.id}`} className="nm-hero-team">
      {content}
    </Link>
  ) : (
    <div className="nm-hero-team">{content}</div>
  );
}

export function MatchHero({ details }: { details: MatchDetails }) {
  const { match, competition, homeTeam, awayTeam, events } = details;
  const status =
    match.status === "finished"
      ? "FT"
      : match.status === "live"
        ? `LIVE ${match.minute ?? ""}`
        : match.status === "upcoming"
          ? "UPCOMING"
          : match.status.replaceAll("_", " ");
  const goals = events.filter((event) => event.type === "goal");
  return (
    <section className="nm-hero" aria-label="Match scoreboard">
      <Image
        src="/assets/images/banners/qf-stadium.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="nm-hero-background"
      />
      <div className="nm-hero-shade" />
      <div className="nm-score-stage">
        <CompetitionBadge
          competition={competition}
          className="nm-competition"
        />
        <div className="nm-scoreboard">
          <HeroTeam team={homeTeam} />
          <div className="nm-score-middle">
            <span
              className={`nm-status ${match.status === "live" ? "is-live" : ""}`}
              role="status"
            >
              {status}
            </span>
            <strong
              className={
                match.status === "upcoming"
                  ? "nm-score is-upcoming"
                  : "nm-score"
              }
            >
              {match.status === "upcoming" ? (
                "VS"
              ) : (
                <>
                  {match.homeScore ?? "—"}
                  <span>–</span>
                  {match.awayScore ?? "—"}
                </>
              )}
            </strong>
            <span className="nm-matchday">
              {match.matchday || match.stage.replaceAll("_", " ")}
            </span>
            {details.score &&
            (details.score.halfTime.home !== null ||
              details.score.halfTime.away !== null) ? (
              <span
                className="nm-half-time"
                aria-label={`Half-time score ${scoreLabel(details.score.halfTime)}`}
              >
                HT {scoreLabel(details.score.halfTime)}
              </span>
            ) : null}
          </div>
          <HeroTeam team={awayTeam} />
        </div>
        {goals.length > 0 ? (
          <div className="nm-goals">
            {[homeTeam, awayTeam].map((team) => (
              <div key={team.id}>
                {goals
                  .filter((goal) => goal.teamId === team.id)
                  .map((goal) => (
                    <span key={goal.id}>
                      <CircleDot aria-hidden="true" />
                      {goal.label}
                      <b>{goal.minute}</b>
                    </span>
                  ))}
              </div>
            ))}
          </div>
        ) : null}
        {match.status === "upcoming" ? (
          <div className="nm-reminder">
            <ReminderButton id={match.id} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
