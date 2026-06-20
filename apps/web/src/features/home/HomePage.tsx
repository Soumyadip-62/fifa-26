"use client";

import Link from "next/link";
import Image from "next/image";
import { images } from "@/assets";
import { SectionHeader } from "@/components/common/SectionHeader";
import { MotionReveal } from "@/components/common/MotionReveal";
import { StatCard } from "@/components/common/StatCard";
import { FeaturedMatchesSlider } from "@/components/matches/FeaturedMatchesSlider";
import { NewsCard } from "@/components/news/NewsCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { getMatches } from "@/lib/api/matches";
import { getNewsArticles } from "@/lib/api/news";
import { getTeams } from "@/lib/api/teams";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicIsland } from "@/components/layout/DynamicIsland";

// Lazy load below-the-fold sections
const BroadcastHub = dynamic(
  () => import("./BroadcastHub").then((mod) => mod.BroadcastHub),
  {
    loading: () => <Skeleton className="my-8 h-96 rounded-xl" />,
  },
);

const PlatformSections = dynamic(
  () => import("./PlatformSections").then((mod) => mod.PlatformSections),
  {
    loading: () => (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    ),
  },
);

export function HomePage() {
  const { data: matches = [], isPending: isMatchesPending } = useQuery({
    queryKey: ["matches"],
    queryFn: getMatches,
  });

  const { data: teams = [], isPending: isTeamsPending } = useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
  });

  const { data: articles = [], isPending: isArticlesPending } = useQuery({
    queryKey: ["articles"],
    queryFn: getNewsArticles,
  });

  const isMainDataPending =
    isMatchesPending || isTeamsPending || isArticlesPending;

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:gap-10 lg:px-8 lg:py-10">
      <DynamicIsland inlineMobile />
      <MotionReveal>
        <section className="relative flex min-h-[360px] items-center justify-start overflow-hidden rounded-[32px] bg-black p-6 text-left text-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/10 sm:min-h-[400px] sm:p-8 lg:p-12">
          <Image
            src={images.banners.worldCup2026}
            alt="FIFA 26 tournament banner"
            fill
            priority
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="object-cover object-center brightness-90 saturate-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
          <div className="relative grid max-w-2xl justify-items-start gap-4">
            <p className="rounded-full border border-white/10 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-md">
              Tournament Dashboard
            </p>
            <h1 className="font-heading text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              FIFA 2026
            </h1>
            <p className="max-w-xl text-xs leading-relaxed text-zinc-300 sm:text-sm">
              Explore real-time match fixtures, detailed team profiles, latest
              news updates, official broadcast hubs, and historical tournament
              archives on a production-ready dashboard.
            </p>
            <div className="flex flex-wrap justify-start gap-3 mt-2">
              <Link className={cn(buttonVariants(), "rounded-full bg-primary hover:bg-primary/95 text-white dark:text-zinc-950 font-bold px-6 py-3 sm:py-5 text-xs tracking-wide shadow-md hover:shadow-lg transition-all max-h-[32px] sm:max-h-[40px]")} href="/matches">
                View Matches
              </Link>
              <Link
                className={cn(buttonVariants({
                  variant: "outline",
                }), "rounded-full border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 px-6 py-3 sm:py-5 text-xs tracking-wide transition-all max-h-[32px] sm:max-h-[40px]")}
                href="/points-table"
              >
                View Points Table
              </Link>
            </div>
          </div>
        </section>
      </MotionReveal>


      <section>
        {isMatchesPending ? (
          <div className="grid gap-6">
            <Skeleton className="h-10 w-48" />
            <div className="flex gap-4 overflow-hidden">
              <Skeleton className="h-[400px] w-[300px] shrink-0 rounded-xl" />
              <Skeleton className="h-[400px] w-[300px] shrink-0 rounded-xl" />
              <Skeleton className="h-[400px] w-[300px] shrink-0 rounded-xl" />
            </div>
          </div>
        ) : (
          <FeaturedMatchesSlider matches={matches} />
        )}
      </section>

      <section className="grid gap-5">
        <SectionHeader eyebrow="Latest news" title="Tournament updates" />
        <div className="grid gap-5 md:grid-cols-2">
          {isArticlesPending ? (
            <>
              <Skeleton className="h-[200px] rounded-xl" />
              <Skeleton className="h-[200px] rounded-xl" />
            </>
          ) : (
            articles.slice(0, 2).map((article, index) => (
              <MotionReveal
                delay={Math.min(index * 0.05, 0.12)}
                key={article.id}
              >
                <NewsCard article={article} />
              </MotionReveal>
            ))
          )}
        </div>
      </section>

      <BroadcastHub />

      <section className="grid gap-5 sm:grid-cols-3">
        {isMainDataPending ? (
          <>
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </>
        ) : (
          <>
            <StatCard
              label="Tracked teams"
              value={teams.length}
              helper="Mock API data"
            />
            <StatCard
              label="Fixtures"
              value={matches.length}
              helper="Scheduled and live"
            />
            <StatCard
              label="Articles"
              value={articles.length}
              helper="News ready"
            />
          </>
        )}
      </section>

      <PlatformSections />
    </div>
  );
}
