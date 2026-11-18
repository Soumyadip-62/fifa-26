"use client";
import Image from "next/image";
import { images } from "@/assets";
import { FlagIcon } from "@/components/common/FlagIcon";
import { cn } from "@/lib/utils/cn";

export type TeamBadgeProps = {
  name: string;
  country?: string;
  logoUrl?: string;
  flagUrl?: string;
  shortCode?: string;
  ranking?: number;
  compact?: boolean;
  className?: string;
};

export function TeamBadge({
  name,
  country,
  logoUrl,
  ranking,
  compact,
  className,
}: TeamBadgeProps) {
  return (
    <div
      className={cn("flex min-w-0 items-center gap-3 text-left ", className)}
    >
      <Image
        src={logoUrl || images.teams.default}
        alt={`${name} logo`}
        width={compact ? 38 : 48}
        height={compact ? 38 : 48}
        className="rounded-lg border border-border bg-card object-contain p-1.5 shadow-none ring-1 ring-neutral-200 dark:bg-card dark:ring-white/10"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <FlagIcon country={country ?? name} />
          <p
            className={cn(
              "truncate font-semibold text-foreground dark:text-foreground text-wrap max-w-[150px]",
              compact ? "text-sm" : "text-base",
            )}
          >
            {name}
          </p>
        </div>
        <div className="text-xs text-muted-foreground dark:text-muted-foreground">
          {/* <span>{shortCode ?? country ?? "TBD"}</span> */}
          {ranking ? <span>Rank {ranking}</span> : null}
        </div>
      </div>
    </div>
  );
}
