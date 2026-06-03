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
      <div key={group} className="col-span-1 grid gap-4">
        <h3 className="font-heading w-fit rounded-md border border-emerald-700/15 bg-emerald-50 px-3 py-1.5 text-sm font-black uppercase tracking-wide text-emerald-900 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-200">
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
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2"
      aria-label="Teams"
    >
      {sortTeamsByGroup()}
    </section>
  );
}
