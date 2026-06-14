import Link from "next/link";
import Image from "next/image";
import { images } from "@/assets";
import { SectionHeader } from "@/components/common/SectionHeader";
import { MotionReveal } from "@/components/common/MotionReveal";
import { FirstMatchCountdown } from "@/components/home/FirstMatchCountdown";
import { StatCard } from "@/components/common/StatCard";
import { TeamBadge } from "@/components/common/TeamBadge";
import { MatchCard } from "@/components/matches/MatchCard";
import { NewsCard } from "@/components/news/NewsCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { getMatches } from "@/lib/api/matches";
import { getNewsArticles } from "@/lib/api/news";
import { getTeams } from "@/lib/api/teams";
import type { Match } from "@/types/match";
import { MonitorPlay, RadioTower, Tv } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const sections = [
  {
    href: "/matches",
    title: "Match schedules",
    description:
      "Browse upcoming, live, and finished fixtures from the mock API layer.",
  },
  {
    href: "/teams",
    title: "Team pages",
    description:
      "Review team profile data that can later connect to backend responses.",
  },
  {
    href: "/news",
    title: "News and blogs",
    description:
      "Read article listings and details with typed frontend-friendly content.",
  },
  {
    href: "/history",
    title: "Football history",
    description:
      "Scan previous winners, host countries, final scores, and summaries.",
  },
];

const watchPlatforms = [
  {
    name: "Unite8 Sports",
    label: "Official TV broadcaster",
    logo: "Unite8",
    badgeClass: "bg-emerald-400 text-neutral-950",
    icon: Tv,
    description:
      "Four dedicated ZEE sports channels carry every tournament fixture.",
    channels: [
      "Hindi: Unite8 Sports 1",
      "Hindi: Unite8 Sports 1 HD",
      "English: Unite8 Sports 2",
      "English: Unite8 Sports 2 HD",
    ],
  },
  {
    name: "ZEE5",
    label: "Official live streaming",
    logo: "ZEE5",
    badgeClass: "bg-violet-500 text-white",
    icon: MonitorPlay,
    description:
      "Live and on-demand streaming across mobile, tablet, and connected TV.",
    channels: [
      "All matches live",
      "On-demand replays",
      "Mobile and tablet",
      "Connected TV",
    ],
    link: "https://www.zee5.com/sports/football/fifa-world-cup/2026",
  },
  {
    name: "DD Sports",
    label: "Free telecast",
    logo: "DD",
    badgeClass: "bg-amber-300 text-neutral-950",
    icon: RadioTower,
    description:
      "Prasar Bharati free-to-air coverage for biggest tournament fixtures.",
    channels: [
      "Opening match",
      "All quarter-finals",
      "All semi-finals",
      "Grand finale",
    ],
  },
];

function parseMatchStart(match: Match) {
  const startTime = Date.parse(match.date);

  return Number.isFinite(startTime) ? startTime : null;
}

function getFirstMatch(matches: Match[]) {
  return [...matches]
    .map((match) => ({ match, startTime: parseMatchStart(match) }))
    .filter(
      (entry): entry is { match: Match; startTime: number } =>
        entry.startTime !== null,
    )
    .sort((first, second) => first.startTime - second.startTime)[0];
}

