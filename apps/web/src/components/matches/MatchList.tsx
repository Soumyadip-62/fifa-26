import type { Match } from "@/types/match";
import { MatchCard } from "./MatchCard";

export type MatchListProps = {
  matches: Match[];
};

export function MatchList({ matches }: MatchListProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Matches">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </section>
  );
}
