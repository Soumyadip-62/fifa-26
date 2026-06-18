"use client";

import { MotionReveal } from "@/components/common/MotionReveal";
import { MonitorPlay, RadioTower, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

export function BroadcastHub() {
  return (
    <MotionReveal>
      <section className="my-6 overflow-hidden rounded-[32px] border border-black/5 bg-zinc-200/20 dark:border-white/5 dark:bg-zinc-900/10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
        <div className="grid gap-0 lg:grid-cols-[0.6fr_1.4fr]">
          {/* Left Sidebar Content */}
          <div className="relative flex flex-col justify-between gap-8 border-b border-black/5 p-6 sm:p-8 lg:border-b-0 lg:border-r dark:border-white/5 dark:bg-zinc-900/20">
            <div className="grid gap-4">
              <p className="w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                Live Coverage
              </p>
              <div className="grid gap-2">
                <h2 className="font-heading text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl dark:text-white">
                  Broadcast Hub
                </h2>
                <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Official television, live streaming, and free-to-air options
                  for world-class FIFA 2026 coverage.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[20px] border border-black/5 bg-white/60 p-4 dark:border-white/5 dark:bg-zinc-800/20">
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  Coverage
                </p>
                <p className="font-heading mt-1 text-2xl font-black text-zinc-950 dark:text-white">
                  104
                </p>
                <p className="mt-0.5 text-[9px] text-zinc-400 dark:text-zinc-500">
                  Full matches
                </p>
              </div>
              <div className="rounded-[20px] border border-black/5 bg-white/60 p-4 dark:border-white/5 dark:bg-zinc-800/20">
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  Access
                </p>
                <p className="font-heading mt-1 text-2xl font-black text-zinc-950 dark:text-white">
                  4K
                </p>
                <p className="mt-0.5 text-[9px] text-zinc-400 dark:text-zinc-500">
                  Multi-platform
                </p>
              </div>
            </div>
          </div>

          {/* Platform Grid */}
          <div className="grid gap-5 p-6 sm:p-8 lg:grid-cols-3">
            {watchPlatforms.map((platform, index) => {
              const Icon = platform.icon;

              return (
                <MotionReveal
                  className="h-full"
                  delay={Math.min(index * 0.05, 0.15)}
                  key={platform.name}
                >
                  <article className="group flex h-full flex-col overflow-hidden rounded-[24px] ios-glass transition-all duration-300 hover:scale-[1.01] hover:shadow-md border border-black/5 dark:border-white/5">
                    <div className="p-5 pb-0">
                      <div className="flex items-center justify-between gap-3">
                        <div
                          className={`flex h-8 min-w-14 items-center justify-center rounded-lg px-2.5 font-heading text-[10px] font-black tracking-tight shadow-sm ring-1 ring-black/5 transition duration-500 group-hover:scale-105 ${platform.badgeClass}`}
                          aria-label={`${platform.name} logo`}
                        >
                          {platform.logo}
                        </div>
                        <div className="flex size-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors duration-300 group-hover:bg-primary/20 group-hover:text-primary dark:bg-zinc-800/40 dark:text-zinc-400">
                          <Icon className="size-4.5" aria-hidden="true" />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3">
                        <p className="mb-0.5 text-[9px] font-bold uppercase tracking-widest text-primary">
                          {platform.label}
                        </p>
                        <h3 className="font-heading text-base font-black text-zinc-950 dark:text-white">
                          {platform.name}
                        </h3>
                      </div>

                      <p className="mb-4 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {platform.description}
                      </p>

                      <div className="mt-auto space-y-4">
                        <div className="flex flex-wrap gap-1.5">
                          {platform.channels.map((channel) => (
                            <span
                              className="inline-flex rounded-full border border-black/5 bg-black/5 px-2.5 py-0.5 text-[9px] font-semibold text-zinc-700 transition dark:border-white/5 dark:bg-white/5 dark:text-zinc-300"
                              key={channel}
                            >
                              {channel}
                            </span>
                          ))}
                        </div>

                        {platform.link && (
                          <Link href={platform.link} target="_blank" className="block w-full">
                            <Button className="w-full h-8.5 rounded-full text-xs font-bold bg-primary hover:bg-primary/95 text-white dark:text-zinc-950 shadow-sm transition">
                              Launch Platform
                            </Button>
                          </Link>
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
  );
}