export async function HomePage() {
  const [matches, teams, articles] = await Promise.all([
    getMatches(),
    getTeams(),
    getNewsArticles(),
  ]);
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const featuredMatches = matches
    .filter((match) => {
      const matchDateStr = match.date.split("T")[0];
      const isTodayOrTomorrow =
        matchDateStr === todayStr ||
        match.dateUtc === todayStr ||
        matchDateStr === tomorrowStr ||
        match.dateUtc === tomorrowStr;
      const isUpcoming =
        match.status === "scheduled" || match.status === "live";
      return isTodayOrTomorrow && isUpcoming;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const firstMatch = getFirstMatch(matches);
  const firstMatchLabel = firstMatch
    ? `${firstMatch.match.homeTeam.name} vs ${firstMatch.match.awayTeam.name}`
    : null;

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-8 sm:px-6 sm:py-10 lg:gap-12 lg:px-8 lg:py-12">
      <MotionReveal>
        <section className="relative flex min-h-[380px] items-center justify-start overflow-hidden rounded-lg bg-neutral-950 p-5 text-left text-white shadow-[0_24px_70px_rgba(4,22,13,0.28)] ring-1 ring-white/10 sm:min-h-[430px] sm:p-8 lg:p-10">
          <Image
            src={images.banners.worldCup2026}
            alt="FIFA 26 tournament banner"
            fill
            priority
            sizes="100vw"
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
              Explore real-time match fixtures, detailed team profiles, latest news updates, official broadcast hubs, and historical tournament archives on a production-ready dashboard.
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
                href="/teams"
              >
                Explore teams
              </Link>
            </div>
          </div>
        </section>
      </MotionReveal>

      {featuredMatches.length > 0 ? (
        <MotionReveal className="grid gap-4">
          <SectionHeader
            eyebrow="Upcoming matches"
            title="Matches To Look Out For"
          />
          <div
            className={`grid gap-6 ${featuredMatches.length === 1 ? "grid-cols-1 max-w-xl mx-auto" : "md:grid-cols-2 lg:grid-cols-3"}`}
          >
            {featuredMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </MotionReveal>
      ) : null}

      <section className="grid gap-5">
        <SectionHeader eyebrow="Latest news" title="Tournament updates" />
        <div className="grid gap-5 md:grid-cols-2">
          {articles.slice(0, 2).map((article, index) => (
            <MotionReveal delay={Math.min(index * 0.05, 0.12)} key={article.id}>
              <NewsCard article={article} />
            </MotionReveal>
          ))}
        </div>
      </section>

      <MotionReveal>
        <section className="my-8 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_24px_70px_rgba(4,22,13,0.08)] transition-all dark:border-white/10 dark:bg-neutral-950 dark:shadow-[0_24px_70px_rgba(4,22,13,0.24)]">
          <div className="grid gap-0 lg:grid-cols-[0.6fr_1.4fr]">
            {/* Left Sidebar Content */}
            <div className="relative flex flex-col justify-between gap-10 border-b border-neutral-200 p-6 sm:p-8 lg:border-b-0 lg:border-r dark:border-white/10 dark:bg-emerald-950/10">
              <div className="grid gap-5">
                <p className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-400">
                  Live Coverage
                </p>
                <div className="grid gap-3">
                  <h2 className="font-heading text-3xl font-black tracking-tight text-neutral-950 sm:text-4xl dark:text-white">
                    Broadcast Hub
                  </h2>
                  <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-base">
                    Official television, live streaming, and free-to-air options
                    for world-class FIFA 2026 coverage.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 transition duration-300 hover:bg-neutral-100 dark:border-emerald-500/10 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-emerald-500/60">
                    Coverage
                  </p>
                  <p className="font-heading mt-1 text-3xl font-black text-neutral-950 dark:text-white">
                    104
                  </p>
                  <p className="mt-0.5 text-[10px] text-neutral-500 dark:text-neutral-500">
                    Full matches
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 transition duration-300 hover:bg-neutral-100 dark:border-emerald-500/10 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-emerald-500/60">
                    Access
                  </p>
                  <p className="font-heading mt-1 text-3xl font-black text-neutral-950 dark:text-white">
                    4K
                  </p>
                  <p className="mt-0.5 text-[10px] text-neutral-500 dark:text-neutral-500">
                    Multi-platform
                  </p>
                </div>
              </div>
            </div>

            {/* Platform Grid */}
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-3">
              {watchPlatforms.map((platform, index) => {
                const Icon = platform.icon;

                return (
                  <MotionReveal
                    className="h-full"
                    delay={Math.min(index * 0.05, 0.15)}
                    key={platform.name}
                  >
                    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:hover:border-emerald-500/50 dark:hover:bg-white/10">
                      <div className="p-5 pb-0">
                        <div className="flex items-center justify-between gap-3">
                          <div
                            className={`flex h-10 min-w-16 items-center justify-center rounded-lg px-3 font-heading text-xs font-black tracking-tight shadow-sm ring-1 ring-black/5 transition duration-500 group-hover:scale-105 ${platform.badgeClass}`}
                            aria-label={`${platform.name} logo`}
                          >
                            {platform.logo}
                          </div>
                          <div className="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors duration-300 group-hover:bg-emerald-100 group-hover:text-emerald-700 dark:bg-white/5 dark:text-emerald-400/80 dark:group-hover:bg-emerald-500/20">
                            <Icon className="size-5" aria-hidden="true" />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <div className="mb-4">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400/80">
                            {platform.label}
                          </p>
                          <h3 className="font-heading text-lg font-black text-neutral-950 dark:text-white">
                            {platform.name}
                          </h3>
                        </div>

                        <p className="mb-6 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                          {platform.description}
                        </p>

                        <div className="mt-auto space-y-4">
                          <div className="flex flex-wrap gap-1.5">
                            {platform.channels.map((channel) => (
                              <span
                                className="inline-flex rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[10px] font-medium text-neutral-700 transition group-hover:border-emerald-200 dark:border-white/5 dark:bg-black/20 dark:text-neutral-300 dark:group-hover:border-emerald-500/30"
                                key={channel}
                              >
                                {channel}
                              </span>
                            ))}
                          </div>

                          {platform.link && (
                            <Button className="w-full h-9 text-xs font-bold transition-all duration-300 group-hover:bg-emerald-600  dark:hover:bg-emerald-600">
                              <Link href={platform.link} target="_blank">
                                Launch Platform
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </article>
                  </MotionReveal>
                );
              })}
            </div>
          </div>
        </section>
      </MotionReveal>

      <section className="grid gap-5 sm:grid-cols-3">
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
      </section>

      <section
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Platform sections"
      >
        {sections.map((section, index) => (
          <MotionReveal delay={Math.min(index * 0.04, 0.18)} key={section.href}>
            <Link
              className="block h-full rounded-lg border border-neutral-200/80 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg dark:border-white/10 dark:bg-neutral-950/85 dark:shadow-none dark:hover:border-emerald-500/60 sm:p-6"
              href={section.href}
            >
              <h2 className="font-heading text-lg font-bold text-neutral-950 dark:text-neutral-50">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-400">
                {section.description}
              </p>
            </Link>
          </MotionReveal>
        ))}
      </section>
    </div>
  );
}
