"use client";

import Image from "next/image";
import { useState } from "react";
import { FlagIcon } from "@/components/common/FlagIcon";
import { cn } from "@/lib/utils/cn";
import type { MatchTeam } from "@/types/match";

export type TeamLogoImageProps = {
  team: MatchTeam;
  className?: string;
  size?: number;
};

export function TeamLogoImage({ team, className, size = 120 }: TeamLogoImageProps) {
  const [hasLogoError, setHasLogoError] = useState(false);
  const country = team.country ?? team.name;

  if (!team.logoUrl || hasLogoError) {
    return (
      <span
        className={cn("flex shrink-0 items-center justify-center rounded-full bg-white/90 p-3 shadow-sm", className)}
        style={{ height: size, width: size }}
      >
        <FlagIcon country={country} className="h-12 w-16" />
      </span>
    );
  }

  return (
    <Image
      src={team.logoUrl}
      alt={team.name}
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      onError={() => setHasLogoError(true)}
    />
  );
}
