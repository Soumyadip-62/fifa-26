import type { Team } from "@/types/team";
import { TeamCard } from "./TeamCard";

export type TeamListProps = {
  teams: Team[];
};

export function TeamList({ teams }: TeamListProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Teams">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </section>
  );
}
