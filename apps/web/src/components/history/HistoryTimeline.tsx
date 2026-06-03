import { FlagIcon } from "@/components/common/FlagIcon";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MotionReveal } from "@/components/common/MotionReveal";
import { ReadMoreText } from "@/components/common/ReadMoreText";
import type { TournamentHistory } from "@/types/history";

export type HistoryTimelineProps = {
  historyItems: TournamentHistory[];
};

export function HistoryTimeline({ historyItems }: HistoryTimelineProps) {
  return (
    <section className="grid gap-4" aria-label="Tournament history timeline">
      {historyItems.map((item, index) => (
        <MotionReveal delay={Math.min(index * 0.04, 0.2)} key={item.id}>
          <Card className="overflow-hidden">
            <CardContent className="grid gap-5 p-5 sm:grid-cols-[140px_1fr] sm:items-center sm:p-6">
              <div className="rounded-lg bg-neutral-950 p-4 text-white ring-1 ring-emerald-400/20 dark:bg-emerald-950/55">
                <p className="text-sm text-emerald-100">World Cup</p>
                <p className="font-heading text-3xl font-black">{item.year}</p>
                <p className="mt-2 text-sm leading-6 text-emerald-100">
                  Host: {item.host}
                </p>
              </div>
              <div className="grid gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="success">Winner</Badge>
                  <FlagIcon country={item.winner} />
                  <h2 className="font-heading text-lg font-bold text-neutral-950 dark:text-neutral-50 sm:text-xl">{item.winner}</h2>
                </div>
                <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                  Final: {item.winner} vs {item.runnerUp ?? "TBD"}
                  {item.finalScore ? `, ${item.finalScore}` : ""}
                </p>
                {item.summary ? (
                  <ReadMoreText
                    className="text-sm leading-7 text-neutral-700 dark:text-neutral-300"
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
