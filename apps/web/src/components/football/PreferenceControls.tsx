"use client";
import Link from "next/link";
import { Heart, Bell } from "lucide-react";
import {
  toggleFavourite,
  toggleReminder,
  usePreferences,
} from "@/lib/preferences";
import type { FootballTeam } from "@/types/football";
import { TeamMark } from "./TeamMark";
export function FavouriteButton({
  kind,
  id,
}: {
  kind: "teamIds" | "playerIds" | "competitionIds" | "matchIds";
  id: string;
}) {
  const p = usePreferences(),
    selected = p[kind].includes(id);
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={selected ? "Remove favourite" : "Save favourite"}
      onClick={() => toggleFavourite(kind, id)}
      className={`relative z-20 rounded-full bg-card p-2 ${selected ? "text-primary" : "text-muted-foreground"}`}
    >
      <Heart className={`size-4 ${selected ? "fill-current" : ""}`} />
    </button>
  );
}
export function ReminderButton({ id }: { id: string }) {
  const p = usePreferences(),
    set = Boolean(p.reminders[id]?.length);
  return (
    <div className="grid justify-items-center gap-2">
      <button
        type="button"
        aria-pressed={set}
        onClick={() => toggleReminder(id)}
        className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-xs font-bold text-black"
      >
        <Bell className="size-4" />
        {set ? "30-minute reminder saved" : "Remind me"}
      </button>
      {set && !p.notifications.enabled ? (
        <Link className="text-xs underline" href="/settings/notifications">
          Enable browser notifications to receive this reminder
        </Link>
      ) : null}
    </div>
  );
}
export function HomeFavourites({ teams }: { teams: FootballTeam[] }) {
  const p = usePreferences(),
    saved = teams.filter((t) => p.teamIds.includes(t.id));
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {saved.map((team) => (
        <Link
          href={`/teams/${team.id}`}
          key={team.id}
          className="rounded-lg border border-border bg-card p-5 dark:bg-card"
        >
          <TeamMark team={team} />
        </Link>
      ))}
      {!saved.length ? (
        <Link href="/favourites" className="text-sm text-muted-foreground">
          Choose your favourite teams.
        </Link>
      ) : null}
    </div>
  );
}
