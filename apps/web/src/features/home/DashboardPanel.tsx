import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function DashboardPanel({
  id,
  title,
  icon: Icon,
  href,
  action = "View all",
  className = "",
  children,
}: {
  id: string;
  title: string;
  icon: LucideIcon;
  href?: string;
  action?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card
      className={`dashboard-panel ${className}`}
      role="region"
      aria-labelledby={id}
    >
      <div className="dashboard-panel-heading">
        <h2 id={id}>
          <Icon aria-hidden="true" />
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="dashboard-view-all"
            aria-label={`${action}: ${title}`}
          >
            {action}
            <ArrowUpRight aria-hidden="true" />
          </Link>
        )}
      </div>
      {children}
    </Card>
  );
}
