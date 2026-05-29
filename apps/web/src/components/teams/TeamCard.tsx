import Link from "next/link";
import { TeamBadge } from "@/components/common/TeamBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Team } from "@/types/team";
import Image from "next/image";

export type TeamCardProps = {
  team: Team;
};

export function TeamCard({ team }: TeamCardProps) {
  const dummyTeamURL =
    "https://r2.thesportsdb.com/images/media/league/badge/e7er5g1696521789.png";
  return (
    <Link
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
      href={`/teams/${team.id}`}
    >
      <Card className="h-full bg-white/95 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:bg-neutral-950/90 dark:hover:border-emerald-700">
        <CardContent className="grid gap-5 p-5 ">
          <Image
            src={team.image_url! || dummyTeamURL}
            alt={`${team.name} logo`}
            width={100}
            height={100}
            className=" mx-auto"
          />
          <div className="flex items-start justify-between gap-3">
            <TeamBadge {...team} ranking={team.fifaRanking} compact />
            {team.group ? <Badge variant="outline">{team.group}</Badge> : null}
          </div>
          {team.stats ? (
            <div className="grid grid-cols-3 rounded-lg bg-neutral-100 p-3 text-center text-sm dark:bg-neutral-900">
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
              Coach: {team.coach}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
