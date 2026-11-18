import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  Play,
  Shield,
  Trophy,
  Users,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function CompactHero({
  live,
  competitions,
  teams,
  players,
}: {
  live: number;
  competitions: number;
  teams: number;
  players: number;
}) {
  const metrics = [
    { icon: Activity, count: live, label: "Live matches" },
    { icon: Trophy, count: competitions, label: "Competitions" },
    { icon: Shield, count: teams, label: "Teams" },
    { icon: Users, count: players, label: "Players" },
  ];
  return (
    <section className="dashboard-hero" aria-labelledby="home-title">
      <div className="dashboard-hero-main">
        <Image
          src="/assets/images/banners/pl-banner.png"
          alt="Premier League football"
          fill
          priority
          sizes="(min-width:1440px) 1380px, 100vw"
          className="dashboard-hero-image"
        />
        <div className="dashboard-hero-shade" />
        <div className="dashboard-hero-copy">
          <p className="dashboard-eyebrow">
            <span />
            Live football, always with you
          </p>
          <h1 id="home-title">
            Scores, Fixtures,
            <br />
            Stats <span>&amp; More.</span>
          </h1>
          <p className="dashboard-hero-description">
            Follow your favourite clubs across Europe&apos;s top competitions.
            <br className="hidden sm:block" /> Your whole football world, in one
            place.
          </p>
          <div className="dashboard-hero-actions">
            <Link href="/live" className={`${buttonVariants()} dashboard-cta`}>
              <Play aria-hidden="true" fill="currentColor" />
              Live Matches
              <ChevronRight className="cta-chevron" aria-hidden="true" />
            </Link>
            <Link
              href="/matches"
              className={`${buttonVariants({ variant: "outline" })} dashboard-cta dashboard-cta-secondary`}
            >
              <CalendarDays aria-hidden="true" />
              <span className="hidden sm:inline">Match Calendar</span>
              <span className="sm:hidden">Calendar</span>
            </Link>
          </div>
        </div>
        <span className="dashboard-hero-caption">
          THE BEAUTIFUL GAME. EVERY DAY.
        </span>
      </div>
      <div className="dashboard-metrics" aria-label="Football coverage">
        {metrics.map(({ icon: Icon, count, label }) => (
          <div key={label}>
            <Icon aria-hidden="true" />
            <strong>{new Intl.NumberFormat("en-GB").format(count)}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
