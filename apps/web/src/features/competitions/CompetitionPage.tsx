import { CompetitionHero } from "@/components/football/CompetitionHero";
import { DataFreshness } from "@/components/football/DataFreshness";
import Link from "next/link";
import { notFound } from "next/navigation";
import { images } from "@/assets";
import { Bracket } from "@/components/football/Bracket";
import { PlatformMatchCard } from "@/components/football/PlatformMatchCard";
import { StandingsTable } from "@/components/football/StandingsTable";
import { TeamMark } from "@/components/football/TeamMark";
import { SectionHeader } from "@/components/common/SectionHeader";
import { getCompetitionData } from "@/lib/api/football";
import type { CompetitionId } from "@/types/football";
import { CompetitionNews } from "@/features/news/CompetitionNews";
import { PremierLeaguePage } from "./PremierLeaguePage";
import { upcomingFixtures } from "@/lib/matches/fixture-order";

export async function CompetitionPage({
  competitionId,
  season,
}: {
  competitionId: string;
  season?: string;
}) {
  const validIds: CompetitionId[] = [
    "world-cup",
    "ucl",
    "premier-league",
    "la-liga",
    "bundesliga",
  ];
  if (!validIds.includes(competitionId as CompetitionId)) notFound();
  if (
    competitionId === "premier-league" ||
    competitionId === "la-liga" ||
    competitionId === "ucl" ||
    competitionId === "bundesliga"
  )
    return <PremierLeaguePage leagueId={competitionId} season={season} />;
  const data = await getCompetitionData(
    competitionId as Exclude<
      CompetitionId,
      "premier-league" | "la-liga" | "ucl" | "bundesliga"
    >,
    season,
  );
  const resolved = data.matches.map((match) => ({
    match,
    competition: data.competition,
    homeTeam: data.teams.find((team) => team.id === match.homeTeamId)!,
    awayTeam: data.teams.find((team) => team.id === match.awayTeamId)!,
  }));
  const upcoming = upcomingFixtures(resolved).slice(0, 3);
  const recent = resolved
    .filter((item) => item.match.status === "finished")
    .slice(0, 3);
  const scorers = data.players
    .filter((p) => p.stats.goals !== null)
    .sort((a, b) => (b.stats.goals ?? 0) - (a.stats.goals ?? 0))
    .slice(0, 5);

  return (
    <div className="page-shell">
      <CompetitionHero
        competition={data.competition}
        season={season}
        imageUrl={images.banners.worldCupTrophy}
        metrics={[
          { label: "Season", value: data.competition.season },
          { label: "Teams", value: data.teams.length },
          { label: "Fixtures", value: data.matches.length },
          { label: "Format", value: "Groups + knockout" },
        ]}
      />

      <DataFreshness competition={competitionId} season={season} />
      <section className="grid gap-5">
        <SectionHeader as="h2" eyebrow="Matchday" title="Next matches" />
        {upcoming.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((item) => (
              <PlatformMatchCard key={item.match.id} item={item} compact />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            No upcoming published fixtures.
          </p>
        )}
      </section>
      <section className="grid gap-5">
        <div className="flex items-end justify-between">
          <SectionHeader
            as="h2"
            eyebrow="Table"
            title={
              competitionId === "world-cup" ? "Group standings" : "Standings"
            }
          />
          <Link
            href={`/standings?competition=${competitionId}`}
            className="text-xs font-bold text-primary"
          >
            Full table
          </Link>
        </div>
        <StandingsTable rows={data.standings} teams={data.teams} />
      </section>
      {data.bracket.length ? (
        <section className="grid gap-5">
          <SectionHeader as="h2" eyebrow="Knockout" title="Path to the final" />
          <Bracket rounds={data.bracket} teams={data.teams} />
        </section>
      ) : null}
      <section className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="grid content-start gap-7">
          <SectionHeader as="h2" eyebrow="Clubs and nations" title="Teams" />
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
            {data.teams.map((team) => (
              <Link
                href={`/teams/${team.id}`}
                key={team.id}
                className="rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/35"
              >
                <TeamMark team={team} size="sm" />
              </Link>
            ))}
          </div>
        </div>
        <div className="grid content-start gap-7">
          <SectionHeader as="h2" eyebrow="Leaders" title="Top scorers" />
          <div className="divide-y divide-border rounded-lg border border-border bg-card p-2 dark:divide-border dark:bg-card">
            {scorers.map((player, index) => (
              <Link
                href={`/players/${player.id}`}
                key={player.id}
                className="flex items-center justify-between gap-3 rounded-md p-4 hover:bg-secondary dark:hover:bg-white/5"
              >
                <span className="text-xs">
                  <b className="mr-3 text-muted-foreground">{index + 1}</b>
                  {player.name}
                </span>
                <strong>{player.stats.goals}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {recent.length ? (
        <section className="grid gap-5">
          <SectionHeader as="h2" eyebrow="Results" title="Recent matches" />
          <div className="grid gap-6 md:grid-cols-3">
            {recent.map((item) => (
              <PlatformMatchCard key={item.match.id} item={item} compact />
            ))}
          </div>
        </section>
      ) : null}
      <CompetitionNews competitionId="world-cup" />
    </div>
  );
}
