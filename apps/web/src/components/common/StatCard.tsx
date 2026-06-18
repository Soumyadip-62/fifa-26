import { Card, CardContent } from "@/components/ui/card";
import { MotionReveal } from "./MotionReveal";
import { Activity } from "lucide-react";

export type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  // Determine color theme based on stat label
  const isTeams = label.toLowerCase().includes("team");
  const isFixtures = label.toLowerCase().includes("fixture") || label.toLowerCase().includes("match");
  
  const strokeColor = isTeams 
    ? "stroke-blue-500" 
    : isFixtures 
      ? "stroke-green-500" 
      : "stroke-orange-500";

  const glowColor = isTeams 
    ? "shadow-blue-500/10" 
    : isFixtures 
      ? "shadow-green-500/10" 
      : "shadow-orange-500/10";

  return (
    <MotionReveal>
      <Card className="overflow-hidden ios-glass ios-widget border-0 shadow-sm transition hover:scale-[1.01] hover:shadow-md">
        <CardContent className="p-6 flex items-center justify-between gap-4">
          <div className="grid gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {label}
            </p>
            <p className="font-heading text-3xl font-black leading-none text-zinc-950 dark:text-white">
              {value}
            </p>
            {helper ? (
              <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                {helper}
              </p>
            ) : null}
          </div>

          <div className={`relative flex items-center justify-center h-14 w-14 rounded-full bg-zinc-100 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5 shadow-inner ${glowColor}`}>
            {/* SVG Activity Ring */}
            <svg className="absolute inset-0 -rotate-90 h-full w-full">
              <circle
                cx="28"
                cy="28"
                r="22"
                className="stroke-zinc-200 dark:stroke-zinc-800"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                className={`${strokeColor} transition-all duration-1000`}
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={138}
                strokeDashoffset={35}
                strokeLinecap="round"
              />
            </svg>
            <Activity className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
          </div>
        </CardContent>
      </Card>
    </MotionReveal>
  );
}

