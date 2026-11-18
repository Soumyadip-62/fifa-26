import { SectionHeader } from "@/components/common/SectionHeader";
import { StandingsTable } from "@/components/football/StandingsTable";
import { getCompetitionData } from "@/lib/api/football";
export default async function Page() {
  const d = await getCompetitionData("world-cup");
  return (
    <div className="page-shell">
      <SectionHeader
        title="World Cup group standings"
        description="Calculated from saved group-stage results."
      />
      <StandingsTable rows={d.standings} teams={d.teams} />
    </div>
  );
}
