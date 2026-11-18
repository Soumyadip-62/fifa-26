import { DataFreshness } from "@/components/football/DataFreshness";
import { SectionHeader } from "@/components/common/SectionHeader";
import { getFixtureData } from "@/lib/api/fixtures";
import { MatchesExplorer } from "./MatchesExplorer";

export async function MatchesPage({
  initialCompetition = "all",
  initialStatus = "all",
}: {
  initialCompetition?: string;
  initialStatus?: string;
} = {}) {
  const { items, competitions, errors: leagueErrors } = await getFixtureData();

  const selectedCompetition = competitions.some(
    (competition) => competition.id === initialCompetition,
  )
    ? initialCompetition
    : "all";
  const selectedStatus = ["all", "live", "upcoming", "finished"].includes(
    initialStatus,
  )
    ? initialStatus
    : "all";

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Fixtures and results"
        title="Matches"
        description="Browse every competition, stage and match status from one fixture list."
      />
      <DataFreshness />
      <MatchesExplorer
        key={`${selectedCompetition}:${selectedStatus}`}
        initialCompetition={selectedCompetition}
        initialStatus={selectedStatus}
        items={items}
        competitions={competitions}
        leagueErrors={leagueErrors}
      />
    </div>
  );
}
