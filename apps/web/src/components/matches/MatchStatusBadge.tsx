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
        status === "live" && "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
        status === "finished" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
        status === "scheduled" && "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
        (status === "postponed" || status === "cancelled") && "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
      )}
    >
      {statusLabels[status]}
    </Badge>
  );
}
