import { notFound } from "next/navigation";
import { isActiveCompetition } from "@/lib/competitions";
import { PremierLeaguePage } from "./PremierLeaguePage";

export function CompetitionPage({
  competitionId,
  season,
}: {
  competitionId: string;
  season?: string;
}) {
  if (!isActiveCompetition(competitionId)) notFound();
  return <PremierLeaguePage leagueId={competitionId} season={season} />;
}
