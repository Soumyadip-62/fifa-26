import Link from "next/link";
import type { FootballTeam, Standing } from "@/types/football";
import { TeamMark } from "./TeamMark";

export function StandingsTable({
  rows,
  teams,
  compact = false,
  linked = true,
}: {
  rows: Standing[];
  teams: Array<
    Pick<FootballTeam, "id" | "name" | "shortName" | "logoUrl" | "form">
  >;
  compact?: boolean;
  linked?: boolean;
}) {
  const groups = [...new Set(rows.map((r) => r.group).filter(Boolean))];
  if (groups.length > 1)
    return (
      <div className="grid gap-6">
        {groups.map((group) => (
          <section key={group}>
            <h3 className="mb-2 text-sm font-bold">
              {group?.replaceAll("_", " ")}
            </h3>
            <StandingsTable
              rows={rows.filter((r) => r.group === group)}
              teams={teams}
              compact={compact}
              linked={linked}
            />
          </section>
        ))}
      </div>
    );
  return (
    <div className="standings-table">
      <p className="table-scroll-hint">Swipe to see all columns →</p>
      <table className="w-full min-w-[620px] border-collapse text-xs">
        <thead className="bg-secondary text-[10px] uppercase text-muted-foreground dark:bg-secondary">
          <tr>
            <th className="w-12 px-3 py-3 text-center">Pos</th>
            <th className="px-3 py-3 text-left">Team</th>
            <th className="px-2 py-3">P</th>
            {!compact && (
              <>
                <th className="px-2 py-3">W</th>
                <th className="px-2 py-3">D</th>
                <th className="px-2 py-3">L</th>
                <th className="px-2 py-3">GF</th>
                <th className="px-2 py-3">GA</th>
                <th className="px-2 py-3">GD</th>
              </>
            )}
            <th className="px-3 py-3">Pts</th>
            <th className="px-3 py-3 text-left">Form</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const team = teams.find((item) => item.id === row.teamId);
            if (!team) return null;
            const gd = row.goalsFor - row.goalsAgainst;
            return (
              <tr
                key={`${row.competitionId}-${row.teamId}`}
                className="border-t border-border hover:bg-secondary dark:border-border dark:hover:bg-white/5"
              >
                <td className="relative px-4 py-5 text-center font-black">
                  <span
                    className={
                      row.position <= (row.competitionId === "ucl" ? 8 : 4)
                        ? "absolute inset-y-2 left-0 w-1 rounded-r bg-emerald-500"
                        : row.competitionId === "ucl" && row.position <= 24
                          ? "absolute inset-y-2 left-0 w-1 rounded-r bg-amber-500"
                          : ""
                    }
                  />
                  {row.position}
                </td>
                <td className="px-3 py-2">
                  {linked ? (
                    <Link
                      href={`/teams/${team.id}`}
                      className="relative z-10 inline-flex hover:text-primary"
                    >
                      <TeamMark team={team} size="sm" />
                    </Link>
                  ) : (
                    <TeamMark team={team} size="sm" />
                  )}
                </td>
                <td className="px-2 text-center">{row.played}</td>
                {!compact && (
                  <>
                    <td className="px-2 text-center">{row.won}</td>
                    <td className="px-2 text-center">{row.drawn}</td>
                    <td className="px-2 text-center">{row.lost}</td>
                    <td className="px-2 text-center">{row.goalsFor}</td>
                    <td className="px-2 text-center">{row.goalsAgainst}</td>
                    <td className="px-2 text-center font-bold">
                      {gd > 0 ? "+" : ""}
                      {gd}
                    </td>
                  </>
                )}
                <td className="px-3 text-center font-black">{row.points}</td>
                <td className="px-3">
                  <span className="flex gap-1">
                    {!team.form.length && (
                      <span className="text-muted-foreground">Unavailable</span>
                    )}
                    {team.form.map((result, index) => (
                      <span
                        key={`${result}-${index}`}
                        className={`grid size-5 place-items-center rounded text-[9px] font-black text-white ${result === "W" ? "bg-emerald-500" : result === "D" ? "bg-zinc-400" : "bg-red-500"}`}
                      >
                        {result}
                      </span>
                    ))}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
