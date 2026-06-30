import Link from "next/link";
import Image from "next/image";
import { TeamBadge } from "@/components/common/TeamBadge";
import { Card, CardContent } from "@/components/ui/card";
import { FormattedDateTime } from "@/components/common/FormattedDateTime";
import type { Match } from "@/types/match";
import { MatchStatusBadge } from "./MatchStatusBadge";
import VsIcon from "../Icons/VsIcon";
import { TeamLogoImage } from "./TeamLogoImage";
import { formatMatchScore } from "@/lib/matches/score";

export type MatchCardProps = {
  match: Match;
};

export function MatchCard({ match }: MatchCardProps) {
  const score = formatMatchScore(match, { includeTeams: true });
  const meta = [
    match.matchNumber ? `Match ${match.matchNumber}` : null,
    match.group ? `Group ${match.group}` : null,
  ].filter(Boolean);

  return (
    <div className="group relative block h-full">
      <Link
        className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-[28px]"
        href={`/matches/${match.id}`}
      >
        <span className="sr-only">View match details</span>
      </Link>
      <Card className="relative h-full overflow-hidden border border-black/5 dark:border-white/5 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md rounded-[28px] shadow-sm transition hover:scale-[1.01] hover:shadow-md">
        {match.venueImageUrl ? (
          <div className="relative h-44 overflow-hidden bg-zinc-900 sm:h-52">
            <Image
              src={match.venueImageUrl}
              alt={match.venue ? `${match.venue} stadium` : "Stadium"}
              fill
              sizes="(min-width: 1024px) 360px, 100vw"
              className="object-cover opacity-80 transition group-hover:scale-105"
            />

            <div className="absolute inset-0 flex items-center justify-center gap-4 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent px-4">
              <TeamLogoImage team={match.homeTeam} size={72} />
              <div className="bg-black/60 backdrop-blur-md text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-xs border border-white/10">VS</div>
              <TeamLogoImage team={match.awayTeam} size={72} />
            </div>
          </div>
        ) : null}
        <CardContent className="grid gap-4 p-3.5 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <MatchStatusBadge status={match.status} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {meta.length ? meta.join(" · ") : ""}
            </span>
          </div>
          <div className="grid gap-4">
            <TeamBadge compact {...match.homeTeam} />
            <div className="grid gap-1.5 rounded-md sm:rounded-2xl border border-black/5 bg-zinc-100/80 dark:bg-zinc-800/30 px-3.5 py-2 sm:flex sm:items-center sm:justify-between text-center">
              <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                <FormattedDateTime date={match.date} />
              </span>
              <strong className="text-sm font-black text-zinc-950 dark:text-white">{score}</strong>
            </div>
            <TeamBadge compact {...match.awayTeam} />
          </div>
          
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 truncate">
              {match.venue ? match.venue : "Venue TBD"}
              {match.city ? `, ${match.city}` : ""}
            </p>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
