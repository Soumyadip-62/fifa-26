"use client";
import Link from "next/link";
import { EmptyState } from "@/components/common/EmptyState";
import { MotionReveal } from "@/components/common/MotionReveal";
import { PlayerAvatar } from "@/components/common/PlayerAvatar";
import PlayerDetailsDrawer from "@/components/common/PlayerDetailsDrawer";
import { ReadMoreText } from "@/components/common/ReadMoreText";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatCard } from "@/components/common/StatCard";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getTeamById, getTeamPlayersById } from "@/lib/api/teams";
import { getNewsArticlesByKeywords } from "@/lib/api/news";
import { NewsCard } from "@/components/news/NewsCard";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Player } from "@/types/team";
import Image from "next/image";
import { images } from "@/assets";
import { Sparkles, Newspaper } from "lucide-react";

export type TeamDetailsPageProps = {
  teamId: string;
  group?: string;
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

function getPlayerDetails(player: Player) {
  return [
    ["Nationality", player.strNationality],
    ["Club", player.strTeam],
    ["National team", player.strTeam2],
    ["Born", player.dateBorn],
    ["Birthplace", player.strBirthLocation],
    ["Height", player.strHeight],
    ["Weight", player.strWeight],
    ["Side", player.strSide],
  ]
    .map(([label, value]) => ({ label, value: getTextValue(value) }))
    .filter((item) => item.value);
}

export function TeamDetailsPage({ teamId, group }: TeamDetailsPageProps) {
  const {
    data: team,
    error: teamError,
    isSuccess: isTeamSuccess,
  } = useSuspenseQuery({
    queryKey: ["teams", teamId],
    queryFn: () => getTeamById(teamId),
  });

  const {
    data: teamPlayers,
    error: playersError,
    isSuccess: isPlayersSuccess,
  } = useSuspenseQuery({
    queryKey: ["players", teamId],
    queryFn: () => getTeamPlayersById(teamId),
  });

  const {
    data: teamNews,
    error: newsError,
  } = useSuspenseQuery({
    queryKey: ["teamNews", teamId],
    queryFn: async () => {
      const teamData = await getTeamById(teamId);
      if (teamData?.name) {
        return getNewsArticlesByKeywords(teamData.name);
      }
      return [];
    },
  });

  // Extract Fan Art pictures from team details response
  const fanArts = team
    ? ([
        team.strFanart1,
        team.strFanart2,
        team.strFanart3,
        team.strFanart4,
      ].filter(Boolean) as string[])
    : [];

  const bannerUrl = team?.strBanner || images.banners.sfStadium;

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      {isTeamSuccess && isPlayersSuccess && team ? (
        <>
          {/* PREMIUM BANNER HEADER */}
          <MotionReveal>
            <section className="relative overflow-hidden rounded-[28px] bg-zinc-950 text-white shadow-md border border-black/5 dark:border-white/5">
              <div className="relative h-44 w-full bg-zinc-900 sm:h-56">
                <Image
                  src={bannerUrl}
                  alt={`${team.name} Banner`}
                  fill
                  priority
                  className="object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-transparent" />
              </div>

              {/* Overlapping details bar */}
              <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between -mt-12 sm:-mt-16">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    {/* Big Team Logo */}
                    <div className="relative h-24 w-24 flex-shrink-0 rounded-2xl border-4 border-zinc-950 bg-white p-3 shadow-md dark:bg-zinc-900 sm:h-28 sm:w-28 flex items-center justify-center overflow-hidden">
                      {team.logoUrl ? (
                        <Image
                          src={team.logoUrl}
                          alt={`${team.name} Logo`}
                          width={80}
                          height={80}
                          className="object-contain"
                        />
                      ) : (
                        <span className="text-lg font-bold text-zinc-400">
                          {team.shortCode || "TBD"}
                        </span>
                      )}
                    </div>

                    <div className="grid gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="font-heading text-xl font-black tracking-tight text-white sm:text-2xl">
                          {team.name}
                        </h1>
                        {team.flagUrl && (
                          <div className="relative h-4 w-6 overflow-hidden rounded border border-white/10 shadow-sm">
                            <Image
                              src={team.flagUrl}
                              alt={team.country}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400">
                        FIFA Code:{" "}
                        <span className="font-bold text-white">
                          {team.fifa_code || team.shortCode || "TBD"}
                        </span>{" "}
                        · {team.continent}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 md:mb-1">
                    {group ? (
                      <Badge className="px-3 py-0.5 font-bold text-[10px] rounded-full bg-primary text-zinc-950 border-0">
                        {group}
                      </Badge>
                    ) : null}
                    {team.coach ? (
                      <Badge
                        variant="outline"
                        className="border-white/20 text-white bg-zinc-900/60 backdrop-blur-sm px-3 py-0.5 rounded-full text-[10px] font-semibold"
                      >
                        Coach: {team.coach}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          </MotionReveal>

          {/* STATS SECTION */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Ranking" value={team.fifaRanking ?? "TBD"} />
            <StatCard label="Played" value={team.stats?.played ?? 0} />
            <StatCard label="Wins" value={team.stats?.won ?? 0} />
            <StatCard label="Goals for" value={team.stats?.goalsFor ?? 0} />
          </section>

          {/* TEAM PROFILE */}
          <section className="grid gap-6">
            <Card className="overflow-hidden border border-black/5 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md rounded-[28px] shadow-sm">
              <CardContent className="grid gap-4 p-5 sm:p-6">
                <SectionHeader eyebrow="Profile" title="Team details" />
                {team.strDescriptionEN ? (
                  <ReadMoreText
                    className="max-w-4xl text-xs leading-relaxed text-zinc-650 dark:text-zinc-300"
                    maxLength={420}
                    text={team.strDescriptionEN}
                  />
                ) : null}
                <dl className="grid gap-3 text-xs border-t border-black/5 dark:border-white/5 pt-4">
                  <div className="flex justify-between gap-4">
                    <dt className="text-zinc-500 dark:text-zinc-400 font-semibold">
                      Country
                    </dt>
                    <dd className="font-bold text-zinc-950 dark:text-zinc-50">
                      {team.country}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-zinc-500 dark:text-zinc-400 font-semibold">
                      Group
                    </dt>
                    <dd className="font-bold text-zinc-950 dark:text-zinc-50">
                      {group ?? "TBD"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* FAN ART & TEAM CULTURE SECTION */}
            <Card className="overflow-hidden border border-black/5 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md rounded-[28px] shadow-sm">
              <CardContent className="grid gap-4 p-5 sm:p-6">
                <SectionHeader
                  eyebrow="Culture"
                  title="Fan Art & Media"
                  description="Explore community fan art and high-definition photographs showcasing the team's national football identity."
                />
                {fanArts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {fanArts.map((artUrl, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-video overflow-hidden rounded-2xl border border-black/5 bg-zinc-100 dark:border-white/5 dark:bg-zinc-900 shadow-sm"
                      >
                        <Image
                          src={artUrl}
                          alt={`${team.name} Fan Art ${idx + 1}`}
                          fill
                          sizes="(min-width: 1024px) 240px, 50vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                          <span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md inline-flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> Fan Art
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-white/10 p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/10">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                      No official fan art media is registered in the database for this team yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TEAM NEWS SECTION */}
            <Card className="overflow-hidden border border-black/5 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md rounded-[28px] shadow-sm">
              <CardContent className="grid gap-4 p-5 sm:p-6">
                <SectionHeader
                  eyebrow="Coverage"
                  title="Latest Team News"
                  description={`Stay updated with the latest news articles and media coverage reporting on ${team.name}.`}
                />
                {teamNews && teamNews.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {teamNews.slice(0, 3).map((article) => (
                      <NewsCard key={article.id} article={article} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-white/10 p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/10 flex flex-col items-center justify-center gap-2">
                    <Newspaper className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                    <p className="text-xs text-zinc-550 dark:text-zinc-450 font-semibold">
                      No recent news articles found for this team.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* PLAYERS SECTION */}
            <Card className="overflow-hidden border border-black/5 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md rounded-[28px] shadow-sm">
              <CardContent className="grid gap-4 p-5 sm:p-6">
                <SectionHeader
                  eyebrow="Squad"
                  title="Player preview"
                  description="Player cards are ready for future squad data."
                />
                {teamPlayers?.length ? (
                  <div className="grid gap-3">
                    {teamPlayers.map((player, index) => (
                      <MotionReveal
                        delay={Math.min(index * 0.025, 0.16)}
                        key={player.id}
                      >
                        <PlayerDetailsDrawer player={player}>
                          <div
                            className="grid w-full cursor-pointer gap-4 rounded-2xl border border-black/5 bg-zinc-100/40 p-4 text-left transition-colors hover:bg-zinc-200/50 dark:border-white/5 dark:bg-zinc-800/10 dark:hover:bg-zinc-800/20 sm:grid-cols-[auto_1fr]"
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
                            <div className="grid min-w-0 gap-3">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate font-bold text-zinc-900 dark:text-white text-sm">
                                    {player.name}
                                  </p>
                                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                                    {player.position}
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {player.shirtNumber ? (
                                    <Badge className="rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-850 dark:text-zinc-300 border-0 font-bold text-[9px]">
                                      No. {player.shirtNumber}
                                    </Badge>
                                  ) : null}
                                  {getTextValue(player.strStatus) ? (
                                    <Badge className="rounded-full bg-primary/10 text-primary border-0 font-bold text-[9px] uppercase tracking-wider">
                                      {getTextValue(player.strStatus)}
                                    </Badge>
                                  ) : null}
                                </div>
                              </div>
                              <dl className="grid gap-2 text-[10px] sm:grid-cols-2 lg:grid-cols-4">
                                {getPlayerDetails(player).map((detail) => (
                                  <div key={detail.label} className="min-w-0">
                                    <dt className="font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                      {detail.label}
                                    </dt>
                                    <dd className="truncate text-zinc-800 dark:text-zinc-200 font-semibold mt-0.5">
                                      {detail.value}
                                    </dd>
                                  </div>
                                ))}
                              </dl>
                            </div>
                          </div>
                        </PlayerDetailsDrawer>
                      </MotionReveal>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed text-zinc-550 dark:text-zinc-450 font-semibold">
                    No players added for this team.
                  </p>
                )}
              </CardContent>
            </Card>
          </section>
        </>
      ) : teamError && playersError ? (
        <EmptyTeamState />
      ) : null}
    </div>
  );
}

const EmptyTeamState = () => {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <EmptyState
        title="Team not found"
        description="The requested team is not available in the mock data."
      />
      <Link className={buttonVariants({ variant: "outline" })} href="/teams">
        Back to teams
      </Link>
    </div>
  );
};
