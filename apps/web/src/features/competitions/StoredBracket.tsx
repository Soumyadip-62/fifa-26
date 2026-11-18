import { Bracket } from "@/components/football/Bracket";
import { footballRequest } from "@/lib/api/football";
import type { BracketRound, FootballTeam } from "@/types/football";
export async function StoredBracket({
  competitionId,
  season,
}: {
  competitionId: string;
  season?: string;
}) {
  try {
    const d = await footballRequest<{
      rounds: BracketRound[];
      teams: FootballTeam[];
    }>(
      `/competitions/${competitionId}/bracket${season ? `?season=${season}` : ""}`,
    );
    return (
      <section className="grid gap-6">
        <h2 className="font-heading text-xl font-black">Knockout bracket</h2>
        {d.rounds.length ? (
          <Bracket rounds={d.rounds} teams={d.teams} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Knockout fixtures have not been published. Undrawn ties remain
            unconfirmed.
          </p>
        )}
      </section>
    );
  } catch {
    return <p role="status">Knockout data is unavailable.</p>;
  }
}
