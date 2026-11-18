import { FavouriteButton } from "@/components/football/PreferenceControls";
import Link from "next/link";
import { Footprints, Ruler, Shirt, UserRound } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { PlayerAvatar } from "@/components/common/PlayerAvatar";
import { PlatformMatchCard } from "@/components/football/PlatformMatchCard";
import { TeamMark } from "@/components/football/TeamMark";
import { getPlatformPlayer } from "@/lib/api/football";
import { FixtureErrors } from "@/components/football/FixtureErrors";

export async function PlayerProfilePage({ playerId }: { playerId: string }) {
  const data = await getPlatformPlayer(playerId);
  if (!data)
    return (
      <div className="page-shell">
        <EmptyState
          title="Player not found"
          description="This player is not available in the imported directory."
        />
      </div>
    );
  const { player, team, matches } = data;
  const resolved = matches;
  const stats = Object.entries(player.stats).filter(
    ([, value]) => value != null,
  );
  return (
    <div className="page-shell">
      <FixtureErrors errors={data.fixtureErrors} />
      <header className="profile-header player-profile-header">
        <div>
          <PlayerAvatar
            name={player.name}
            imageUrl={player.imageUrl}
            className="profile-player-avatar"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase text-primary">
            {player.position}
          </p>
          <h1 className="font-heading text-3xl font-black">{player.name}</h1>
          <FavouriteButton kind="playerIds" id={player.id} />
          <Link href={`/teams/${team.id}`} className="mt-2 inline-flex">
            <TeamMark team={team} size="sm" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:ml-auto">
          <span className="text-xs">
            <UserRound className="mb-1 size-4 text-primary" />
            <b className="block text-[9px] uppercase text-muted-foreground">
              Nationality
            </b>
            {player.nationality || "—"}
          </span>
          <span className="text-xs">
            <Shirt className="mb-1 size-4 text-primary" />
            <b className="block text-[9px] uppercase text-muted-foreground">
              Number
            </b>
            {player.shirtNumber ?? "—"}
          </span>
          <span className="text-xs">
            <Ruler className="mb-1 size-4 text-primary" />
            <b className="block text-[9px] uppercase text-muted-foreground">
              Height
            </b>
            {player.height || "—"}
          </span>
          <span className="text-xs">
            <Footprints className="mb-1 size-4 text-primary" />
            <b className="block text-[9px] uppercase text-muted-foreground">
              Foot
            </b>
            {player.preferredFoot ?? "—"}
          </span>
        </div>
      </header>
      {player.biography ? (
        <p className="text-sm leading-7 text-muted-foreground">
          {player.biography}
        </p>
      ) : null}
      <section>
        <h2 className="mb-4 font-heading text-lg font-black">
          Season statistics
        </h2>
        <p className="mb-3 text-xs text-muted-foreground">
          {player.statisticsScope
            ? `${player.statisticsScope.competitionId.replaceAll("-", " ")} · ${player.statisticsScope.season}`
            : "Only published statistics for the selected competition and season are shown."}
        </p>
        {stats.length ? (
          <div className="profile-stats">
            {stats.map(([label, value]) => (
              <div key={label} className="profile-stat-card">
                <span className="block text-[9px] font-bold uppercase text-muted-foreground">
                  {label.replace(/([A-Z])/g, " $1")}
                </span>
                <strong
                  title={value == null ? "Statistic unavailable" : undefined}
                >
                  {value ?? "—"}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No published statistics"
            description="Season statistics aren't available for this player. Available figures will appear here."
          />
        )}
      </section>
      <section>
        <h2 className="mb-4 font-heading text-lg font-black">Fixtures</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {resolved.map((item) => (
            <PlatformMatchCard key={item.match.id} item={item} compact />
          ))}
        </div>
      </section>
    </div>
  );
}
