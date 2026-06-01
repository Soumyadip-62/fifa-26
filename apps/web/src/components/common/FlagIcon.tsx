"use client";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export type FlagIconProps = {
  country?: string | null;
  className?: string;
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function normalize(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.toLowerCase().replace(/[^a-z]/g, "");
}

function getCountryCode(country: string | null | undefined) {
  const normalizedCountry = normalize(country);

  if (!normalizedCountry) {
    return null;
  }

  for (let first = 65; first <= 90; first += 1) {
    for (let second = 65; second <= 90; second += 1) {
      const code = `${String.fromCharCode(first)}${String.fromCharCode(second)}`;
      const regionName = regionNames.of(code);

      if (regionName && normalize(regionName) === normalizedCountry) {
        return code.toLowerCase();
      }
    }
  }

  return null;
}

export function FlagIcon({ country, className }: FlagIconProps) {
  const flagCode = getCountryCode(country);

  if (!flagCode) {
    return null;
  }

  return (
    <Image
      src={`https://flagcdn.com/w40/${flagCode}.png`}
      alt={`${country ?? "Country"} flag`}
      width={28}
      height={20}
      className={cn(
        "h-5 w-7 rounded-sm object-cover ring-1 ring-black/10 dark:ring-white/15",
        className,
      )}
    />
  );
}
