import { DataFreshness } from "@/components/football/DataFreshness";
import { SectionHeader } from "@/components/common/SectionHeader";
import { getMatchPage } from "@/lib/api/match-pages";
import { MatchesExplorer } from "./MatchesExplorer";

export async function MatchesPage({
  initialCompetition = "all",
  initialStatus = "all",
}: {
  initialCompetition?: string;
  initialStatus?: string;
} = {}) {
  const selectedCompetition = [
    "all",
    "premier-league",
    "la-liga",
    "ucl",
    "bundesliga",
  ].includes(initialCompetition)
    ? initialCompetition
    : "all";
  const selectedStatus = ["all", "live", "upcoming", "finished"].includes(
    initialStatus,
  )
    ? initialStatus
    : "all";
  const firstPage = await getMatchPage({
    competition: selectedCompetition,
    status: selectedStatus,
    stage: "all",
    day: "all",
    q: "",
    page: 1,
    limit: 24,
  });

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Fixtures and results"
        title="Matches"
        description="Browse every competition, stage and match status from one fixture list."
      />
      <DataFreshness data={firstPage} />
      <MatchesExplorer
        key={`${selectedCompetition}:${selectedStatus}`}
        initialCompetition={selectedCompetition}
        initialStatus={selectedStatus}
        initialPage={firstPage}
      />
    </div>
  );
}
