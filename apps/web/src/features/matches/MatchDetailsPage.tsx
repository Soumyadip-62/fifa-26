"use client";
import Link from "next/link";
import Image from "next/image";
import { EmptyState } from "@/components/common/EmptyState";
import { MotionReveal } from "@/components/common/MotionReveal";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatCard } from "@/components/common/StatCard";
import { MatchStatusBadge } from "@/components/matches/MatchStatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getMatchById } from "@/lib/api/matches";
import { FormattedDateTime } from "@/components/common/FormattedDateTime";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { TeamLogoImage } from "@/components/matches/TeamLogoImage";
import { getTeamPlayersById } from "@/lib/api/teams";
import { MatchTeamPlayersSection } from "./MatchTeamPlayersSection";
import { VenueDetailsDrawer } from "@/components/matches/VenueDetailsDrawer";
import { searchVenueByName } from "@/lib/api/venues";
import { images } from "@/assets";

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

  const {
    data: homeTeamPlayers,
    isPending: isHomeTeamPlayersPending,
    error: homeTeamPlayersError,
  } = useQuery({
    enabled: Boolean(match.homeTeam.teamID),
    queryKey: ["players", match.homeTeam.teamID],
    queryFn: () => getTeamPlayersById(match.homeTeam.teamID!),
  });

  const {
    data: awayTeamPlayers,
    isPending: isAwayTeamPlayersPending,
    error: awayTeamPlayersError,
  } = useQuery({
    enabled: Boolean(match.awayTeam.teamID),
    queryKey: ["players", match.awayTeam.teamID],
    queryFn: () => getTeamPlayersById(match.awayTeam.teamID!),
  });

  const { data: venuesData } = useQuery({
    enabled: Boolean(match?.venue),
    queryKey: ["venueSearch", match?.venue],
    queryFn: () => searchVenueByName(match.venue!),
  });

  const venueDetails = venuesData && venuesData.length > 0 ? venuesData[0] : null;
  const bannerBgImage = venueDetails?.strThumb || match.venueImageUrl || images.banners.sfStadium;

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
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <MotionReveal>
        <section className="relative overflow-hidden rounded-xl bg-neutral-950 text-white shadow-[0_24px_70px_rgba(4,22,13,0.28)] ring-1 ring-white/10">
          {/* STADIUM BACKGROUND IMAGE */}
          <div className="absolute inset-0 z-0">
            <Image
              src={bannerBgImage}
              alt={match.venue ? `${match.venue} stadium` : "Stadium"}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-60"
            />
            {/* GRADIENT OVERLAYS */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/10 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/10 via-transparent to-neutral-950/20" />
          </div>

          {/* INNER CONTENT */}
          <div className="relative z-10 grid gap-6 p-6 sm:p-8 md:p-10 md:py-16">
            <div className="flex flex-wrap items-center gap-3">
              <MatchStatusBadge status={match.status} />
              <span className="text-sm font-semibold text-neutral-300">
                {match.stage ?? match.tournament}
              </span>
              {match.group ? (
                <span className="text-sm font-semibold text-neutral-300">
                  Group {match.group}
                </span>
              ) : null}
            </div>

            <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-8">
              {/* Home Team */}
              <div className="flex flex-col items-center md:items-end text-center md:text-right gap-3">
                <TeamLogoImage team={match.homeTeam} size={100} className="shadow-lg transform transition hover:scale-105" />
                <div>
                  <h2 className="font-heading text-xl font-black tracking-tight text-white md:text-2xl">
                    {match.homeTeam.name}
                  </h2>
                  <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
                    {match.homeTeam.shortCode}
                  </span>
                </div>
              </div>

              {/* VS & Score Board */}
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="rounded-xl border border-white/20 bg-neutral-950/80 backdrop-blur-md px-6 py-4 text-center shadow-2xl min-w-[140px]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    <FormattedDateTime date={match.date} />
                  </p>
                  <strong className="font-heading mt-1.5 block text-3xl font-black tracking-tighter text-white md:text-4xl">
                    {score}
                  </strong>
                </div>
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
                <TeamLogoImage team={match.awayTeam} size={100} className="shadow-lg transform transition hover:scale-105" />
                <div>
                  <h2 className="font-heading text-xl font-black tracking-tight text-white md:text-2xl">
                    {match.awayTeam.name}
                  </h2>
                  <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
                    {match.awayTeam.shortCode}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </MotionReveal>

      <section className="grid gap-5 sm:grid-cols-3">
        {match.venue ? (
          <VenueDetailsDrawer venueName={match.venue}>
            <div className="cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md rounded-lg overflow-hidden">
              <StatCard
                label="Venue"
                value={match.venue}
                helper={match.city ?? "City TBD"}
              />
            </div>
          </VenueDetailsDrawer>
        ) : (
          <StatCard
            label="Venue"
            value="TBD"
            helper="City TBD"
          />
        )}
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

      <div
        style={{ padding: "24px" }}
        className=" rounded-xl bg-neutral-300 dark:bg-neutral-800"
      >
        <h3 className="text-md md:text-xl font-semibold font-sans">
          These lineups are not confirmed yet!
        </h3>
      </div>

      <section className="grid gap-5 lg:grid-cols-2">
        <MatchTeamPlayersSection
          error={homeTeamPlayersError}
          isPending={Boolean(match.homeTeam.teamID) && isHomeTeamPlayersPending}
          players={homeTeamPlayers}
          side="home"
          team={match.homeTeam}
        />
        <MatchTeamPlayersSection
          error={awayTeamPlayersError}
          isPending={Boolean(match.awayTeam.teamID) && isAwayTeamPlayersPending}
          players={awayTeamPlayers}
          side="away"
          team={match.awayTeam}
        />
      </section>

      <MotionReveal className="grid gap-4">
        <Card>
          <CardContent className="grid gap-5 p-5 sm:p-6">
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
      </MotionReveal>
    </div>
  );
}
