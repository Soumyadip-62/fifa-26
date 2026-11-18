import { footballRequest } from "@/lib/api/football";
export async function TopScorers({ competition }: { competition: string }) {
  try {
    const data = await footballRequest<{
      players: Array<{
        id: string;
        player: { name: string };
        team: { name: string };
        goals: number;
      }>;
    }>(`/competitions/${competition}/scorers`);
    return (
      <div>
        <p className="p-3 text-xs text-muted-foreground">
          Premier League · latest available season
        </p>
        {data.players.slice(0, 5).map((p, i) => (
          <div key={p.id} className="flex items-center justify-between p-3">
            <span className="text-sm">
              {i + 1}. {p.player.name}
              <small className="block text-muted-foreground">
                {p.team.name}
              </small>
            </span>
            <strong>{p.goals}</strong>
          </div>
        ))}
        {!data.players.length ? (
          <p className="p-3 text-sm text-muted-foreground">
            Scorer data is unavailable.
          </p>
        ) : null}
      </div>
    );
  } catch {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        Scorer data is temporarily unavailable.
      </p>
    );
  }
}
