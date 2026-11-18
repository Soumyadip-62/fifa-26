import Link from "next/link";
import { Trophy, ChevronRight } from "lucide-react";
import { TeamMark } from "@/components/football/TeamMark";
import { images } from "@/assets";
import type { Competition } from "@/types/football";
import { DashboardPanel } from "./DashboardPanel";

const labels = {
  "world-cup": "World Cup",
  "premier-league": "Premier League",
  "la-liga": "La Liga",
  ucl: "Champions League",
  bundesliga: "Bundesliga",
};

export function CompetitionCards({
  competitions,
}: {
  competitions: Competition[];
}) {
  return (
    <DashboardPanel
      id="competitions-heading"
      title="Competitions"
      icon={Trophy}
      href="/competitions"
      className="dashboard-competitions"
    >
      <div
        className="dashboard-competition-list"
        aria-label="Browse competitions"
      >
        {competitions.map((competition) => (
          <Link
            key={competition.id}
            href={`/competitions/${competition.id}`}
            className={`dashboard-competition-card competition-${competition.id}`}
          >
            <span className="dashboard-competition-mark">
              <TeamMark
                team={{
                  name: competition.name,
                  shortName: competition.shortName,
                  logoUrl:
                    competition.emblem ||
                    (competition.id === "world-cup"
                      ? images.logos.fifa_logo
                      : ""),
                }}
                showName={false}
                size="md"
              />
            </span>
            <strong>{labels[competition.id]}</strong>
            <span>{competition.region || "International"}</span>
            <ChevronRight
              aria-hidden="true"
              className="competition-card-arrow"
            />
          </Link>
        ))}
      </div>
    </DashboardPanel>
  );
}
