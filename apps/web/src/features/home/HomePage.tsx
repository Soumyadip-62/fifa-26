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
import { getMatches } from "@/lib/api/matches";
import { getNewsArticles } from "@/lib/api/news";
import { getTeams } from "@/lib/api/teams";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-8 sm:px-6 sm:py-10 lg:gap-12 lg:px-8 lg:py-12">
      <MotionReveal>
        <section className="relative flex min-h-[380px] items-center justify-start overflow-hidden rounded-lg bg-neutral-950 p-5 text-left text-white shadow-[0_24px_70px_rgba(4,22,13,0.28)] ring-1 ring-white/10 sm:min-h-[430px] sm:p-8 lg:p-10">
          <Image
            src={images.banners.worldCup2026}
            alt="FIFA 26 tournament banner"
            fill
            priority
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="object-cover object-center "
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-emerald-950/50 to-neutral-950/35" />
          <div className="relative grid max-w-2xl justify-items-start gap-5">
            <p className="rounded-md border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-100 backdrop-blur">
              Tournament dashboard
            </p>
            <h1 className="font-heading text-3xl font-black tracking-normal sm:text-5xl lg:text-6xl">
              FIFA 2026
            </h1>
            <p className="max-w-xl text-sm leading-7 text-emerald-50 sm:text-base">
              Explore real-time match fixtures, detailed team profiles, latest
              news updates, official broadcast hubs, and historical tournament
              archives on a production-ready dashboard.
            </p>
            <div className="flex flex-wrap justify-start gap-3">
              <Link className={buttonVariants()} href="/matches">
                View matches
              </Link>
              <Link
                className={buttonVariants({
                  variant: "outline",
                  className:
                    "border-white/40 bg-white/10 text-white hover:bg-white/20 dark:text-white",
                })}
                href="/points-table"
              >
                View points table
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
