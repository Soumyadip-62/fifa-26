"use client";

import { MotionReveal } from "@/components/common/MotionReveal";
import Link from "next/link";

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

export function PlatformSections() {
  return (
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
  );
}
