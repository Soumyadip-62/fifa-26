import { PlayerAvatar } from "@/components/common/PlayerAvatar";
import PlayerDetailsDrawer from "@/components/common/PlayerDetailsDrawer";
import { MotionReveal } from "@/components/common/MotionReveal";
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
    <Card className="h-full rounded-lg border border-border bg-card dark:bg-card backdrop-blur-md shadow-none dark:border-border">
      <CardContent className="grid gap-5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <TeamLogoImage team={team} size={44} />
            <div className="min-w-0">
              <h2 className="font-heading truncate text-lg font-black text-foreground dark:text-white">
                {team.name}
              </h2>
            </div>
          </div>
          {team.shortCode ? (
            <Badge
              variant="secondary"
              className="rounded-full bg-secondary text-muted-foreground dark:bg-secondary dark:text-secondary-foreground font-bold border-0 px-2.5 py-0.5 shadow-none"
            >
              {team.shortCode}
            </Badge>
          ) : null}
        </div>
        <Separator className="bg-black/5 dark:bg-white/5" />
        {isPending ? (
          <p className="text-xs leading-relaxed text-muted-foreground dark:text-muted-foreground">
            Loading players...
          </p>
        ) : error ? (
          <p className="text-xs leading-relaxed text-red-650 dark:text-red-400 font-bold">
            Failed to load players.
          </p>
        ) : players?.length ? (
          <div className="grid gap-4">
            {players.map((player, index) => (
              <MotionReveal
                delay={Math.min(index * 0.025, 0.16)}
                key={player.id}
              >
                <PlayerDetailsDrawer player={player}>
                  <div
                    className="grid w-full cursor-pointer grid-cols-[auto_1fr] gap-3 rounded-lg border border-border bg-secondary p-4 text-left transition-all hover:bg-secondary dark:border-border dark:bg-black dark:hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
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
                          <p className="truncate text-sm font-black text-foreground dark:text-white">
                            {player.name}
                          </p>
                          <p className="text-xs text-muted-foreground dark:text-muted-foreground font-semibold mt-0.5">
                            {player.position}
                          </p>
                        </div>
                        {player.shirtNumber ? (
                          <Badge
                            variant="outline"
                            className="rounded-full border-border dark:border-border bg-zinc-150/50 dark:bg-zinc-850/60 font-bold px-2 py-0.5 text-[10px] text-zinc-650 dark:text-muted-foreground dark:border-green-700"
                          >
                            No. {player.shirtNumber}
                          </Badge>
                        ) : null}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground dark:text-muted-foreground">
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
              </MotionReveal>
            ))}
          </div>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground dark:text-muted-foreground">
            No players found for this team.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
