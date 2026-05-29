import { Card, CardContent } from "@/components/ui/card";

export type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <Card className="overflow-hidden border-l-4 border-l-emerald-600 bg-white/95 dark:border-l-emerald-400 dark:bg-neutral-950/85">
      <CardContent className="p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {label}
        </p>
        <p className="mt-2 text-3xl font-black leading-none text-neutral-950 dark:text-neutral-50">
          {value}
        </p>
        {helper ? (
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {helper}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
