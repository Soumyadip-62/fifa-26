import Link from "next/link";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PlayerAvatar } from "@/components/common/PlayerAvatar";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatCard } from "@/components/common/StatCard";
import { TeamBadge } from "@/components/common/TeamBadge";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getTeamById } from "@/lib/api/teams";

export type TeamDetailsPageProps = {
  teamId: string;
};

export async function TeamDetailsPage({ teamId }: TeamDetailsPageProps) {
  try {
    const team = await getTeamById(teamId);

    if (!team) {
      return (
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <EmptyState title="Team not found" description="The requested team is not available in the mock data." />
          <Link className={buttonVariants({ variant: "outline" })} href="/teams">
            Back to teams
          </Link>
        </div>
      );
    }

    return (
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-neutral-950 p-5 text-white shadow-sm ring-1 ring-white/10 sm:p-8">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <TeamBadge className="rounded-xl bg-white p-4 dark:bg-neutral-900" {...team} ranking={team.fifaRanking} />
            <div className="flex flex-wrap gap-2">
              {team.group ? <Badge variant="success">{team.group}</Badge> : null}
              {team.coach ? <Badge variant="outline" className="border-white/30 text-white">Coach: {team.coach}</Badge> : null}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Ranking" value={team.fifaRanking ?? "TBD"} />
          <StatCard label="Played" value={team.stats?.played ?? 0} />
          <StatCard label="Wins" value={team.stats?.won ?? 0} />
          <StatCard label="Goals for" value={team.stats?.goalsFor ?? 0} />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="grid gap-4 p-5">
              <SectionHeader eyebrow="Profile" title="Team details" description={`${team.country} tournament profile.`} />
              <dl className="grid gap-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500 dark:text-neutral-400">Country</dt>
                  <dd className="font-semibold text-neutral-950 dark:text-neutral-50">{team.country}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500 dark:text-neutral-400">Group</dt>
                  <dd className="font-semibold text-neutral-950 dark:text-neutral-50">{team.group ?? "TBD"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="grid gap-4 p-5">
              <SectionHeader eyebrow="Squad" title="Player preview" description="Player cards are ready for future squad data." />
              {team.players?.length ? (
                <div className="grid gap-3">
                  {team.players.map((player) => (
                    <div className="flex items-center gap-3 rounded-lg bg-neutral-100 p-3 dark:bg-neutral-900" key={player.id}>
                      <PlayerAvatar name={player.name} />
                      <div>
                        <p className="font-semibold text-neutral-950 dark:text-neutral-50">{player.name}</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{player.position}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">No players added for this team.</p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    );
  } catch {
    return (
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState message="Failed to load team details." />
      </div>
    );
  }
}
