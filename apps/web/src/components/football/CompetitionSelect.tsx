"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Competition } from "@/types/football";
export function CompetitionSelect({
  competitions,
  selected,
}: {
  competitions: Competition[];
  selected: string;
}) {
  const router = useRouter(),
    path = usePathname(),
    params = useSearchParams();
  return (
    <label className="inline-flex items-center gap-2 text-xs font-bold">
      Competition
      <select
        aria-label="Profile competition"
        value={selected}
        onChange={(e) => {
          const q = new URLSearchParams(params);
          q.set("competition", e.target.value);
          q.delete("season");
          router.push(`${path}?${q}`);
        }}
        className="rounded-lg border bg-card p-2 text-black dark:bg-card dark:text-white"
      >
        {competitions.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
