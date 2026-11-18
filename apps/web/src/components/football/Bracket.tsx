import type { BracketRound, FootballTeam } from "@/types/football";

export function Bracket({
  rounds,
  teams,
}: {
  rounds: BracketRound[];
  teams: FootballTeam[];
}) {
  return (
    <div className="scrollbar-hide overflow-x-auto pb-2">
      <div className="grid min-w-max grid-flow-col items-center gap-4">
        {rounds.map((round) => (
          <section key={round.name} className="w-60">
            <h3 className="mb-3 text-[10px] font-black uppercase text-muted-foreground">
              {round.name}
            </h3>
            <div className="grid gap-3">
              {round.matches.map((match) => {
                const home = teams.find((team) => team.id === match.homeTeamId);
                const away = teams.find((team) => team.id === match.awayTeamId);
                return (
                  <article
                    key={match.id}
                    className="rounded-lg border border-border bg-card p-3 text-xs shadow-none dark:border-border dark:bg-card"
                  >
                    <div className="flex items-center justify-between gap-3 py-1">
                      <span className="truncate font-bold">
                        {home?.name ?? "TBD"}
                      </span>
                      <strong>{match.homeScore ?? "-"}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-border py-1.5 dark:border-border">
                      <span className="truncate font-bold">
                        {away?.name ?? "TBD"}
                      </span>
                      <strong>{match.awayScore ?? "-"}</strong>
                    </div>
                    <div className="mt-1 flex justify-between text-[9px] uppercase text-muted-foreground">
                      <span>{match.status}</span>
                      <span>{match.aggregate}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
