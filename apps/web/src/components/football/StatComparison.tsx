import type { MatchStat } from "@/types/football";

export function StatComparison({ stats }: { stats: MatchStat[] }) {
  return (
    <div className="divide-y divide-border dark:divide-border">
      {stats.map((stat) => {
        const total = stat.home + stat.away || 1;
        const homeWidth = `${Math.round((stat.home / total) * 100)}%`;
        return (
          <div key={stat.label} className="py-5">
            <div className="mb-3 grid grid-cols-[48px_1fr_48px] text-sm">
              <strong>
                {stat.home}
                {stat.suffix}
              </strong>
              <span className="text-center text-[10px] font-bold uppercase text-muted-foreground">
                {stat.label}
              </span>
              <strong className="text-right">
                {stat.away}
                {stat.suffix}
              </strong>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-blue-500">
              <span className="bg-emerald-500" style={{ width: homeWidth }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
