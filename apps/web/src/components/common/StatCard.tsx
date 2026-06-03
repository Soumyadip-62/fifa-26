import { Card, CardContent } from "@/components/ui/card";
import { MotionReveal } from "./MotionReveal";

export type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <MotionReveal>
      <Card className="overflow-hidden border-l-4 border-l-emerald-600 bg-white/95 dark:border-l-emerald-400 dark:bg-neutral-950/85">
        <CardContent className="p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {label}
          </p>
          <p className="font-heading mt-3 text-2xl font-black leading-none text-neutral-950 dark:text-neutral-50 sm:text-3xl">
            {value}
          </p>
          {helper ? (
            <p className="mt-3 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
              {helper}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </MotionReveal>
  );
}
