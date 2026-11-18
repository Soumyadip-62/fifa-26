import { Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-3 break-words text-3xl font-semibold tabular-nums text-foreground">
            {value}
          </p>
          {helper && (
            <p className="mt-2 text-[11px] text-muted-foreground">{helper}</p>
          )}
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Activity className="size-4" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}
