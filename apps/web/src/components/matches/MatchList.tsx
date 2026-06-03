import type { Match } from "@/types/match";
import { MotionReveal } from "../common/MotionReveal";
import { MatchCard } from "./MatchCard";

export type MatchListProps = {
  matches: Match[];
};

export function MatchList({ matches }: MatchListProps) {
  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Matches">
      {matches.map((match, index) => (
        <MotionReveal delay={Math.min(index * 0.04, 0.2)} key={match.id}>
          <MatchCard match={match} />
        </MotionReveal>
      ))}
    </section>
  );
}
