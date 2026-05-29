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
  shortCode,
  ranking,
  compact,
  className,
}: TeamBadgeProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3 text-left", className)}>
      {/* <Image
        src={logoUrl ?? images.teams.default}
        alt={`${name} logo`}
        width={compact ? 34 : 44}
        height={compact ? 34 : 44}
        className="rounded-full bg-neutral-100 object-cover ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-700"
      /> */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <FlagIcon country={country ?? name} />
          <p
            className={cn(
              "truncate font-semibold text-neutral-950 dark:text-neutral-50",
              compact ? "text-sm" : "text-base",
            )}
          >
            {name}
          </p>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          {/* <span>{shortCode ?? country ?? "TBD"}</span> */}
          {ranking ? <span>Rank {ranking}</span> : null}
        </div>
      </div>
    </div>
  );
}
