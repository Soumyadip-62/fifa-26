import Link from "next/link";
import Image from "next/image";
import { TeamBadge } from "@/components/common/TeamBadge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/formatDate";
import type { Match } from "@/types/match";
import { MatchStatusBadge } from "./MatchStatusBadge";
import VsIcon from "../Icons/VsIcon";
import { TeamLogoImage } from "./TeamLogoImage";

export type MatchCardProps = {
  match: Match;
};

export function MatchCard({ match }: MatchCardProps) {
  const score =
    match.score.home === null || match.score.away === null
      ? "vs"
      : `${match.score.home} - ${match.score.away}`;
  const meta = [
    match.matchNumber ? `Match ${match.matchNumber}` : null,
    match.group ? `Group ${match.group}` : null,
  ].filter(Boolean);

  return (
    <Link
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
      href={`/matches/${match.id}`}
    >
      <Card className="h-full overflow-hidden bg-white/95 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:bg-neutral-950/90 dark:hover:border-emerald-700">
        {match.venueImageUrl ? (
          <div className="relative h-60 overflow-hidden bg-neutral-900">
            <Image
              src={match.venueImageUrl}
              alt={match.venue ? `${match.venue} stadium` : "Stadium"}
              fill
              sizes="(min-width: 1024px) 360px, 100vw"
              className="object-cover opacity-85 transition group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black/30 flex justify-center items-center gap-2">
              <TeamLogoImage team={match.homeTeam} />
              <VsIcon />
              <TeamLogoImage team={match.awayTeam} />
            </div>
          </div>
        ) : null}
        <CardContent className="grid gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <MatchStatusBadge status={match.status} />
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {meta.length ? `${meta.join(" ⚽️ ")} ` : ""}
            </span>
          </div>
          <div className="grid gap-3">
            <TeamBadge compact {...match.homeTeam} />
            <div className="grid gap-2 rounded-lg bg-neutral-950 px-3 py-2 text-white dark:bg-emerald-950/50 sm:flex sm:items-center sm:justify-between">
              <span className="text-xs leading-5 text-neutral-300">
                {formatDate(match.date)}
              </span>
              <strong className="text-lg leading-none">{score}</strong>
            </div>
            <TeamBadge compact {...match.awayTeam} />
          </div>
          <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
            {match.venue ? match.venue : "Venue TBD"}
            {match.city ? `, ${match.city}` : ""}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
