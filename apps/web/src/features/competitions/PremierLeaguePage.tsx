import { CompetitionHero } from "@/components/football/CompetitionHero";
import { DataFreshness } from "@/components/football/DataFreshness";
import { StoredBracket } from "./StoredBracket";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { SectionHeader } from "@/components/common/SectionHeader";
import { getCompetitionData } from "@/lib/api/football";
import { footballDataError } from "@/lib/api/premier-league";
import { CompetitionNews } from "@/features/news/CompetitionNews";
import {
  LeagueCount,
  LeagueMatches,
  LeagueScorers,
  LeagueStandings,
  LeagueTeams,
} from "./PremierLeagueSections";

type LeagueId = "premier-league" | "la-liga" | "ucl" | "bundesliga";

const leagueNames: Record<LeagueId, string> = {
  "premier-league": "Premier League",
  "la-liga": "La Liga",
  ucl: "UEFA Champions League",
  bundesliga: "Bundesliga",
};

async function PremierLeagueContent({
  leagueId,
  season,
}: {
  leagueId: LeagueId;
  season?: string;
}) {
  let data;
  try {
    data = await getCompetitionData(leagueId, season);
  } catch (error) {
    return (
      <ErrorState
        title={`${leagueNames[leagueId]} unavailable`}
        message={footballDataError(error)}
      />
    );
  }
  const { competition } = data;
  return (
    <>
      <CompetitionHero
        competition={competition}
        season={season}
        imageUrl={
          leagueId === "bundesliga"
            ? "/assets/images/banners/bundesliga-banner.webp"
            : leagueId === "ucl"
              ? "/assets/images/banners/ucl-banner.jpg"
              : leagueId === "la-liga"
                ? "/assets/images/banners/la-liga-banner.jpg"
                : "/assets/images/banners/pl-banner.png"
        }
        metrics={[
          { label: "Season", value: competition.season },
          {
            label: "Teams",
            value: (
              <Suspense fallback="…">
                <LeagueCount data={data} kind="teams" />
              </Suspense>
            ),
          },
          {
            label: "Round",
            value:
              competition.currentMatchday == null
                ? "—"
                : competition.currentMatchday,
          },
          {
            label: "Fixtures",
            value: (
              <Suspense fallback="…">
                <LeagueCount data={data} kind="matches" />
              </Suspense>
            ),
          },
        ]}
      />
      <DataFreshness competition={leagueId} season={season} />
      <section className="grid gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader as="h2" eyebrow="Matchday" title="Next matches" />
          <Link
            href={`/matches?competition=${leagueId}`}
            className="text-xs font-bold text-primary"
          >
            View all matches
          </Link>
        </div>
        <Suspense fallback={<LoadingState label="Loading fixtures..." />}>
          <LeagueMatches data={data} />
        </Suspense>
      </section>
      <section className="grid gap-5">
        <div className="flex items-end justify-between">
          <SectionHeader
            as="h2"
            eyebrow="Table"
            title={leagueId === "ucl" ? "League phase" : "Standings"}
          />
          <Link
            href={`/standings?competition=${leagueId}`}
            className="text-xs font-bold text-primary"
          >
            Full table
          </Link>
        </div>
        <Suspense fallback={<LoadingState label="Loading standings..." />}>
          <LeagueStandings data={data} />
        </Suspense>
      </section>
      <section className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="grid content-start gap-7">
          <SectionHeader as="h2" eyebrow="Clubs" title="Teams" />
          <Suspense fallback={<LoadingState label="Loading teams..." />}>
            <LeagueTeams data={data} />
          </Suspense>
        </div>
        <div className="grid content-start gap-7">
          <SectionHeader as="h2" eyebrow="Leaders" title="Top scorers" />
          <Suspense fallback={<LoadingState label="Loading scorers..." />}>
            <LeagueScorers data={data} />
          </Suspense>
        </div>
      </section>
      {leagueId === "ucl" ? (
        <StoredBracket competitionId="ucl" season={season} />
      ) : null}
      <section className="grid gap-5">
        <SectionHeader as="h2" eyebrow="Results" title="Recent matches" />
        <Suspense fallback={<LoadingState label="Loading results..." />}>
          <LeagueMatches data={data} results />
        </Suspense>
      </section>
    </>
  );
}

export function PremierLeaguePage({
  leagueId = "premier-league",
  season,
}: { leagueId?: LeagueId; season?: string } = {}) {
  return (
    <div className="page-shell">
      <Suspense
        fallback={
          <LoadingState label={`Loading ${leagueNames[leagueId]}...`} />
        }
      >
        <PremierLeagueContent leagueId={leagueId} season={season} />
      </Suspense>
      <CompetitionNews competitionId={leagueId} />
    </div>
  );
}
