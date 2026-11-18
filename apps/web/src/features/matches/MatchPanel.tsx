import { useId, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export function MatchPanel({
  title,
  icon: Icon,
  children,
  actions,
  className,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <Card
      role="region"
      aria-labelledby={id}
      className={cn("nm-panel", className)}
    >
      <div className="nm-panel-heading">
        <h2 id={id}>
          <Icon aria-hidden="true" />
          {title}
        </h2>
        {actions}
      </div>
      {children}
    </Card>
  );
}

export function MatchEmpty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="nm-empty">
      <span className="nm-empty-orbit" aria-hidden="true" />
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}
