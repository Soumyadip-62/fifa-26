import { cn } from "@/lib/utils/cn";

export type FlagIconProps = {
  country: string;
  className?: string;
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}

function getCountryCode(country: string) {
  const normalizedCountry = normalize(country);

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
    <img
      src={`https://flagcdn.com/w40/${flagCode}.png`}
      alt={`${country} flag`}
      className={cn(
        "h-5 w-5 rounded-2xl object-cover ring-1 ring-black/10 dark:ring-white/15",
        className,
      )}
      loading="lazy"
    />
  );
}
