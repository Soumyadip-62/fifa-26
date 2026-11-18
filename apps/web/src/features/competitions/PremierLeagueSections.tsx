import { EmptyState } from "@/components/common/EmptyState";
import Link from "next/link";
import { ErrorState } from "@/components/common/ErrorState";
import { PlatformMatchCard } from "@/components/football/PlatformMatchCard";
import { StandingsTable } from "@/components/football/StandingsTable";
import { TeamMark } from "@/components/football/TeamMark";
import type { PremierLeagueData } from "@/types/premier-league";
import {
  selectFixtures,
  selectResults,
  withForm,
} from "@/lib/api/premier-league-mappers";

export async function LeagueMatches({
  data,
  results = false,
}: {
  data: PremierLeagueData;
  results?: boolean;
}) {
  const section = await data.matches;
  if (section.error !== null) return <ErrorState message={section.error} />;
  const matches = results
    ? selectResults(section.data)
    : selectFixtures(section.data);
  if (!matches.length)
    return (
      <EmptyState title={results ? "No results yet" : "No upcoming fixtures"} />
    );
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {matches.map((match) => (
        <PlatformMatchCard
          key={match.id}
          compact
          item={{
            match,
            competition: data.competition,
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
          }}
        />
      ))}
    </div>
  );
}

export async function LeagueStandings({ data }: { data: PremierLeagueData }) {
  const [table, teams, matches] = await Promise.all([
    data.standings,
    data.teams,
    data.matches,
  ]);
  if (table.error !== null)
    return <ErrorState title="Standings unavailable" message={table.error} />;
  if (teams.error !== null)
    return <ErrorState title="Standings unavailable" message={teams.error} />;
  if (!table.data.length) return <EmptyState title="No standings yet" />;
  if (
    table.data.some((row) => !teams.data.some((team) => team.id === row.teamId))
  ) {
    return (
      <ErrorState
        title="Standings unavailable"
        message="The table is being updated. Please try again shortly."
      />
    );
  }
  return (
    <div className="grid gap-3">
      {matches.error !== null && (
        <p className="text-xs text-muted-foreground">
          Recent form is currently unavailable.
        </p>
      )}
      <StandingsTable
        rows={table.data}
        teams={withForm(teams.data, matches.data ?? [])}
      />
    </div>
  );
}

export async function LeagueTeams({ data }: { data: PremierLeagueData }) {
  const section = await data.teams;
  if (section.error !== null)
    return <ErrorState title="Teams unavailable" message={section.error} />;
  if (!section.data.length) return <EmptyState title="No teams available" />;
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
      {section.data.map((team) => (
        <Link
          key={team.id}
          href={`/teams/${team.id}`}
          className="rounded-lg border border-border bg-card p-3 transition hover:border-primary/35"
        >
          <TeamMark team={team} size="sm" />
        </Link>
      ))}
    </div>
  );
}

export async function LeagueScorers({ data }: { data: PremierLeagueData }) {
  const section = await data.scorers;
  if (section.error !== null)
    return (
      <ErrorState title="Top scorers unavailable" message={section.error} />
    );
  if (!section.data.length) return <EmptyState title="No scorers yet" />;
  return (
    <ol className="divide-y divide-border rounded-lg border border-border bg-card p-2 dark:divide-border dark:bg-card">
      {section.data.map((scorer, index) => (
        <li
          key={scorer.id}
          className="flex items-center justify-between gap-3 p-4"
        >
          <span className="flex items-center gap-3 text-xs">
            <b className="text-muted-foreground">{index + 1}</b>
            <span>
              {scorer.name}
              <span className="mt-1 block text-[10px] text-muted-foreground">
                {scorer.teamName}
              </span>
            </span>
          </span>
          <strong aria-label={`${scorer.goals} goals`}>{scorer.goals}</strong>
        </li>
      ))}
    </ol>
  );
}

export async function LeagueCount({
  data,
  kind,
}: {
  data: PremierLeagueData;
  kind: "teams" | "matches";
}) {
  const section = await data[kind];
  return <>{section.data?.length ?? "Unavailable"}</>;
}
