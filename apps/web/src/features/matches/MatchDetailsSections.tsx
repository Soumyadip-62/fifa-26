import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Info,
  MapPin,
  Newspaper,
  UserRound,
  UsersRound,
  Warehouse,
  Flag,
  Trophy,
} from "lucide-react";
import { apiUrl } from "@/lib/api/config";
import { PlayerAvatar } from "@/components/common/PlayerAvatar";
import { NewsImage } from "@/components/news/NewsImage";
import type { FootballNews, MatchDetails } from "@/types/football";
import {
  availabilityLabel,
  durationLabel,
  scoreLabel,
  winnerLabel,
} from "@/lib/matches/detail-labels";
import { MatchEmpty, MatchPanel } from "./MatchPanel";

export function MatchInformation({ details }: { details: MatchDetails }) {
  const { match, stadium } = details;
  const winner = winnerLabel(details);
  const halfTime = details.score?.halfTime;
  return (
    <MatchPanel title="Match info" icon={Info} className="nm-info">
      <dl className="nm-info-list">
        <div>
          <dt>
            <CalendarDays aria-hidden="true" />
            <span className="sr-only">Kickoff</span>
          </dt>
          <dd>
            <time dateTime={match.kickoff}>
              {new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
                timeZone: "Asia/Kolkata",
              }).format(new Date(match.kickoff))}
              <small>IST · UTC+5:30</small>
            </time>
          </dd>
        </div>
        <div>
          <dt>
            <Warehouse aria-hidden="true" />
            <span className="sr-only">Venue</span>
          </dt>
          <dd>
            {details.venue
              ? details.venue.confirmed
                ? details.venue.name
                : availabilityLabel(details, "venue")
              : stadium.name}
          </dd>
        </div>
        <div>
          <dt>
            <Flag aria-hidden="true" />
            <span className="sr-only">Referee</span>
          </dt>
          <dd>
            {details.referees?.length ? (
              <ul className="nm-officials">
                {details.referees.map((official, index) => (
                  <li key={`${official.id ?? "official"}-${index}`}>
                    <small>
                      {official.type?.replaceAll("_", " ").toLowerCase() ||
                        "Match official"}
                    </small>
                    {official.name || "Name not available"}
                    {official.nationality ? (
                      <span className="nm-official-country">
                        {" "}
                        · {official.nationality}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <small>Referee</small>
                {match.referee || availabilityLabel(details, "referees")}
              </>
            )}
          </dd>
        </div>
        <div>
          <dt>
            <UsersRound aria-hidden="true" />
            <span className="sr-only">Attendance</span>
          </dt>
          <dd>
            <small>Attendance</small>
            {match.attendance != null
              ? `${match.attendance.toLocaleString()} spectators`
              : availabilityLabel(details, "attendance")}
          </dd>
        </div>
        <div>
          <dt>
            <Clock3 aria-hidden="true" />
            <span className="sr-only">Half-time score</span>
          </dt>
          <dd>
            <small>Half-time</small>
            {halfTime && (halfTime.home !== null || halfTime.away !== null)
              ? scoreLabel(halfTime)
              : availabilityLabel(details, "halfTimeScore")}
          </dd>
        </div>
        <div>
          <dt>
            <Trophy aria-hidden="true" />
            <span className="sr-only">Match result</span>
          </dt>
          <dd>
            <small>Result</small>
            {winner
              ? details.score?.winner === "DRAW"
                ? "Draw"
                : `Winner: ${winner}`
              : availabilityLabel(details, "winner")}
          </dd>
        </div>
        <div>
          <dt>
            <Clock3 aria-hidden="true" />
            <span className="sr-only">Match duration</span>
          </dt>
          <dd>
            <small>Duration</small>
            {durationLabel(details.score?.duration) ||
              availabilityLabel(details, "duration")}
          </dd>
        </div>
      </dl>
    </MatchPanel>
  );
}

export function MatchCoaches({
  homeTeam,
  awayTeam,
  lineups,
}: Pick<MatchDetails, "homeTeam" | "awayTeam" | "lineups">) {
  return (
    <MatchPanel title="Coaches" icon={UserRound} className="nm-coaches">
      <div className="nm-coach-list">
        {[homeTeam, awayTeam].map((team) => {
          const published = lineups.find(
            (lineup) => lineup.teamId === team.id,
          )?.coach;
          const name =
            published && published !== "Unavailable" ? published : team.coach;
          return (
            <div key={team.id}>
              <PlayerAvatar
                name={name || team.name}
                className="nm-coach-avatar"
              />
              <div>
                <span>{team.name}</span>
                <strong>{name || "Not announced"}</strong>
              </div>
            </div>
          );
        })}
      </div>
    </MatchPanel>
  );
}

export function StadiumDetails({
  stadium,
  venue,
  availability,
}: Pick<MatchDetails, "stadium" | "venue" | "availability">) {
  const confirmed = venue ? venue.confirmed : Boolean(stadium.id);
  return (
    <MatchPanel title="Stadium details" icon={Warehouse} className="nm-venue">
      <div className="nm-venue-content">
        <div className="nm-venue-image">
          <Image
            src={stadium.imageUrl}
            alt={
              !confirmed || stadium.imageUrl.includes("default-stadium")
                ? "Stadium illustration"
                : stadium.name
            }
            fill
            sizes="120px"
            className="object-cover"
          />
        </div>
        <div>
          <strong>
            {venue
              ? confirmed
                ? venue.name
                : availabilityLabel({ availability }, "venue")
              : stadium.name}
          </strong>
          <p>
            <MapPin aria-hidden="true" />
            <span>
              Location:{" "}
              {[venue?.city ?? stadium.city, venue?.country ?? stadium.country]
                .filter(Boolean)
                .join(", ") || "Not available"}
            </span>
          </p>
          <p>
            <UsersRound aria-hidden="true" />
            <span>
              Capacity:{" "}
              {confirmed
                ? (stadium.capacity?.toLocaleString() ?? "Not available")
                : "Not available"}
            </span>
          </p>
          {confirmed && stadium.id ? (
            <Link href={`/stadiums/${stadium.id}`} className="nm-text-link">
              View stadium <ArrowUpRight aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>
    </MatchPanel>
  );
}

export function MatchNews({ details }: { details: MatchDetails }) {
  const [articles, setArticles] = useState(details.relatedNews);
  const [state, setState] = useState<"loading" | "ready" | "error">(
    details.relatedNews.length ? "ready" : "loading",
  );
  useEffect(() => {
    const controller = new AbortController();
    void fetch(
      apiUrl(`/football/matches/${encodeURIComponent(details.match.id)}/news`),
      {
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(30_000),
        ]),
      },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<{ articles: FootballNews[] }>;
      })
      .then((result) => {
        setArticles(result.articles);
        setState("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setState("error");
      });
    return () => controller.abort();
  }, [details.match.id]);
  return (
    <MatchPanel
      title="Match news"
      icon={Newspaper}
      className="nm-news"
      actions={
        <Link className="nm-text-link" href="/news">
          View all <ArrowUpRight aria-hidden="true" />
        </Link>
      }
    >
      {articles.length ? (
        <div className="nm-news-list">
          {articles.slice(0, 3).map((article) => (
            <Link key={article.id} href={`/news/${article.slug}`}>
              <span className="nm-news-image">
                <NewsImage src={article.imageUrl} sizes="110px" />
              </span>
              <span>
                <strong>{article.title}</strong>
                <small>
                  {article.sourceName || "Football news"} ·{" "}
                  {new Intl.DateTimeFormat("en-GB", {
                    day: "numeric",
                    month: "short",
                    timeZone: "Asia/Kolkata",
                  }).format(new Date(article.publishedAt))}
                </small>
              </span>
            </Link>
          ))}
        </div>
      ) : state === "loading" ? (
        <p className="nm-news-loading" role="status">
          Loading match news…
        </p>
      ) : state === "error" ? (
        <p className="nm-news-loading" role="status">
          Match news is temporarily unavailable.
        </p>
      ) : (
        <MatchEmpty title="No match stories yet">
          Read the latest football updates in the news feed.
        </MatchEmpty>
      )}
    </MatchPanel>
  );
}
