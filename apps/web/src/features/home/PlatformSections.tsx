"use client";

import { MotionReveal } from "@/components/common/MotionReveal";
import Link from "next/link";
import { Calendar, Shield, Newspaper, History } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const sections = [
  {
    href: "/matches",
    title: "Match fixtures",
    description: "Browse upcoming, live, and finished fixtures.",
    icon: Calendar,
    color: "bg-blue-500 text-white",
  },
  {
    href: "/teams",
    title: "Team profiles",
    description: "Review team profile details and squad rosters.",
    icon: Shield,
    color: "bg-emerald-500 text-white",
  },
  {
    href: "/news",
    title: "News & blogs",
    description: "Read article listings and typed editorial details.",
    icon: Newspaper,
    color: "bg-orange-500 text-white",
  },
  {
    href: "/history",
    title: "Football archives",
    description: "Scan previous winners, host countries, and summaries.",
    icon: History,
    color: "bg-purple-500 text-white",
  },
];

export function PlatformSections() {
  return (
    <section
      className="grid gap-5 grid-cols-2 lg:grid-cols-4"
      aria-label="Platform sections"
    >
      {sections.map((section, index) => {
        const Icon = section.icon;
        return (
          <MotionReveal delay={Math.min(index * 0.04, 0.18)} key={section.href}>
            <Link
              className="group block h-full rounded-[28px] ios-glass p-5 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 border border-black/5 dark:border-white/5"
              href={section.href}
            >
              <div className="flex flex-col h-full justify-between gap-5">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-[14px] shadow-md transition duration-300 group-hover:scale-110", section.color)}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="grid gap-1">
                  <h3 className="font-heading text-base font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
                    {section.title}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {section.description}
                  </p>
                </div>
              </div>
            </Link>
          </MotionReveal>
        );
      })}
    </section>
  );
}

