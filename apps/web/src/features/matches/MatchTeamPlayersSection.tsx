import { PlayerAvatar } from "@/components/common/PlayerAvatar";
import PlayerDetailsDrawer from "@/components/common/PlayerDetailsDrawer";
import { TeamLogoImage } from "@/components/matches/TeamLogoImage";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { MatchTeam } from "@/types/match";
import type { Player } from "@/types/team";

export type MatchTeamPlayersSectionProps = {
  error?: Error | null;
  isPending: boolean;
  players?: Player[] | null;
  side: "home" | "away";
  team: MatchTeam;
};

function getTextValue(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed || undefined;
}

function getPlayerImageUrl(player: Player) {
  return (
    getTextValue(player.strCutout) ??
    getTextValue(player.strThumb) ??
    getTextValue(player.strRender)
  );
}

export function MatchTeamPlayersSection({
  error,
  isPending,
  players,
  team,
}: MatchTeamPlayersSectionProps) {
  return (
    <Card className="h-full ">
      <CardContent className="grid gap-4 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <TeamLogoImage team={team} size={44} />
            <div className="min-w-0">
              {/* <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {side === "home" ? "Home team" : "Away team"}
              </p> */}
              <h2 className="truncate text-lg font-black text-neutral-950 dark:text-neutral-50">
                {team.name}
              </h2>
            </div>
          </div>
          {team.shortCode ? (
            <Badge variant="secondary">{team.shortCode}</Badge>
          ) : null}
        </div>
        <Separator />
        {isPending ? (
          <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
            Loading players...
          </p>
        ) : error ? (
          <p className="text-sm leading-6 text-red-600 dark:text-red-400">
            Failed to load players.
          </p>
        ) : players?.length ? (
          <div className="grid gap-3">
            {players.map((player) => (
              <PlayerDetailsDrawer key={player.id} player={player}>
                <div
                  className="grid w-full cursor-pointer grid-cols-[auto_1fr] gap-3 rounded-lg border border-neutral-200/80 bg-neutral-50 p-3 text-left transition-colors hover:bg-emerald-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.currentTarget.click();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <PlayerAvatar
                    name={player.name}
                    imageUrl={getPlayerImageUrl(player)}
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-neutral-950 dark:text-neutral-50">
                          {player.name}
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {player.position}
                        </p>
                      </div>
                      {player.shirtNumber ? (
                        <Badge variant="outline">No. {player.shirtNumber}</Badge>
                      ) : null}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      {getTextValue(player.strNationality) ? (
                        <span>{getTextValue(player.strNationality)}</span>
                      ) : null}
                      {getTextValue(player.strSide) ? (
                        <span>{getTextValue(player.strSide)}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </PlayerDetailsDrawer>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
            No players found for this team.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
