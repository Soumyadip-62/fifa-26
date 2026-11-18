import Link from "next/link";
import { Suspense } from "react";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StandingsTable } from "@/components/football/StandingsTable";
import { getCompetitionData, getFootballData } from "@/lib/api/football";
import type { CompetitionId } from "@/types/football";
import { LeagueStandings } from "@/features/competitions/PremierLeagueSections";
import { footballDataError } from "@/lib/api/premier-league";
type Props = { searchParams: Promise<{ competition?: string }> };
async function Table({ id }: { id: CompetitionId }) {
  if (
    id === "premier-league" ||
    id === "la-liga" ||
    id === "ucl" ||
    id === "bundesliga"
  ) {
    let data;
    try {
      data = await getCompetitionData(id);
    } catch (error) {
      return (
        <ErrorState
          title="Standings unavailable"
          message={footballDataError(error)}
        />
      );
    }
    return (
      <div className="grid gap-4">
        <p className="text-xs font-bold text-muted-foreground">
          {data.competition.name} · {data.competition.season}
        </p>
        <LeagueStandings data={data} />
      </div>
    );
  }
  const data = await getCompetitionData(id);
  return <StandingsTable rows={data.standings} teams={data.teams} />;
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  const all = await getFootballData();
  const id = all.competitions.some((item) => item.id === params.competition)
    ? (params.competition as CompetitionId)
    : "premier-league";
  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Tables"
        title="Standings"
        description="Form, qualification positions and complete competition records."
      />
      <nav
        className="filter-tabs standings-competition-tabs"
        aria-label="Standings competitions"
      >
        {all.competitions.map((item) => (
          <Link
            key={item.id}
            aria-current={item.id === id ? "page" : undefined}
            href={`/standings?competition=${item.id}`}
            className={`shrink-0 rounded-full px-5 py-3 text-xs font-bold ${item.id === id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground dark:bg-card dark:text-secondary-foreground"}`}
          >
            {item.shortName}
          </Link>
        ))}
      </nav>
      <Suspense
        key={id}
        fallback={<LoadingState label="Loading standings..." />}
      >
        <Table id={id} />
      </Suspense>
    </div>
  );
}
