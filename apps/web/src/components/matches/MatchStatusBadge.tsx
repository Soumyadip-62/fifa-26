import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import type { MatchStatus } from "@/types/match";

export type MatchStatusBadgeProps = {
  status: MatchStatus;
};

const statusLabels: Record<MatchStatus, string> = {
  scheduled: "Scheduled",
  live: "Live",
  finished: "Finished",
  postponed: "Postponed",
  cancelled: "Cancelled",
};

export function MatchStatusBadge({ status }: MatchStatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        status === "live" && "bg-primary/15 text-primary",
        status === "finished" && "bg-secondary text-secondary-foreground",
        status === "scheduled" && "bg-violet-500/15 text-violet-200",
        (status === "postponed" || status === "cancelled") && "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
      )}
    >
      {statusLabels[status]}
    </Badge>
  );
}
