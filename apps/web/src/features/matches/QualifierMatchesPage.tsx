"use client";

import { FormEvent, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { MotionReveal } from "@/components/common/MotionReveal";
import { SectionHeader } from "@/components/common/SectionHeader";
import { MatchStatusBadge } from "@/components/matches/MatchStatusBadge";
import VsIcon from "@/components/Icons/VsIcon";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getQualifierMatches } from "@/lib/api/matches";
import { FormattedDateTime } from "@/components/common/FormattedDateTime";
import { cn } from "@/lib/utils/cn";
import { useQuery } from "@tanstack/react-query";
import type { Match } from "@/types/match";
import {
  Trophy,
  MapPin,
  Search,
  XIcon,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { images } from "@/assets";

type QM = Match & {
  homeTeamSlot?: string;
  awayTeamSlot?: string;
  eventName?: string;
};

/* ── bracket structure ── */
const L32 = [74, 77, 73, 75, 83, 84, 81, 82];
const L16 = [89, 90, 93, 94];
const LQF = [97, 98];
const LSF = [101];
const R32 = [76, 78, 79, 80, 86, 88, 85, 87];
const R16 = [91, 92, 95, 96];
const RQF = [99, 100];
const RSF = [102];
const FINAL = 104;
const THIRD = 103;

const ROW_H = 38;
const ROWS = 16;
const GRID_COLS =
  "1.2fr 2.5fr 0.8fr 2.5fr 0.8fr 2.5fr 0.8fr 2.5fr 0.6fr 3.5fr 0.6fr 2.5fr 0.8fr 2.5fr 0.8fr 2.5fr 0.8fr 2.5fr 1.2fr";

const GRP_COLORS: Record<string, string> = {
  A: "text-red-400 border-red-500/30 bg-red-950/20",
  B: "text-pink-400 border-pink-500/30 bg-pink-950/20",
  C: "text-orange-400 border-orange-500/30 bg-orange-950/20",
  D: "text-amber-400 border-amber-500/30 bg-amber-950/20",
  E: "text-blue-400 border-blue-500/30 bg-blue-950/20",
  F: "text-violet-400 border-violet-500/30 bg-violet-950/20",
  G: "text-emerald-400 border-emerald-500/30 bg-emerald-950/20",
  H: "text-cyan-400 border-cyan-500/30 bg-cyan-950/20",
  I: "text-purple-400 border-purple-500/30 bg-purple-950/20",
  J: "text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-950/20",
  K: "text-rose-400 border-rose-500/30 bg-rose-950/20",
  L: "text-teal-400 border-teal-500/30 bg-teal-950/20",
};

const STAGES = [
  "All Stages",
  "Round of 32",
  "Round of 16",
  "Quarter-final",
  "Semi-final",
  "Match for third place",
  "Final",
] as const;

// Real photo of golden trophy/celebration generated via image generator
const GOLDEN_TROPHY_PHOTO = images.banners.worldCupTrophy;

function find(ms: QM[], n: number) {
  return ms.find((m) => m.matchNumber === n);
}

function code(slot: string | undefined) {
  return slot ?? "TBD";
}

function getSlotLabel(slot: string | undefined): string {
  if (!slot) return "TBD";
  if (slot.startsWith("W")) return `Winner Match ${slot.slice(1)}`;
  if (slot.startsWith("L")) return `Loser Match ${slot.slice(1)}`;
  if (/^\d/.test(slot)) {
    const pos = slot.charAt(0);
    const groups = slot.slice(1);
    const label = pos === "1" ? "1st" : pos === "2" ? "2nd" : "3rd";
    if (groups.includes("/")) return `${label} place Group ${groups}`;
    return `${label} Group ${groups}`;
  }
  return slot;
}

/* ── Compact match slot for bracket ── */
function Slot({
  match,
  highlight,
}: {
  match: QM | undefined;
  highlight?: "final" | "bronze";
}) {
  const h = match?.homeTeamSlot ?? match?.eventName?.split(" vs ")[0] ?? "TBD";
  const a = match?.awayTeamSlot ?? match?.eventName?.split(" vs ")[1] ?? "TBD";
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-[12px] border border-black/5 bg-white/95 dark:border-white/5 dark:bg-zinc-900/90 shadow-xs transition-all duration-200 hover:scale-[1.03] hover:border-primary/20",
        highlight === "final" &&
          "border-yellow-400/50 shadow-[0_0_12px_rgba(251,191,36,0.15)]",
        highlight === "bronze" &&
          "border-teal-400/50 shadow-[0_0_12px_rgba(45,212,191,0.15)]",
      )}
    >
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 px-2 py-1">
        <span className="truncate text-[10px] font-semibold text-zinc-700 dark:text-zinc-350">
          {code(h)}
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
      </div>
      <div className="flex items-center justify-between px-2 py-1">
        <span className="truncate text-[10px] font-semibold text-zinc-700 dark:text-zinc-350">
          {code(a)}
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
      </div>
    </div>
  );
}

