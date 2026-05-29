import { FlagIcon } from "@/components/common/FlagIcon";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TournamentHistory } from "@/types/history";

export type HistoryTimelineProps = {
  historyItems: TournamentHistory[];
};

export function HistoryTimeline({ historyItems }: HistoryTimelineProps) {
  return (
    <section className="grid gap-4" aria-label="Tournament history timeline">
      {historyItems.map((item) => (
        <Card className="bg-white/95 dark:bg-neutral-950/90" key={item.id}>
          <CardContent className="grid gap-4 p-5 sm:grid-cols-[140px_1fr] sm:items-center">
            <div className="rounded-xl bg-emerald-950 p-4 text-white dark:bg-emerald-950/70">
              <p className="text-sm text-emerald-100">World Cup</p>
              <p className="text-3xl font-black">{item.year}</p>
              <p className="mt-2 text-sm text-emerald-100">Host: {item.host}</p>
            </div>
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success">Winner</Badge>
                <FlagIcon country={item.winner} />
                <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50">{item.winner}</h2>
              </div>
              <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                Final: {item.winner} vs {item.runnerUp ?? "TBD"}
                {item.finalScore ? `, ${item.finalScore}` : ""}
              </p>
              {item.summary ? <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">{item.summary}</p> : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
