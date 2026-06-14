"use client";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export type FlagIconProps = {
  country?: string | null;
  className?: string;
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

const overrides: Record<string, string> = {
  // Germany
  germany: "de",
  westgermany: "de",
  eastgermany: "de",
  
  // Curaçao
  curacao: "cw",
  
  // Bosnia & Herzegovina
  bosnia: "ba",
  bosniaherzegovina: "ba",
  bosniaandherzegovina: "ba",

  // Qatar
  qatar: "qa",
  
  // UK Countries
  england: "gb-eng",
  scotland: "gb-sct",
  wales: "gb-wls",
  northernireland: "gb-nir",

  // USA
  usa: "us",
  unitedstates: "us",
  unitedstatesofamerica: "us",

  // Czech Republic
  czechrepublic: "cz",
  czechia: "cz",
  czechoslovakia: "cz",

  // Turkey
  turkey: "tr",
  turkiye: "tr",

  // Ivory Coast
  ivorycoast: "ci",
  cotedivoire: "ci",

  // Congo
  drcongo: "cd",
  congodr: "cd",
  democraticthecongo: "cd",
  congo: "cg",
  zaire: "cd",

  // Korea
  southkorea: "kr",
  korearepublic: "kr",

  // Iran
  iriran: "ir",

  // Other historical / name variants
  ussr: "ru",
  sovietunion: "ru",
  yugoslavia: "rs",
  dutcheastindies: "id",
  trinidadandtobago: "tt",
  serbiaandmontenegro: "rs",
  caboverde: "cv"
};

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

  if (overrides[normalizedCountry]) {
    return overrides[normalizedCountry];
  }

  for (let first = 65; first <= 90; first += 1) {
    for (let second = 65; second <= 90; second += 1) {
      const code = `${String.fromCharCode(first)}${String.fromCharCode(second)}`;
      try {
        const regionName = regionNames.of(code);
        if (regionName && normalize(regionName) === normalizedCountry) {
          return code.toLowerCase();
        }
      } catch (e) {
        // Ignore invalid codes
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
