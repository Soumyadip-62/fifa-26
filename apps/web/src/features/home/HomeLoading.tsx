import { Radio, Trophy, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardPanel } from "./DashboardPanel";

export function PanelLoading({
  title,
  icon,
  className = "",
}: {
  title: string;
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <DashboardPanel
      id={`loading-${title.replaceAll(" ", "-")}`}
      title={title}
      icon={icon}
      className={className}
    >
      <div
        className="dashboard-loading"
        role="status"
        aria-label={`Loading ${title}`}
      >
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </DashboardPanel>
  );
}

export function HomeLoading() {
  return (
    <div className="home-dashboard" aria-busy="true">
      <div className="dashboard-hero dashboard-hero-loading">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-16 w-2/3" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="dashboard-loading-grid">
        <PanelLoading title="Live now" icon={Radio} />
        <PanelLoading title="Competitions" icon={Trophy} />
      </div>
    </div>
  );
}
