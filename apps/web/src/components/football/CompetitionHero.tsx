import Image from "next/image";
import { CalendarDays } from "lucide-react";
import type { ReactNode } from "react";
import type { Competition } from "@/types/football";
import { CompetitionBadge } from "./CompetitionBadge";
import { SeasonSelect } from "./SeasonSelect";
import { TeamMark } from "./TeamMark";

export function CompetitionHero({
  competition,
  imageUrl,
  season,
  metrics,
}: {
  competition: Competition;
  imageUrl: string;
  season?: string;
  metrics: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <section className="competition-hero" aria-labelledby="competition-title">
      <Image
        src={imageUrl}
        alt=""
        fill
        priority
        sizes="(min-width:1440px) 1380px,100vw"
        className="competition-hero-image"
      />
      <div className="competition-hero-content">
        <div className="competition-hero-identity">
          <span className="competition-crest" data-competition={competition.id}>
            <TeamMark
              team={{
                name: competition.name,
                shortName: competition.shortName,
                logoUrl: competition.emblem || "",
              }}
              size="lg"
              showName={false}
            />
          </span>
          <div>
            <CompetitionBadge competition={competition} />
            <h1 id="competition-title">{competition.name}</h1>
            <p>
              {competition.region} · {competition.format}
            </p>
          </div>
        </div>
        <div className="competition-hero-controls">
          <span>
            <CalendarDays aria-hidden="true" />
            Season {competition.season}
          </span>
          <SeasonSelect competitionId={competition.id} selected={season} />
        </div>
      </div>
      <div className="competition-hero-metrics">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
