"use client";

import Image from "next/image";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";

export type PlayerAvatarProps = {
  name: string;
  imageUrl?: string;
  className?: string;
};

export function PlayerAvatar({
  name = "Unknown player",
  imageUrl,
  className,
}: PlayerAvatarProps) {
  const [failed, setFailed] = useState<string | null>(null);
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";
  const usableImage =
    imageUrl && !imageUrl.endsWith("/player.svg") && failed !== imageUrl;
  return (
    <Avatar className={cn("h-12 w-12 border border-border", className)}>
      {usableImage ? (
        <Image
          src={imageUrl}
          alt={`${name} headshot`}
          fill
          sizes="74px"
          className="object-cover"
          onError={() => setFailed(imageUrl)}
        />
      ) : (
        <AvatarFallback aria-label={`${name}, photo unavailable`}>
          {initials}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