/* ── Bracket arm connector ── */
function Arm({ side }: { side: "l" | "r" }) {
  const br = side === "l";
  return (
    <div className="flex h-full w-full flex-col">
      <div
        className={cn(
          "flex-1",
          br
            ? "border-t border-r border-emerald-500/20"
            : "border-t border-l border-emerald-500/20",
        )}
      />
      <div
        className={cn(
          "flex-1",
          br
            ? "border-b border-r border-emerald-500/20"
            : "border-b border-l border-emerald-500/20",
        )}
      />
    </div>
  );
}

/* ── Group badge for bracket sides ── */
function Grp({ g }: { g: string }) {
  const colorStyle =
    GRP_COLORS[g] ?? "text-neutral-400 border-neutral-700 bg-neutral-900";
  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all duration-200 hover:scale-110",
        colorStyle,
      )}
    >
      <span className="font-heading text-xs font-black">{g}</span>
    </div>
  );
}

/* ── Main Page ── */
export function QualifierMatchesPage() {
  const [teamSearch, setTeamSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [activeStage, setActiveStage] = useState<string>("All Stages");

  const {
    data: matches = [],
    isError,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["qualifier-matches"],
    queryFn: getQualifierMatches,
  });

  const ms = matches as QM[];
  const finalM = find(ms, FINAL);
  const thirdM = find(ms, THIRD);

  // Filter list matches based on search and selected stage
  const filteredMatches = ms.filter((match) => {
    const stageMatch =
      activeStage === "All Stages" || match.stage === activeStage;
    if (!stageMatch) return false;

    if (!submittedSearch) return true;

    const query = submittedSearch.toLowerCase();
    const homeS = (match.homeTeamSlot ?? "").toLowerCase();
    const awayS = (match.awayTeamSlot ?? "").toLowerCase();
    const event = (match.eventName ?? "").toLowerCase();
    const venue = (match.venue ?? "").toLowerCase();
    const city = (match.city ?? "").toLowerCase();
    const stage = (match.stage ?? "").toLowerCase();

    return (
      homeS.includes(query) ||
      awayS.includes(query) ||
      event.includes(query) ||
      venue.includes(query) ||
      city.includes(query) ||
      stage.includes(query)
    );
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedSearch(teamSearch.trim());
  }

  const handleClearSearch = () => {
    setTeamSearch("");
    setSubmittedSearch("");
  };

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <SectionHeader
        eyebrow="Tournament Bracket"
        title="Qualifier Matches"
        description="Follow the qualification paths and trace every matchup as teams compete to reach the World Cup Final."
      />

      {/* ──────────────── BRACKET VISUALIZATION ──────────────── */}
      {isError ? (
        <ErrorState message="Failed to load qualifier bracket." />
      ) : isLoading ? (
        <EmptyState
          title="Loading bracket"
          description="Fetching tournament layout."
        />
      ) : matches.length === 0 ? (
        <EmptyState
          title="No bracket data"
          description="Tournament bracket will appear here."
        />
      ) : (
        <MotionReveal>
          <section className="overflow-hidden rounded-[32px] border border-black/5 bg-zinc-200/20 dark:border-white/5 dark:bg-zinc-900/10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
            <div className="border-b border-black/5 dark:border-white/5 bg-zinc-150/40 dark:bg-zinc-950/40 px-4 py-3 text-center">
              <h2 className="font-heading text-lg font-black uppercase tracking-widest text-zinc-950 dark:text-white">
                World Champions
              </h2>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-semibold">
                FIFA World Cup 2026 · Knockout Bracket
              </p>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
              <div
                className="relative mx-auto"
                style={{
                  display: "grid",
                  gridTemplateColumns: GRID_COLS,
                  gridTemplateRows: `repeat(${ROWS}, ${ROW_H}px)`,
                  padding: "24px 16px",
                  width: "100%",
                  minWidth: "1100px",
                }}
              >
                {/* LEFT GROUPS */}
                {["A", "B", "C", "D", "E", "F"].map((g, i) => {
                  const rowSpan = Math.floor(ROWS / 6);
                  const rs = i * rowSpan + 1;
                  const re = rs + rowSpan;
                  return (
                    <div
                      key={g}
                      style={{ gridColumn: 1, gridRow: `${rs}/${re}` }}
                      className="flex items-center justify-center"
                    >
                      <Grp g={g} />
                    </div>
                  );
                })}

                {/* LEFT R32 */}
                {L32.map((n, i) => (
                  <div
                    key={n}
                    style={{
                      gridColumn: 2,
                      gridRow: `${i * 2 + 1}/${i * 2 + 3}`,
                    }}
                    className="flex items-center px-0.5"
                  >
                    <Slot match={find(ms, n)} />
                  </div>
                ))}

                {/* LEFT R32→R16 CONNECTORS */}
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      gridColumn: 3,
                      gridRow: `${i * 4 + 1}/${i * 4 + 5}`,
                    }}
                  >
                    <Arm side="l" />
                  </div>
                ))}

                {/* LEFT R16 */}
                {L16.map((n, i) => (
                  <div
                    key={n}
                    style={{
                      gridColumn: 4,
                      gridRow: `${i * 4 + 1}/${i * 4 + 5}`,
                    }}
                    className="flex items-center px-0.5"
                  >
                    <Slot match={find(ms, n)} />
                  </div>
                ))}

                {/* LEFT R16→QF CONNECTORS */}
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    style={{
                      gridColumn: 5,
                      gridRow: `${i * 8 + 1}/${i * 8 + 9}`,
                    }}
                  >
                    <Arm side="l" />
                  </div>
                ))}

                {/* LEFT QF */}
                {LQF.map((n, i) => (
                  <div
                    key={n}
                    style={{
                      gridColumn: 6,
                      gridRow: `${i * 8 + 1}/${i * 8 + 9}`,
                    }}
                    className="flex items-center px-0.5"
                  >
                    <Slot match={find(ms, n)} />
                  </div>
                ))}

                {/* LEFT QF→SF CONNECTOR */}
                <div style={{ gridColumn: 7, gridRow: `1/${ROWS + 1}` }}>
                  <Arm side="l" />
                </div>

                {/* LEFT SF */}
                {LSF.map((n) => (
                  <div
                    key={n}
                    style={{ gridColumn: 8, gridRow: `1/${ROWS + 1}` }}
                    className="flex items-center px-0.5"
                  >
                    <Slot match={find(ms, n)} />
                  </div>
                ))}

                {/* LEFT SF→FINAL CONNECTOR */}
                <div
                  style={{ gridColumn: 9, gridRow: `1/${ROWS + 1}` }}
                  className="flex items-center"
                >
                  <div className="h-px w-full bg-emerald-500/25" />
                </div>

                {/* CENTER: FINAL + TROPHY */}
                <div
                  style={{ gridColumn: 10, gridRow: `1/${ROWS + 1}` }}
                  className="flex flex-col items-center justify-center gap-2"
                >
                  <Slot match={finalM} highlight="final" />
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 via-amber-300 to-yellow-500 shadow-[0_0_24px_rgba(251,191,36,0.3)]">
                    <Trophy className="h-6 w-6 text-yellow-900" />
                  </div>
                  <span className="font-heading text-[8px] font-black uppercase tracking-widest text-yellow-400/80">
                    Champion
                  </span>
                  <div className="mt-1 flex flex-col items-center gap-1">
                    <span className="text-[7px] font-bold uppercase tracking-widest text-teal-400/60">
                      Bronze Winner
                    </span>
                    <Slot match={thirdM} highlight="bronze" />
                  </div>
                </div>

                {/* RIGHT FINAL→SF CONNECTOR */}
                <div
                  style={{ gridColumn: 11, gridRow: `1/${ROWS + 1}` }}
                  className="flex items-center"
                >
                  <div className="h-px w-full bg-emerald-500/25" />
                </div>

                {/* RIGHT SF */}
                {RSF.map((n) => (
                  <div
                    key={n}
                    style={{ gridColumn: 12, gridRow: `1/${ROWS + 1}` }}
                    className="flex items-center px-0.5"
                  >
                    <Slot match={find(ms, n)} />
                  </div>
                ))}

                {/* RIGHT SF→QF CONNECTOR */}
                <div style={{ gridColumn: 13, gridRow: `1/${ROWS + 1}` }}>
                  <Arm side="r" />
                </div>

                {/* RIGHT QF */}
                {RQF.map((n, i) => (
                  <div
                    key={n}
                    style={{
                      gridColumn: 14,
                      gridRow: `${i * 8 + 1}/${i * 8 + 9}`,
                    }}
                    className="flex items-center px-0.5"
                  >
                    <Slot match={find(ms, n)} />
                  </div>
                ))}

                {/* RIGHT QF→R16 CONNECTORS */}
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    style={{
                      gridColumn: 15,
                      gridRow: `${i * 8 + 1}/${i * 8 + 9}`,
                    }}
                  >
                    <Arm side="r" />
                  </div>
                ))}

                {/* RIGHT R16 */}
                {R16.map((n, i) => (
                  <div
                    key={n}
                    style={{
                      gridColumn: 16,
                      gridRow: `${i * 4 + 1}/${i * 4 + 5}`,
                    }}
                    className="flex items-center px-0.5"
                  >
                    <Slot match={find(ms, n)} />
                  </div>
                ))}

                {/* RIGHT R16→R32 CONNECTORS */}
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      gridColumn: 17,
                      gridRow: `${i * 4 + 1}/${i * 4 + 5}`,
                    }}
                  >
                    <Arm side="r" />
                  </div>
                ))}

                {/* RIGHT R32 */}
                {R32.map((n, i) => (
                  <div
                    key={n}
                    style={{
                      gridColumn: 18,
                      gridRow: `${i * 2 + 1}/${i * 2 + 3}`,
                    }}
                    className="flex items-center px-0.5"
                  >
                    <Slot match={find(ms, n)} />
                  </div>
                ))}

                {/* RIGHT GROUPS */}
                {["G", "H", "I", "J", "K", "L"].map((g, i) => {
                  const rowSpan = Math.floor(ROWS / 6);
                  const rs = i * rowSpan + 1;
                  const re = rs + rowSpan;
                  return (
                    <div
                      key={g}
                      style={{ gridColumn: 19, gridRow: `${rs}/${re}` }}
                      className="flex items-center justify-center"
                    >
                      <Grp g={g} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats footer */}
            <div className="grid grid-cols-4 divide-x divide-white/5 border-t border-white/5">
              {[
                { label: "Total Matches", value: String(matches.length) },
                { label: "Stages", value: "6" },
                {
                  label: "Venues",
                  value: String(
                    new Set(matches.map((m) => m.venue).filter(Boolean)).size,
                  ),
                },
                {
                  label: "Final",
                  value: finalM?.venue ?? "MetLife Stadium",
                  isAccent: true,
                },
              ].map((s) => (
                <div key={s.label} className="p-3 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                    {s.label}
                  </p>
                  <p
                    className={cn(
                      "font-heading mt-0.5 text-sm font-black",
                      s.isAccent ? "text-emerald-400" : "text-white",
                    )}
                  >
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </MotionReveal>
      )}

      {/* ──────────────── SEARCH & FILTER BAR ──────────────── */}
      {!isLoading && !isError && matches.length > 0 && (
        <MotionReveal>
          <div className="grid gap-4">
            {/* Search Box */}
            <form
              className="flex flex-col gap-3 rounded-[28px] border border-black/5 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md p-4 shadow-xs dark:border-white/10 sm:flex-row sm:p-5"
              onSubmit={handleSubmit}
            >
              <Input
                aria-label="Search qualifier matches"
                placeholder="Search by slot (e.g. 1A, W73), venue, or city..."
                value={teamSearch}
                onChange={(event) => setTeamSearch(event.target.value)}
                className="rounded-full border-black/5 dark:border-white/10 dark:bg-zinc-850/40 focus-visible:ring-primary focus-visible:ring-offset-0"
              />

              {submittedSearch.length > 0 && (
                <Button
                  variant="outline"
                  className="rounded-full h-10 w-10 p-0 border-black/5 dark:border-white/10 text-zinc-550 dark:text-zinc-400 dark:hover:text-white"
                  onClick={handleClearSearch}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              )}

              <Button
                className="sm:w-auto rounded-full bg-zinc-950 hover:bg-zinc-900 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 px-5 font-bold shadow-xs transition"
                disabled={isFetching}
                type="submit"
              >
                <Search aria-hidden="true" className="h-4 w-4 mr-1.5" />
                Search
              </Button>
            </form>

            {/* Stage filter tabs */}
            <div className="flex items-center gap-1 rounded-full bg-zinc-200/50 p-1 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5 overflow-x-auto max-w-full scrollbar-hide">
              {STAGES.map((stage) => (
                <button
                  key={stage}
                  onClick={() => setActiveStage(stage)}
                  className={cn(
                    "inline-flex whitespace-nowrap rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-200",
                    activeStage === stage
                      ? "bg-white text-zinc-950 shadow-xs dark:bg-zinc-700 dark:text-white"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200",
                  )}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>
        </MotionReveal>
      )}

      {/* ──────────────── DETAILED FIXTURES LIST WITH HIERARCHICAL DESIGNS ──────────────── */}
      {!isLoading && !isError && (
        <div className="grid gap-6">
          {filteredMatches.length === 0 ? (
            <EmptyState
              title="No fixtures found"
              description="Try adjusting your search query or stage selection."
            />
          ) : (
            <section
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              aria-label="Qualifier Fixtures"
            >
              {filteredMatches.map((match, index) => (
                <MotionReveal
                  delay={Math.min(index * 0.04, 0.2)}
                  key={match.id}
                >
                  <QualifierMatchCard match={match} />
                </MotionReveal>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────── HIERARCHICAL CARD ROUTER ──────────────── */
function QualifierMatchCard({ match }: { match: QM }) {
  const stage = match.stage;

  if (stage === "Final") {
    return <FinalMatchCard match={match} />;
  }
  if (stage === "Semi-final") {
    return <SemiFinalMatchCard match={match} />;
  }
  if (stage === "Quarter-final") {
    return <QuarterFinalMatchCard match={match} />;
  }
  if (stage === "Round of 16") {
    return <RoundOf16MatchCard match={match} />;
  }
  if (stage === "Match for third place") {
    return <ThirdPlaceMatchCard match={match} />;
  }
  return <RoundOf32MatchCard match={match} />;
}

const STAGE_IMAGES: Record<string, string> = {
  "Round of 32": images.banners.r32Stadium,
  "Round of 16": images.banners.r16Stadium,
  "Quarter-final": images.banners.qfStadium,
  "Semi-final": images.banners.sfStadium,
  "Match for third place": images.banners.thirdPlaceStadium,
};

/* ──── Helper Component: Card Header Image with overlays ───── */
function CardHeaderImage({
  match,
  accentClass,
}: {
  match: QM;
  accentClass?: string;
}) {
  const h = match.homeTeamSlot ?? "TBD";
  const a = match.awayTeamSlot ?? "TBD";
  const finalImage =
    STAGE_IMAGES[match.stage ?? ""] ??
    match.venueImageUrl ??
    images.stadiums.default;
  return (
    <div className="relative h-48 overflow-hidden bg-neutral-900 sm:h-52">
      <Image
        src={finalImage}
        alt={match.venue ? `${match.venue} stadium` : "Stadium"}
        fill
        sizes="(min-width: 1024px) 360px, 100vw"
        className="object-cover opacity-90 transition group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/30 to-transparent" />

      {/* Center overlay with team slots and VS icon */}
      <div className="absolute inset-0 flex items-center justify-center gap-4 px-4">
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-950/80 text-center font-heading text-xs font-black ring-1 ring-white/10",
            accentClass ?? "text-emerald-400 ring-emerald-500/20",
          )}
        >
          {h.slice(0, 4)}
        </div>
        <VsIcon />
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-950/80 text-center font-heading text-xs font-black ring-1 ring-white/10",
            accentClass ?? "text-violet-400 ring-violet-500/20",
          )}
        >
          {a.slice(0, 4)}
        </div>
      </div>
    </div>
  );
}

/* ───── Helper Component: Qualification Path Accordion ───── */
function QualificationPath({ match }: { match: QM }) {
  const [showPath, setShowPath] = useState(false);
  const homeSlot = match.homeTeamSlot ?? "TBD";
  const awaySlot = match.awayTeamSlot ?? "TBD";

  const hasPathInfo =
    homeSlot.startsWith("W") ||
    homeSlot.startsWith("L") ||
    /^\d/.test(homeSlot) ||
    awaySlot.startsWith("W") ||
    awaySlot.startsWith("L") ||
    /^\d/.test(awaySlot);

  if (!hasPathInfo) return null;

  return (
    <div className="border-t border-neutral-100 pt-3 dark:border-white/5 mt-1">
      <button
        onClick={() => setShowPath(!showPath)}
        className="flex w-full items-center justify-between text-left text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
      >
        <span>View Qualification Path</span>
        <ChevronRight
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            showPath && "rotate-90",
          )}
        />
      </button>

      {showPath && (
        <div className="mt-2 rounded bg-neutral-50 p-2.5 text-[11px] text-neutral-600 dark:bg-white/[0.02] dark:text-neutral-400">
          <ul className="list-disc pl-4 space-y-1">
            <li>
              Home:{" "}
              <span className="font-bold text-neutral-800 dark:text-neutral-200">
                {getSlotLabel(homeSlot)}
              </span>
            </li>
            <li>
              Away:{" "}
              <span className="font-bold text-neutral-800 dark:text-neutral-200">
                {getSlotLabel(awaySlot)}
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

/* ───── 1. ROUND OF 32 (Upgraded from MatchesPage card) ───── */
function RoundOf32MatchCard({ match }: { match: QM }) {
  const h = match.homeTeamSlot ?? "TBD";
  const a = match.awayTeamSlot ?? "TBD";
  const score =
    match.score.home === null || match.score.away === null
      ? "vs"
      : `${match.score.home} - ${match.score.away}`;

  return (
    <Card className="group h-full overflow-hidden border border-black/5 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md rounded-[28px] shadow-xs transition hover:scale-[1.01] hover:shadow-emerald-500/5 dark:border-white/10 dark:hover:border-emerald-500/40">
      <CardHeaderImage
        match={match}
        accentClass="text-emerald-400 ring-emerald-500/20"
      />

      <CardContent className="grid gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <MatchStatusBadge status={match.status} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Round of 32 / Match {match.matchNumber}
          </span>
        </div>

        <div className="grid gap-3.5">
          {/* Home team */}
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-[9px] font-black text-emerald-600 dark:text-emerald-400">
              H
            </span>
            <p className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {getSlotLabel(h)}
            </p>
          </div>

          {/* Glowing Green Score/Date Box */}
          <div className="flex items-center justify-between rounded-[18px] border border-black/5 bg-zinc-100/80 dark:bg-zinc-900/60 dark:shadow-[0_16px_48px_rgba(0,0,0,0.5)] px-3.5 py-2.5 text-zinc-900 dark:text-white dark:border-white/5 sm:flex sm:items-center sm:justify-between shadow-xs">
            <span className="text-[11px] text-zinc-550 dark:text-green-700 font-semibold">
              <FormattedDateTime date={match.date} />
            </span>
            <strong className="text-sm font-black tracking-wider">
              {score}
            </strong>
          </div>

          {/* Away team */}
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/10 text-[9px] font-black text-violet-600 dark:text-violet-400">
              A
            </span>
            <p className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {getSlotLabel(a)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
          <span>
            {match.venue}
            {match.city ? `, ${match.city}` : ""}
          </span>
        </div>

        <QualificationPath match={match} />
      </CardContent>
    </Card>
  );
}

/* ───── 2. ROUND OF 16 (Upgraded with Blue Themes) ───── */
function RoundOf16MatchCard({ match }: { match: QM }) {
  const h = match.homeTeamSlot ?? "TBD";
  const a = match.awayTeamSlot ?? "TBD";
  const score =
    match.score.home === null || match.score.away === null
      ? "vs"
      : `${match.score.home} - ${match.score.away}`;

  return (
    <Card className="group h-full overflow-hidden border border-black/5 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md rounded-[28px] shadow-xs transition hover:scale-[1.01] hover:shadow-blue-500/5 dark:border-white/10 dark:hover:border-blue-500/40">
      <CardHeaderImage
        match={match}
        accentClass="text-blue-400 ring-blue-500/20"
      />

      <CardContent className="grid gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <MatchStatusBadge status={match.status} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Round of 16 / Match {match.matchNumber}
          </span>
        </div>

        <div className="grid gap-2">
          {/* Home team */}
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-[9px] font-black text-blue-600 dark:text-blue-400">
              H
            </span>
            <p className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {getSlotLabel(h)}
            </p>
          </div>

          {/* Glowing Blue Score/Date Box */}
          <div className="grid gap-2 rounded-[18px] border border-black/5 bg-zinc-100/80 dark:bg-zinc-850/60 px-3.5 py-2.5 text-zinc-900 dark:text-white dark:border-white/5 sm:flex sm:items-center sm:justify-between shadow-xs">
            <span className="text-[11px] text-zinc-550 dark:text-zinc-400 font-semibold">
              <FormattedDateTime date={match.date} />
            </span>
            <strong className="text-sm font-black tracking-wider">
              {score}
            </strong>
          </div>

          {/* Away team */}
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-[9px] font-black text-blue-600 dark:text-blue-400">
              A
            </span>
            <p className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {getSlotLabel(a)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
          <span className="truncate">
            {match.venue}
            {match.city ? `, ${match.city}` : ""}
          </span>
        </div>

        <QualificationPath match={match} />
      </CardContent>
    </Card>
  );
}

/* ───── 3. QUARTER-FINAL (Upgraded with Violet/Purple Themes) ───── */
function QuarterFinalMatchCard({ match }: { match: QM }) {
  const h = match.homeTeamSlot ?? "TBD";
  const a = match.awayTeamSlot ?? "TBD";
  const score =
    match.score.home === null || match.score.away === null
      ? "vs"
      : `${match.score.home} - ${match.score.away}`;

  return (
    <Card className="group h-full overflow-hidden border border-black/5 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md rounded-[28px] shadow-xs transition hover:scale-[1.01] hover:shadow-violet-500/5 dark:border-white/10 dark:hover:border-violet-500/40">
      <CardHeaderImage
        match={match}
        accentClass="text-violet-400 ring-violet-500/20"
      />

      <CardContent className="grid gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <MatchStatusBadge status={match.status} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Quarter-final / Match {match.matchNumber}
          </span>
        </div>

        <div className="grid gap-2">
          {/* Home team */}
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/10 text-[9px] font-black text-violet-600 dark:text-violet-400">
              H
            </span>
            <p className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {getSlotLabel(h)}
            </p>
          </div>

          {/* Glowing Violet Score/Date Box */}
          <div className="grid gap-2 rounded-[18px] border border-black/5 bg-zinc-100/80 dark:bg-zinc-850/60 px-3.5 py-2.5 text-zinc-900 dark:text-white dark:border-white/5 sm:flex sm:items-center sm:justify-between shadow-xs">
            <span className="text-[11px] text-zinc-550 dark:text-zinc-400 font-semibold">
              <FormattedDateTime date={match.date} />
            </span>
            <strong className="text-sm font-black tracking-wider">
              {score}
            </strong>
          </div>

          {/* Away team */}
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/10 text-[9px] font-black text-violet-600 dark:text-violet-400">
              A
            </span>
            <p className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {getSlotLabel(a)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
          <span className="truncate">
            {match.venue}
            {match.city ? `, ${match.city}` : ""}
          </span>
        </div>

        <QualificationPath match={match} />
      </CardContent>
    </Card>
  );
}

/* ───── 4. SEMI-FINAL (Upgraded with Orange/Amber Themes) ───── */
function SemiFinalMatchCard({ match }: { match: QM }) {
  const h = match.homeTeamSlot ?? "TBD";
  const a = match.awayTeamSlot ?? "TBD";
  const score =
    match.score.home === null || match.score.away === null
      ? "vs"
      : `${match.score.home} - ${match.score.away}`;

  return (
    <Card className="group h-full overflow-hidden border border-black/5 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md rounded-[28px] shadow-xs transition hover:scale-[1.01] hover:shadow-orange-500/5 dark:border-white/10 dark:hover:border-orange-500/40">
      <CardHeaderImage
        match={match}
        accentClass="text-orange-400 ring-orange-500/20"
      />

      <CardContent className="grid gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <MatchStatusBadge status={match.status} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Semi-final / Match {match.matchNumber}
          </span>
        </div>

        <div className="grid gap-2">
          {/* Home team */}
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/10 text-[9px] font-black text-orange-600 dark:text-orange-400">
              H
            </span>
            <p className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {getSlotLabel(h)}
            </p>
          </div>

          {/* Glowing Orange Score/Date Box */}
          <div className="grid gap-2 rounded-[18px] border border-black/5 bg-zinc-100/80 dark:bg-zinc-850/60 px-3.5 py-2.5 text-zinc-900 dark:text-white dark:border-white/5 sm:flex sm:items-center sm:justify-between shadow-xs">
            <span className="text-[11px] text-zinc-550 dark:text-zinc-400 font-semibold">
              <FormattedDateTime date={match.date} />
            </span>
            <strong className="text-sm font-black tracking-wider">
              {score}
            </strong>
          </div>

          {/* Away team */}
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/10 text-[9px] font-black text-orange-600 dark:text-orange-400">
              A
            </span>
            <p className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {getSlotLabel(a)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
          <span className="truncate">
            {match.venue}
            {match.city ? `, ${match.city}` : ""}
          </span>
        </div>

        <QualificationPath match={match} />
      </CardContent>
    </Card>
  );
}

/* ───── 5. THIRD PLACE (Upgraded with Teal Themes) ───── */
function ThirdPlaceMatchCard({ match }: { match: QM }) {
  const h = match.homeTeamSlot ?? "TBD";
  const a = match.awayTeamSlot ?? "TBD";
  const score =
    match.score.home === null || match.score.away === null
      ? "vs"
      : `${match.score.home} - ${match.score.away}`;

  return (
    <Card className="group h-full overflow-hidden border border-black/5 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md rounded-[28px] shadow-xs transition hover:scale-[1.01] hover:shadow-teal-500/5 dark:border-white/10 dark:hover:border-teal-500/40">
      <CardHeaderImage
        match={match}
        accentClass="text-teal-400 ring-teal-500/20"
      />

      <CardContent className="grid gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <MatchStatusBadge status={match.status} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            3rd Place Playoff / Match {match.matchNumber}
          </span>
        </div>

        <div className="grid gap-2">
          {/* Home team */}
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/10 text-[9px] font-black text-teal-650 dark:text-teal-400">
              H
            </span>
            <p className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {getSlotLabel(h)}
            </p>
          </div>

          {/* Glowing Teal Score/Date Box */}
          <div className="grid gap-2 rounded-[18px] border border-black/5 bg-zinc-100/80 dark:bg-zinc-850/60 px-3.5 py-2.5 text-zinc-900 dark:text-white dark:border-white/5 sm:flex sm:items-center sm:justify-between shadow-xs">
            <span className="text-[11px] text-zinc-550 dark:text-zinc-400 font-semibold">
              <FormattedDateTime date={match.date} />
            </span>
            <strong className="text-sm font-black tracking-wider">
              {score}
            </strong>
          </div>

          {/* Away team */}
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/10 text-[9px] font-black text-teal-650 dark:text-teal-400">
              A
            </span>
            <p className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {getSlotLabel(a)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
          <span className="truncate">
            {match.venue}
            {match.city ? `, ${match.city}` : ""}
          </span>
        </div>

        <QualificationPath match={match} />
      </CardContent>
    </Card>
  );
}

/* ───── 6. THE GRAND FINAL (Golden Theme with Real Photo) ───── */
function FinalMatchCard({ match }: { match: QM }) {
  const h = match.homeTeamSlot ?? "TBD";
  const a = match.awayTeamSlot ?? "TBD";
  const score =
    match.score.home === null || match.score.away === null
      ? "vs"
      : `${match.score.home} - ${match.score.away}`;

  return (
    <Card className="group relative col-span-full mx-auto w-full max-w-2xl overflow-hidden border-2 border-yellow-450 bg-white dark:bg-zinc-900 shadow-[0_12px_40px_rgba(251,191,36,0.15)] rounded-[32px] transition hover:border-yellow-400 hover:shadow-[0_12px_50px_rgba(251,191,36,0.25)]">
      {/* Real golden trophy cup banner image */}
      <div className="relative h-60 overflow-hidden sm:h-72">
        <Image
          src={GOLDEN_TROPHY_PHOTO}
          alt="FIFA World Cup Trophy Championship"
          fill
          priority
          className="object-cover opacity-95 transition group-hover:scale-105"
        />

        {/* Golden radial background overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-900 via-transparent to-transparent" />

        {/* Center overlay with team slots and VS icon */}
        <div className="absolute inset-0 flex items-center justify-center gap-6 px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-950/90 text-center font-heading text-sm font-black text-yellow-400 ring-2 ring-yellow-400/40">
            {h.slice(0, 4)}
          </div>
          <VsIcon />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-950/90 text-center font-heading text-sm font-black text-yellow-400 ring-2 ring-yellow-400/40">
            {a.slice(0, 4)}
          </div>
        </div>
      </div>

      <CardContent className="relative grid gap-5 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-yellow-655 dark:text-yellow-400">
            <Sparkles className="h-3.5 w-3.5 text-yellow-500 dark:text-yellow-400 animate-pulse" />
            <span>FIFA World Cup Final</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-yellow-600 dark:text-yellow-550">
            Match {match.matchNumber}
          </span>
        </div>

        {/* Slot labels */}
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-black text-zinc-950">
              H
            </span>
            <p className="truncate text-sm font-black text-zinc-800 dark:text-zinc-100">
              {getSlotLabel(h)}
            </p>
          </div>

          {/* Golden score & date box */}
          <div className="grid gap-2 rounded-[18px] border border-yellow-500/20 bg-yellow-500/5 dark:bg-yellow-950/20 px-4 py-3.5 text-center sm:flex sm:items-center sm:justify-between shadow-xs">
            <span className="text-xs font-bold text-yellow-800 dark:text-yellow-300">
              <FormattedDateTime date={match.date} />
            </span>
            <strong className="text-base font-black tracking-widest text-yellow-650 dark:text-yellow-400">
              {score}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-black text-zinc-950">
              A
            </span>
            <p className="truncate text-sm font-black text-zinc-800 dark:text-zinc-100">
              {getSlotLabel(a)}
            </p>
          </div>
        </div>

        {/* Venue details */}
        <div className="flex items-center justify-between text-xs text-yellow-600 dark:text-yellow-550 border-t border-yellow-500/10 pt-4">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {match.venue}, {match.city}
          </span>
          <span className="font-bold uppercase tracking-wider">
            Champion crowned here
          </span>
        </div>

        <QualificationPath match={match} />
      </CardContent>
    </Card>
  );
}
