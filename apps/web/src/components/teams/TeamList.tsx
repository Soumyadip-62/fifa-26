import type { Team } from "@/types/team";
import { MotionReveal } from "../common/MotionReveal";
import { TeamCard } from "./TeamCard";

export type TeamListProps = {
  teams: Team[];
};

export function TeamList({ teams }: TeamListProps) {
  const sortTeamsByGroup = () => {
    const grouped = teams.reduce(
      (acc, team) => {
        const group = team.group || "Unassigned";
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(team);
        return acc;
      },
      {} as Record<string, Team[]>,
    );

    return Object.entries(grouped).map(([group, teams]) => (
      <div key={group} className="col-span-1 grid gap-3">
        <h3 className="font-heading text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
          Group {group}
        </h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 items-baseline">
          {teams.map((team, index) => (
            <MotionReveal delay={Math.min(index * 0.035, 0.18)} key={team.id}>
              <TeamCard team={team} />
            </MotionReveal>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <section
      className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2"
      aria-label="Teams"
    >
      {sortTeamsByGroup()}
    </section>
  );
}
