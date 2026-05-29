import { Card, CardContent } from "@/components/ui/card";

export type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <Card className="bg-white/90 dark:bg-neutral-950/80">
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{label}</p>
        <p className="mt-2 text-2xl font-bold text-neutral-950 dark:text-neutral-50">{value}</p>
        {helper ? <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{helper}</p> : null}
      </CardContent>
    </Card>
  );
}
