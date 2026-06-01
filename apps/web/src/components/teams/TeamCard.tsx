import Link from "next/link";
import Image from "next/image";
import { images } from "@/assets";
import { TeamBadge } from "@/components/common/TeamBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Team } from "@/types/team";

export type TeamCardProps = {
  team: Team;
};

export function TeamCard({ team }: TeamCardProps) {
  const teamImage = team.logoUrl || team.image_url || images.teams.default;
  const teamId = team.sportsdb_team_id ?? team.id;
  const teamHref = team.group
    ? `/teams/${teamId}?group=${encodeURIComponent(team.group)}`
    : `/teams/${teamId}`;

  return (
    <Link
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
      href={teamHref}
    >
      <Card className="h-full overflow-hidden transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg dark:hover:border-emerald-500/60">
        <div className="relative flex h-44 items-center justify-center overflow-hidden bg-neutral-950 p-6">
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-emerald-700 via-cyan-600 to-amber-400" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(21,128,61,0.26),transparent_45%),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:auto,44px_44px]" />
          <Image
            src={teamImage}
            alt={`${team.name} logo`}
            width={136}
            height={136}
            className="relative h-32 w-32 object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.35)] transition duration-300 group-hover:scale-105"
          />
        </div>
        <CardContent className="grid gap-5 p-5">
          <div className="flex items-start justify-between gap-3">
            <TeamBadge {...team} ranking={team.fifaRanking} compact />
            {team.group ? (
              <Badge className="shrink-0" variant="outline">
                {team.group}
              </Badge>
            ) : null}
          </div>
          {team.stats ? (
            <div className="grid grid-cols-3 rounded-lg border border-neutral-200/80 bg-neutral-50 p-3 text-center text-sm dark:border-white/10 dark:bg-white/5">
              <div>
                <p className="font-bold text-neutral-950 dark:text-neutral-50">
                  {team.stats.won}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Wins
                </p>
              </div>
              <div>
                <p className="font-bold text-neutral-950 dark:text-neutral-50">
                  {team.stats.goalsFor}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  GF
                </p>
              </div>
              <div>
                <p className="font-bold text-neutral-950 dark:text-neutral-50">
                  {team.stats.goalsAgainst}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  GA
                </p>
              </div>
            </div>
          ) : null}
          {team.coach ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Coach{" "}
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {team.coach}
              </span>
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
