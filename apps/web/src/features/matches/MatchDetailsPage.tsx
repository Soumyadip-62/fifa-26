"use client";
import Link from "next/link";
import Image from "next/image";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatCard } from "@/components/common/StatCard";
import { TeamBadge } from "@/components/common/TeamBadge";
import { MatchStatusBadge } from "@/components/matches/MatchStatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getMatchById } from "@/lib/api/matches";
import { formatDate } from "@/lib/utils/formatDate";
import { useSuspenseQuery } from "@tanstack/react-query";
import { TeamLogoImage } from "@/components/matches/TeamLogoImage";
import VsIcon from "@/components/Icons/VsIcon";
import { getTeamPlayersById } from "@/lib/api/teams";

export type MatchDetailsPageProps = {
  matchId: string;
};

export function MatchDetailsPage({ matchId }: MatchDetailsPageProps) {
  const {
    data: match,
    isPending,
    error,
  } = useSuspenseQuery({
    queryKey: ["matches", matchId],
    queryFn: () => getMatchById(matchId),
  });

  console.log(match);

  const {
    data: homeTeamPlayers,
    isPending: isHomeTeamPlayersPending,
    error: homeTeamPlayersError,
  } = useSuspenseQuery({
    queryKey: ["teams", match.homeTeam.id],
    queryFn: () => getTeamPlayersById(match.homeTeam.id),
  });

  console.log(homeTeamPlayers);

  const {
    data: awayTeamPlayers,
    isPending: isAwayTeamPlayersPending,
    error: awayTeamPlayersError,
  } = useSuspenseQuery({
    queryKey: ["teams", match.awayTeam.id],
    queryFn: () => getTeamPlayersById(match.awayTeam.id),
  });
  console.log(awayTeamPlayers);

  if (error) {
    return (
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <EmptyState
          title="Match not found"
          description="The requested match is not available in the mock data."
        />
        <Link
          className={buttonVariants({ variant: "outline" })}
          href="/matches"
        >
          Back to matches
        </Link>
      </div>
    );
  }

  const score =
    match.score.home === null || match.score.away === null
      ? "Not started"
      : `${match.score.home} - ${match.score.away}`;

  return isPending ? (
    "Loading..."
  ) : (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-lg bg-neutral-950 text-white shadow-[0_24px_70px_rgba(4,22,13,0.28)] ring-1 ring-white/10">
        {match.venueImageUrl ? (
          <div className="relative h-60">
            <Image
              src={match.venueImageUrl}
              alt={match.venue ? `${match.venue} stadium` : "Stadium"}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/25 px-4">
              <TeamLogoImage team={match.homeTeam} size={110} />
              <VsIcon />
              <TeamLogoImage team={match.awayTeam} size={110} />
            </div>
          </div>
        ) : null}
        <div className="grid gap-6 p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <MatchStatusBadge status={match.status} />
            <span className="text-sm text-neutral-300">
              {match.stage ?? match.tournament}
            </span>
            {match.group ? (
              <span className="text-sm text-neutral-300">
                Group {match.group}
              </span>
            ) : null}
          </div>
          <div className="grid items-stretch gap-5 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
            <TeamBadge
              className="rounded-lg bg-white p-4 dark:bg-neutral-900"
              {...match.homeTeam}
            />
            <div className="rounded-lg border border-white/15 bg-white/10 px-6 py-5 text-center shadow-sm">
              <p className="text-xs uppercase tracking-wide text-neutral-300">
                {formatDate(match.date)}
              </p>
              <strong className="mt-2 block text-4xl font-black">
                {score}
              </strong>
            </div>
            <TeamBadge
              className="rounded-lg bg-white p-4 dark:bg-neutral-900"
              {...match.awayTeam}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Venue"
          value={match.venue ?? "TBD"}
          helper={match.city ?? "City TBD"}
        />
        <StatCard
          label="Stage"
          value={match.stage ?? "Match"}
          helper={match.tournament}
        />
        <StatCard
          label="Status"
          value={match.status}
          helper="API-ready state"
        />
      </section>

      <section className="grid gap-4 ">
        <Card>
          <CardContent className="grid gap-4 p-5">
            <SectionHeader
              eyebrow="Lineup"
              title="Lineup preview"
              description="Squad and formation data will appear when the API is ready."
            />
            <Separator />
            <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              Lineups have not been published.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-4 p-5">
            <SectionHeader
              eyebrow="Timeline"
              title="Match events"
              description="Live events can plug into this section later."
            />
            <Separator />
            <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              No timeline events available yet.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
