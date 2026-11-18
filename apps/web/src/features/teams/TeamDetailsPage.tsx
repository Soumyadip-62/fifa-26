import { CompetitionSelect } from "@/components/football/CompetitionSelect";
import { SeasonSelect } from "@/components/football/SeasonSelect";
import { FavouriteButton } from "@/components/football/PreferenceControls";
import Link from "next/link";
import { EmptyState } from "@/components/common/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { getPlatformTeam } from "@/lib/api/football";
import { FixtureErrors } from "@/components/football/FixtureErrors";
import { TeamProfile } from "./TeamProfile";

export async function TeamDetailsPage({
  teamId,
  competition,
  season,
}: {
  teamId: string;
  competition?: string;
  season?: string;
  group?: string;
}) {
  const data = await getPlatformTeam(teamId, competition, season);
  if (!data)
    return (
      <div className="page-shell">
        <EmptyState
          title="Team not found"
          description="This team is not available in the static directory."
        />
        <Link href="/teams" className={buttonVariants({ variant: "outline" })}>
          Back to teams
        </Link>
      </div>
    );
  return (
    <TeamProfile {...data} controls={<>
        <CompetitionSelect
          competitions={data.competitions}
          selected={data.selectedCompetition}
        />
        <SeasonSelect
          competitionId={data.selectedCompetition}
          selected={season}
        />
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">Follow team<FavouriteButton kind="teamIds" id={data.team.id} /></div>
    </>} notice={<FixtureErrors errors={data.fixtureErrors} />} />
  );
}
