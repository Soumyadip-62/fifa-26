"use client";

import Link from "next/link";
import { useState } from "react";
import { Star } from "lucide-react";
import { TeamMark } from "@/components/football/TeamMark";
import { usePreferences, toggleFavourite } from "@/lib/preferences";
import type { FootballTeam } from "@/types/football";
import { DashboardPanel } from "./DashboardPanel";

export function FavouriteTeams({ teams }: { teams: FootballTeam[] }) {
  const preferences = usePreferences();
  const [error, setError] = useState("");
  const saved = teams.filter((team) => preferences.teamIds.includes(team.id));
  const shown = saved.length
    ? saved.slice(0, 4)
    : teams
        .filter((team) => team.competitionIds.includes("premier-league"))
        .slice(0, 3);
  return (
    <DashboardPanel
      id="favourites-heading"
      title="Your favourites"
      icon={Star}
      href="/favourites"
      action="Manage"
      className="dashboard-favourites"
    >
      {!saved.length && (
        <p className="dashboard-panel-note">
          Your clubs. Your matchday. Follow a team to get started.
        </p>
      )}
      <div className="dashboard-favourite-list">
        {shown.map((team) => (
          <div key={team.id} className="dashboard-favourite-row">
            <Link href={`/teams/${team.id}`}>
              <TeamMark team={team} size="sm" showName={false} />
              <span title={team.name}>{team.shortName || team.name}</span>
            </Link>
            <button
              type="button"
              aria-label={`${preferences.teamIds.includes(team.id) ? "Unfollow" : "Follow"} ${team.name}`}
              aria-pressed={preferences.teamIds.includes(team.id)}
              onClick={() => {
                try {
                  toggleFavourite("teamIds", team.id);
                  setError("");
                } catch {
                  setError(
                    "Your favourite could not be saved. Please allow browser storage.",
                  );
                }
              }}
            >
              <Star
                aria-hidden="true"
                fill={
                  preferences.teamIds.includes(team.id)
                    ? "currentColor"
                    : "none"
                }
              />
            </button>
          </div>
        ))}
      </div>
      {!shown.length && (
        <p className="dashboard-panel-note">
          Teams are temporarily unavailable.
        </p>
      )}
      {error && (
        <p role="alert" className="dashboard-panel-note">
          {error}
        </p>
      )}
      <Link className="dashboard-favourites-footer" href="/favourites">
        {saved.length
          ? `${saved.length} ${saved.length === 1 ? "team" : "teams"} followed · See your football`
          : "Explore all teams & favourites"}
        <span aria-hidden="true">→</span>
      </Link>
    </DashboardPanel>
  );
}
