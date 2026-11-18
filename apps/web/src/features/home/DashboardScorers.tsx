import Link from "next/link";
import { Footprints } from "lucide-react";
import { footballRequest } from "@/lib/api/football";
import type { FootballPlayer } from "@/types/football";
import { DashboardPanel } from "./DashboardPanel";
import { PlayerAvatar } from "@/components/common/PlayerAvatar";

type Scorer = {
  id: string;
  player: { name: string };
  team: { name: string };
  goals: number | null;
};

export async function DashboardScorers({
  players,
}: {
  players: FootballPlayer[];
}) {
  let scorers: Scorer[] | null = null;
  try {
    scorers = (
      await footballRequest<{ players: Scorer[] }>(
        "/competitions/premier-league/scorers",
      )
    ).players;
  } catch {
    /* Keep the rest of the dashboard available. */
  }
  return (
    <DashboardPanel
      id="scorers-heading"
      title="Top scorers"
      icon={Footprints}
      href="/statistics"
      className="dashboard-scorers"
    >
      <p className="dashboard-scorer-scope">
        <span className="scope-dot" />
        Premier League<span>GOALS</span>
      </p>
      {scorers?.length ? (
        <ol className="dashboard-scorer-list">
          {scorers.slice(0, 5).map((scorer, index) => (
            <li key={scorer.id}>
              <Link href={`/players/${scorer.id}`}>
                <span className="dashboard-rank">{index + 1}</span>
                <PlayerAvatar
                  name={scorer.player.name}
                  className="dashboard-player-avatar"
                  imageUrl={
                    players.find((player) => player.id === scorer.id)?.imageUrl
                  }
                />
                <span className="dashboard-player-name">
                  <strong>{scorer.player.name}</strong>
                  <small>{scorer.team.name}</small>
                </span>
                <strong className="dashboard-goals">
                  {scorer.goals ?? "–"}
                </strong>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="dashboard-panel-note">
          {scorers
            ? "Scorer rankings aren't available for this season yet."
            : "Scorer rankings are temporarily unavailable. Please check back shortly."}
        </p>
      )}
      <Link className="dashboard-favourites-footer" href="/statistics">
        Explore player statistics<span aria-hidden="true">→</span>
      </Link>
    </DashboardPanel>
  );
}
