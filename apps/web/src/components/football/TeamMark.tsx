"use client";

import Image from "next/image";
import { useState } from "react";
import type { FootballTeam } from "@/types/football";
import { cn } from "@/lib/utils/cn";

export function TeamMark({
  team,
  size = "md",
  showName = true,
  reverse = false,
}: {
  team: Pick<FootballTeam, "name" | "shortName" | "logoUrl">;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  reverse?: boolean;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const imageSize = size === "lg" ? 72 : size === "md" ? 42 : 28;
  return (
    <span
      className={cn(
        "flex min-w-0 items-center gap-2.5",
        reverse && "flex-row-reverse text-right",
      )}
    >
      <span
        className={cn(
          "team-mark-logo relative shrink-0 overflow-hidden rounded-lg bg-transparent",
          size === "lg"
            ? "size-[72px]"
            : size === "md"
              ? "size-[42px]"
              : "size-7",
        )}
      >
        {team.logoUrl && failedUrl !== team.logoUrl ? (
          <Image
            src={team.logoUrl}
            alt={`${team.name} logo`}
            fill
            sizes={`${imageSize}px`}
            className="object-contain p-1"
            onError={() => setFailedUrl(team.logoUrl)}
          />
        ) : (
          <span
            role="img"
            aria-label={`${team.name} logo unavailable`}
            className="grid size-full place-items-center text-xs font-bold text-muted-foreground"
          >
            {team.shortName.slice(0, 3)}
          </span>
        )}
      </span>
      {showName ? (
        <span className={cn("min-w-0", size === "lg" ? "text-lg" : "text-xs")}>
          <strong className="block break-words font-heading font-semibold leading-snug">
            {team.name}
          </strong>
          <span className="block text-[9px] font-semibold uppercase text-muted-foreground">
            {team.shortName}
          </span>
        </span>
      ) : null}
    </span>
  );
}
