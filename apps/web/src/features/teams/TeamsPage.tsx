import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { SectionHeader } from "@/components/common/SectionHeader";
import { TeamList } from "@/components/teams/TeamList";
import { getTeams } from "@/lib/api/teams";

export async function TeamsPage() {
  try {
    const teams = await getTeams();

    return (
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Teams"
          title="Team profiles"
          description="Team details, rankings, coaches, and basic stats prepared for backend data."
        />
        {teams.length ? (
          <TeamList teams={teams} />
        ) : (
          <EmptyState title="No teams found" description="Teams will appear here once data is available." />
        )}
      </div>
    );
  } catch {
    return (
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Teams" title="Team profiles" />
        <ErrorState message="Failed to load teams." />
      </div>
    );
  }
}
