import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeader } from "@/components/common/SectionHeader";
import { getFixtureData } from "@/lib/api/fixtures";
import { FixtureErrors } from "@/components/football/FixtureErrors";
import { TeamMark } from "@/components/football/TeamMark";

export default async function CompetitionsPage() {
  const { competitions, items, errors } = await getFixtureData();
  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Every competition. One matchday."
        title="Competitions"
        description="Explore fixtures, tables and teams from the Premier League, La Liga, Champions League and Bundesliga."
      />
      <div className="results-meta">
        <p>
          <strong>{competitions.length}</strong> competitions
        </p>
        <span>Club football</span>
      </div>
      <div className="competition-directory">
        {competitions.map((competition) => {
          const fixtures = items.filter(
            (item) => item.match.competitionId === competition.id,
          );
          const teams = new Set(
            fixtures
              .flatMap((item) => [item.match.homeTeamId, item.match.awayTeamId])
              .filter(
                (id) =>
                  !id.startsWith("unconfirmed-") && !id.startsWith("tbc-"),
              ),
          ).size;
          return (
            <Link
              key={competition.id}
              href={`/competitions/${competition.id}`}
              className={`competition-directory-card competition-directory-${competition.id}`}
            >
              <div className="competition-directory-top">
                <span
                  className="competition-crest"
                  data-competition={competition.id}
                >
                  <TeamMark
                    team={{
                      name: competition.name,
                      shortName: competition.shortName,
                      logoUrl: competition.emblem || "",
                    }}
                    showName={false}
                    size="lg"
                  />
                </span>
                <ArrowUpRight aria-hidden="true" />
              </div>
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-wider text-primary">
                  {competition.region || "International"}
                </p>
                <h2>{competition.name}</h2>
                <p>
                  {competition.season} · {competition.format}
                </p>
              </div>
              <div className="competition-directory-counts">
                {errors[competition.id] ? (
                  <span>Fixtures currently unavailable</span>
                ) : (
                  <>
                    <span>
                      <strong>{teams}</strong>teams
                    </span>
                    <span>
                      <strong>{fixtures.length}</strong>fixtures
                    </span>
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      <FixtureErrors errors={errors} />
    </div>
  );
}
