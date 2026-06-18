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
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      href={teamHref}
    >
      <Card className="h-full overflow-hidden border border-black/5 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md rounded-[28px] shadow-sm transition hover:scale-[1.01] hover:shadow-md">
        <div className="relative flex h-36 items-center justify-center overflow-hidden bg-zinc-950 p-6 sm:h-40">
          <div className="absolute inset-[1px] rounded-t-[27px] bg-[linear-gradient(135deg,rgba(0,122,255,0.15),transparent_60%)]" />
          <Image
            src={teamImage}
            alt={`${team.name} logo`}
            width={100}
            height={100}
            className="relative h-24 w-24 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.3)] transition duration-300 group-hover:scale-105"
          />
        </div>
        <CardContent className="grid gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <TeamBadge {...team} ranking={team.fifaRanking} compact />
            {team.group ? (
              <Badge className="shrink-0 rounded-full border-black/5 bg-zinc-200/55 text-zinc-750 font-bold dark:border-white/5 dark:bg-zinc-800 dark:text-zinc-300" variant="outline">
                {team.group}
              </Badge>
            ) : null}
          </div>
          {team.stats ? (
            <div className="grid grid-cols-3 rounded-2xl border border-black/5 bg-zinc-100/50 p-3 text-center text-xs dark:border-white/5 dark:bg-zinc-800/10">
              <div>
                <p className="font-extrabold text-zinc-950 dark:text-white">
                  {team.stats.won}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-0.5">
                  Wins
                </p>
              </div>
              <div>
                <p className="font-extrabold text-zinc-950 dark:text-white">
                  {team.stats.goalsFor}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-0.5">
                  GF
                </p>
              </div>
              <div>
                <p className="font-extrabold text-zinc-950 dark:text-white">
                  {team.stats.goalsAgainst}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-0.5">
                  GA
                </p>
              </div>
            </div>
          ) : null}
          {team.coach ? (
            <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              Coach{" "}
              <span className="font-bold text-zinc-850 dark:text-zinc-200">
                {team.coach}
              </span>
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
