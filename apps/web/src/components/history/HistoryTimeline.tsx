import { FlagIcon } from "@/components/common/FlagIcon";
import { Card, CardContent } from "@/components/ui/card";
import { MotionReveal } from "@/components/common/MotionReveal";
import { ReadMoreText } from "@/components/common/ReadMoreText";
import type { TournamentHistory } from "@/types/history";

export type HistoryTimelineProps = {
  historyItems: TournamentHistory[];
};

export function HistoryTimeline({ historyItems }: HistoryTimelineProps) {
  return (
    <section className="grid gap-5" aria-label="Tournament history timeline">
      {historyItems.map((item, index) => (
        <MotionReveal delay={Math.min(index * 0.04, 0.2)} key={item.id}>
          <Card className="overflow-hidden border border-border bg-card dark:bg-card backdrop-blur-md rounded-lg shadow-none transition hover:scale-[1.01] hover:shadow-md">
            <CardContent className="grid gap-5 p-5 sm:grid-cols-[130px_1fr] sm:items-center">
              <div className="rounded-lg bg-secondary dark:bg-secondary p-4 text-center border border-border dark:border-border">
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-450 dark:text-muted-foreground">
                  World Cup
                </p>
                <p className="font-heading text-3xl font-black text-foreground dark:text-white my-0.5">
                  {item.year}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground dark:text-muted-foreground truncate">
                  Host: {item.host}
                </p>
              </div>
              <div className="grid gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                    Winner
                  </span>
                  <div className="size-4 overflow-hidden rounded-md border border-border bg-secondary dark:border-border">
                    <FlagIcon
                      country={item.winner}
                      className="h-full w-full object-cover scale-110"
                    />
                  </div>
                  <h2 className="font-heading text-base font-black text-foreground dark:text-white">
                    {item.winner}
                  </h2>
                </div>
                <p className="text-xs font-semibold text-muted-foreground dark:text-muted-foreground">
                  Final: {item.winner} vs {item.runnerUp ?? "TBD"}
                  {item.finalScore ? ` (${item.finalScore})` : ""}
                </p>
                {((item.winnerGoals && item.winnerGoals.length > 0) ||
                  (item.runnerUpGoals && item.runnerUpGoals.length > 0)) && (
                  <div
                    className="grid gap-1 border-t border-border dark:border-border text-[10px] text-zinc-450 dark:text-muted-foreground"
                    style={{ paddingTop: "0.5rem" }}
                  >
                    {item.winnerGoals && item.winnerGoals.length > 0 && (
                      <div className="flex items-start gap-1">
                        <span className="font-bold text-zinc-650 dark:text-muted-foreground min-w-[75px]">
                          {item.winner}:
                        </span>
                        <span>
                          ⚽{" "}
                          {item.winnerGoals
                            .map(
                              (g) =>
                                `${g.name} ${g.minute}${g.offset ? `+${g.offset}` : ""}'${g.penalty ? " (P)" : g.owngoal ? " (OG)" : ""}`,
                            )
                            .join(", ")}
                        </span>
                      </div>
                    )}
                    {item.runnerUpGoals && item.runnerUpGoals.length > 0 && (
                      <div className="flex items-start gap-1">
                        <span className="font-bold text-zinc-650 dark:text-muted-foreground min-w-[75px]">
                          {item.runnerUp}:
                        </span>
                        <span>
                          ⚽{" "}
                          {item.runnerUpGoals
                            .map(
                              (g) =>
                                `${g.name} ${g.minute}${g.offset ? `+${g.offset}` : ""}'${g.penalty ? " (P)" : g.owngoal ? " (OG)" : ""}`,
                            )
                            .join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {item.summary ? (
                  <ReadMoreText
                    className="text-xs leading-relaxed text-muted-foreground dark:text-muted-foreground"
                    maxLength={220}
                    text={item.summary}
                  />
                ) : null}
              </div>
            </CardContent>
          </Card>
        </MotionReveal>
      ))}
    </section>
  );
}
