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
import { buttonVariants } from "@/components/ui/button";
import { getMatches } from "@/lib/api/matches";
import { getNewsArticles } from "@/lib/api/news";
import { getTeams } from "@/lib/api/teams";
import type { Match } from "@/types/match";
import { MonitorPlay, RadioTower, Tv } from "lucide-react";

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
    channels: ["All matches live", "On-demand replays", "Mobile and tablet", "Connected TV"],
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
  const firstMatch = getFirstMatch(matches);
  const featuredMatch = firstMatch?.match ?? matches[0];
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
              Fixtures, teams, news, and tournament history in one API-ready
              frontend.
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
            {firstMatch && firstMatchLabel ? (
              <FirstMatchCountdown
                matchId={firstMatch.match.id}
                matchLabel={firstMatchLabel}
                targetIso={new Date(firstMatch.startTime).toISOString()}
              />
            ) : null}
          </div>
        </section>
      </MotionReveal>

      <MotionReveal>
        <section className="my-8 overflow-hidden rounded-lg bg-neutral-950 text-white shadow-[0_24px_70px_rgba(4,22,13,0.24)] ring-1 ring-white/10">
          <div className="grid gap-0 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="relative grid content-between gap-8 border-b border-white/10 p-5 sm:p-7 lg:border-b-0 lg:border-r lg:p-8">
              <div className="grid gap-4">
                <p className="w-fit rounded-md border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-100">
                  Where to watch
                </p>
                <div className="grid gap-3">
                  <h2 className="font-heading text-3xl font-black tracking-normal sm:text-4xl">
                    Broadcast hub
                  </h2>
                  <p className="max-w-md text-sm leading-7 text-neutral-300 sm:text-base">
                    Official television, live streaming, and free-to-air
                    options for FIFA 2026 coverage.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                    Coverage
                  </p>
                  <p className="font-heading mt-2 text-3xl font-black text-white">
                    104
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">matches</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                    Access
                  </p>
                  <p className="font-heading mt-2 text-3xl font-black text-white">
                    TV
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">stream + free</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:p-7 lg:grid-cols-3 lg:p-8">
              {watchPlatforms.map((platform, index) => {
                const Icon = platform.icon;

                return (
                  <MotionReveal
                    className="h-full"
                    delay={Math.min(index * 0.05, 0.15)}
                    key={platform.name}
                  >
                    <article className="group flex h-full flex-col gap-5 rounded-lg border border-white/10 bg-white/[0.07] p-5 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/60 hover:bg-white/[0.1]">
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className={`grid h-12 min-w-20 place-items-center rounded-md px-3 font-heading text-sm font-black tracking-normal shadow-lg transition duration-300 group-hover:scale-105 ${platform.badgeClass}`}
                          aria-label={`${platform.name} logo`}
                        >
                          {platform.logo}
                        </div>
                        <div className="grid size-10 place-items-center rounded-md border border-white/10 bg-white/[0.06] text-emerald-200 transition duration-300 group-hover:bg-emerald-400/10">
                          <Icon className="size-5" aria-hidden="true" />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-emerald-200">
                          {platform.label}
                        </p>
                        <h3 className="font-heading text-xl font-black text-white">
                          {platform.name}
                        </h3>
                        <p className="text-sm leading-7 text-neutral-300">
                          {platform.description}
                        </p>
                      </div>
                      <ul className="mt-auto grid gap-2">
                        {platform.channels.map((channel) => (
                          <li
                            className="rounded-md border border-white/10 bg-neutral-950/45 px-3 py-2 text-sm font-medium text-neutral-200 transition group-hover:border-emerald-300/30"
                            key={channel}
                          >
                            {channel}
                          </li>
                        ))}
                      </ul>
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

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start">
        {featuredMatch ? (
          <MotionReveal className="grid gap-4">
            <SectionHeader eyebrow="Featured match" title="Main fixture" />
            <MatchCard match={featuredMatch} />
          </MotionReveal>
        ) : null}
        <MotionReveal className="grid gap-4" delay={0.05}>
          <SectionHeader eyebrow="Top teams" title="Favorite Teams" />
          <Card>
            <CardContent className="grid gap-4 p-5 sm:p-6">
              {teams.slice(0, 3).map((team) => (
                <TeamBadge key={team.id} {...team} ranking={team.fifaRanking} />
              ))}
            </CardContent>
          </Card>
        </MotionReveal>
      </section>

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
