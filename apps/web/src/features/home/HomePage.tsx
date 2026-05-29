import Link from "next/link";
import Image from "next/image";
import { images } from "@/assets";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatCard } from "@/components/common/StatCard";
import { TeamBadge } from "@/components/common/TeamBadge";
import { MatchCard } from "@/components/matches/MatchCard";
import { NewsCard } from "@/components/news/NewsCard";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getMatches } from "@/lib/api/matches";
import { getNewsArticles } from "@/lib/api/news";
import { getTeams } from "@/lib/api/teams";

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

export async function HomePage() {
  const [matches, teams, articles] = await Promise.all([
    getMatches(),
    getTeams(),
    getNewsArticles(),
  ]);
  const featuredMatch = matches[0];

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative flex min-h-[420px] items-center justify-start overflow-hidden rounded-lg bg-neutral-950 p-6 text-left text-white shadow-[0_24px_70px_rgba(4,22,13,0.28)] ring-1 ring-white/10 sm:p-8 lg:p-10">
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
          <h1 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl">
            FIFA 2026
          </h1>
          <p className="max-w-xl text-base leading-7 text-emerald-50">
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
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
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

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] items-start">
        {featuredMatch ? (
          <div className="grid gap-3">
            <SectionHeader eyebrow="Featured match" title="Main fixture" />
            <MatchCard match={featuredMatch} />
          </div>
        ) : null}
        <div className="grid gap-3">
          <SectionHeader eyebrow="Top teams" title="Favorite Teams" />
          <Card>
            <CardContent className="grid gap-4 p-5">
              {teams.slice(0, 3).map((team) => (
                <TeamBadge key={team.id} {...team} ranking={team.fifaRanking} />
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4">
        <SectionHeader eyebrow="Latest news" title="Tournament updates" />
        <div className="grid gap-4 md:grid-cols-2">
          {articles.slice(0, 2).map((article) => (
            <NewsCard article={article} key={article.id} />
          ))}
        </div>
      </section>

      <section
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Platform sections"
      >
        {sections.map((section) => (
          <Link
            className="rounded-lg border border-neutral-200/80 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg dark:border-white/10 dark:bg-neutral-950/85 dark:shadow-none dark:hover:border-emerald-500/60"
            href={section.href}
            key={section.href}
          >
            <h2 className="text-lg font-bold text-neutral-950 dark:text-neutral-50">
              {section.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              {section.description}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
