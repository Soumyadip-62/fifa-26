"use client";
import Link from "next/link";
import { EmptyState } from "@/components/common/EmptyState";
import { PlayerAvatar } from "@/components/common/PlayerAvatar";
import PlayerDetailsDrawer from "@/components/common/PlayerDetailsDrawer";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatCard } from "@/components/common/StatCard";
import { TeamBadge } from "@/components/common/TeamBadge";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getTeamById, getTeamPlayersById } from "@/lib/api/teams";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Player } from "@/types/team";

export type TeamDetailsPageProps = {
  teamId: string;
  group?: string;
};

function getTextValue(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed || undefined;
}

function getPlayerImageUrl(player: Player) {
  return (
    getTextValue(player.strCutout) ??
    getTextValue(player.strThumb) ??
    getTextValue(player.strRender)
  );
}

function getPlayerDetails(player: Player) {
  return [
    ["Nationality", player.strNationality],
    ["Club", player.strTeam],
    ["National team", player.strTeam2],
    ["Born", player.dateBorn],
    ["Birthplace", player.strBirthLocation],
    ["Height", player.strHeight],
    ["Weight", player.strWeight],
    ["Side", player.strSide],
  ]
    .map(([label, value]) => ({ label, value: getTextValue(value) }))
    .filter((item) => item.value);
}

export function TeamDetailsPage({ teamId, group }: TeamDetailsPageProps) {
  const {
    data: team,
    error: teamError,
    isSuccess: isTeamSuccess,
  } = useSuspenseQuery({
    queryKey: ["teams", teamId],
    queryFn: () => getTeamById(teamId),
  });
  const {
    data: teamPlayers,
    error: playersError,
    isSuccess: isPlayersSuccess,
  } = useSuspenseQuery({
    queryKey: ["players", teamId],
    queryFn: () => getTeamPlayersById(teamId),
  });

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
      {isTeamSuccess && isPlayersSuccess ? (
        <>
          <section className="overflow-hidden rounded-lg bg-neutral-950 text-white shadow-[0_24px_70px_rgba(4,22,13,0.28)] ring-1 ring-white/10">
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-cyan-500 to-amber-300" />
            <div className="p-5 sm:p-8">
              <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                <TeamBadge
                  className="rounded-lg bg-white p-4 dark:bg-neutral-900"
                  ranking={team!.fifaRanking || undefined}
                  name={team!.name}
                  country={team!.country}
                  logoUrl={team!.logoUrl}
                  flagUrl={team!.flagUrl}
                  shortCode={team!.shortCode}
                />
                <div className="flex flex-wrap gap-2">
                  {group ? <Badge variant="success">{group}</Badge> : null}
                  {team!.coach ? (
                    <Badge
                      variant="outline"
                      className="border-white/30 text-white"
                    >
                      Coach: {team!.coach}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
          <section className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Ranking" value={team!.fifaRanking ?? "TBD"} />
            <StatCard label="Played" value={team!.stats?.played ?? 0} />
            <StatCard label="Wins" value={team!.stats?.won ?? 0} />
            <StatCard label="Goals for" value={team!.stats?.goalsFor ?? 0} />
          </section>
        </>
      ) : teamError && playersError ? (
        <EmptyTeamState />
      ) : null}

      <section className="grid gap-4 ">
        <Card>
          <CardContent className="grid gap-4 p-5">
            <SectionHeader
              eyebrow="Profile"
              title="Team details"
              description={`${team!.strDescriptionEN}`}
            />
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Country
                </dt>
                <dd className="font-semibold text-neutral-950 dark:text-neutral-50">
                  {team!.country}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Group
                </dt>
                <dd className="font-semibold text-neutral-950 dark:text-neutral-50">
                  {group ?? "TBD"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-4 p-5">
            <SectionHeader
              eyebrow="Squad"
              title="Player preview"
              description="Player cards are ready for future squad data."
            />
            {teamPlayers?.length ? (
              <div className="grid gap-3">
                {teamPlayers.map((player) => (
                  <PlayerDetailsDrawer key={player.id} player={player}>
                    <div
                      className="grid w-full cursor-pointer gap-4 rounded-lg border border-neutral-200/80 bg-neutral-50 p-4 text-left transition-colors hover:bg-emerald-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 sm:grid-cols-[auto_1fr]"
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.currentTarget.click();
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <PlayerAvatar
                        name={player.name}
                        imageUrl={getPlayerImageUrl(player)}
                      />
                      <div className="grid min-w-0 gap-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-neutral-950 dark:text-neutral-50">
                              {player.name}
                            </p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                              {player.position}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {player.shirtNumber ? (
                              <Badge variant="secondary">
                                No. {player.shirtNumber}
                              </Badge>
                            ) : null}
                            {getTextValue(player.strStatus) ? (
                              <Badge variant="success">
                                {getTextValue(player.strStatus)}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                        <dl className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                          {getPlayerDetails(player).map((detail) => (
                            <div key={detail.label} className="min-w-0">
                              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                {detail.label}
                              </dt>
                              <dd className="truncate text-neutral-800 dark:text-neutral-200">
                                {detail.value}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </div>
                  </PlayerDetailsDrawer>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                No players added for this team.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

const EmptyTeamState = () => {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <EmptyState
        title="Team not found"
        description="The requested team is not available in the mock data."
      />
      <Link className={buttonVariants({ variant: "outline" })} href="/teams">
        Back to teams
      </Link>
    </div>
  );
};
