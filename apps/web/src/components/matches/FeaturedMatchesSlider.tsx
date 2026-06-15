"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeader } from "@/components/common/SectionHeader";
import { MotionReveal } from "@/components/common/MotionReveal";
import { MatchCard } from "@/components/matches/MatchCard";
import type { Match } from "@/types/match";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const pad = (n: number) => n.toString().padStart(2, "0");

const toLocalDateStr = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function formatDateLabel(d: Date) {
  return d.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type DateSlide = {
  key: string;
  label: string;
  tag: "yesterday" | "today" | "tomorrow";
  matches: Match[];
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function FeaturedMatchesSlider({ matches }: { matches: Match[] }) {
  const now = new Date();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yesterdayStr = toLocalDateStr(yesterday);
  const todayStr = toLocalDateStr(now);
  const tomorrowStr = toLocalDateStr(tomorrow);

  /* ---- build slides ---- */
  const slides: DateSlide[] = [];

  const yesterdayMatches = matches.filter((m) => {
    const d = toLocalDateStr(new Date(m.date));
    return d === yesterdayStr;
  });

  const todayMatches = matches.filter((m) => {
    const d = toLocalDateStr(new Date(m.date));
    return d === todayStr;
  });

  const tomorrowMatches = matches.filter((m) => {
    const d = toLocalDateStr(new Date(m.date));
    return (
      d === tomorrowStr && (m.status === "scheduled" || m.status === "live")
    );
  });

  if (yesterdayMatches.length > 0) {
    slides.push({
      key: yesterdayStr,
      label: `Yesterday · ${formatDateLabel(yesterday)}`,
      tag: "yesterday",
      matches: yesterdayMatches.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    });
  }

  if (todayMatches.length > 0) {
    slides.push({
      key: todayStr,
      label: `Today · ${formatDateLabel(now)}`,
      tag: "today",
      matches: todayMatches.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    });
  }

  if (tomorrowMatches.length > 0) {
    slides.push({
      key: tomorrowStr,
      label: `Tomorrow · ${formatDateLabel(tomorrow)}`,
      tag: "tomorrow",
      matches: tomorrowMatches.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    });
  }

  /* ---- date-level scroll ---- */
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const todaySlideIndex = slides.findIndex((s) => s.tag === "today");
  const initialIndex = todaySlideIndex >= 0 ? todaySlideIndex : 0;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || slides.length === 0) return;
    el.scrollTo({ left: initialIndex * el.offsetWidth, behavior: "instant" });
    setActiveIndex(initialIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.offsetWidth === 0) return;
    setActiveIndex(Math.round(el.scrollLeft / el.offsetWidth));
  }, []);

  const scrollTo = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(index, slides.length - 1));
      el.scrollTo({ left: clamped * el.offsetWidth, behavior: "smooth" });
    },
    [slides.length],
  );

  if (slides.length === 0) return null;

  return (
    <MotionReveal className="grid gap-4">
      <div className="flex items-end justify-between gap-4">
        <SectionHeader
          eyebrow="Featured matches"
          title="Matches To Look Out For"
        />

        {slides.length > 1 && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              aria-label="Previous day"
              className="flex size-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
              disabled={activeIndex === 0}
              onClick={() => scrollTo(activeIndex - 1)}
              type="button"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              aria-label="Next day"
              className="flex size-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
              disabled={activeIndex === slides.length - 1}
              onClick={() => scrollTo(activeIndex + 1)}
              type="button"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>

      {/* Date-level scroll container */}
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory overflow-x-hidden scroll-smooth"
        onScroll={handleScroll}
      >
        {slides.map((slide) => (
          <div key={slide.key} className="w-full shrink-0 snap-start">
            {/* Date label pill */}
            <div className="mb-4 flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide ${
                  slide.tag === "today"
                    ? "border border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
                    : "border border-neutral-200 bg-neutral-100 text-neutral-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400"
                }`}
              >
                {slide.label}
              </span>
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                {slide.matches.length}{" "}
                {slide.matches.length === 1 ? "match" : "matches"}
              </span>
            </div>

            {/* Match cards — single horizontal row with card slider */}
            <MatchRowSlider matches={slide.matches} />
          </div>
        ))}
      </div>

      {/* Date dot indicators */}
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {slides.map((slide, idx) => (
            <button
              key={slide.key}
              aria-label={`Go to ${slide.label}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? "w-6 bg-emerald-600 dark:bg-emerald-400"
                  : "w-2 bg-neutral-300 hover:bg-neutral-400 dark:bg-white/20 dark:hover:bg-white/30"
              }`}
              onClick={() => scrollTo(idx)}
              type="button"
            />
          ))}
        </div>
      )}
    </MotionReveal>
  );
}

/* ------------------------------------------------------------------ */
/*  Inner card-level horizontal slider                                */
/* ------------------------------------------------------------------ */

const ARROW_BTN =
  "absolute top-1/2 -translate-y-1/2 z-10 flex size-9 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-600 shadow-lg backdrop-blur transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 disabled:pointer-events-none disabled:opacity-0 dark:border-white/10 dark:bg-neutral-900/90 dark:text-neutral-300 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-400";

function MatchRowSlider({ matches }: { matches: Match[] }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = rowRef.current;
    if (!el) return;
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => ro.disconnect();
  }, [checkScroll]);

  const scroll = useCallback((dir: -1 | 1) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 380, behavior: "smooth" });
  }, []);

  return (
    <div className="group/row relative">
      {canScrollLeft && (
        <button
          aria-label="Scroll matches left"
          className={`${ARROW_BTN} left-2`}
          onClick={() => scroll(-1)}
          type="button"
        >
          <ChevronLeft className="size-4" />
        </button>
      )}

      <div
        ref={rowRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2"
        onScroll={checkScroll}
        style={{ scrollbarWidth: "none" }}
      >
        {matches.map((match, i) => (
          <div
            key={match.id}
            className="w-[340px] shrink-0 snap-start sm:w-[380px]"
          >
            <MotionReveal delay={Math.min(i * 0.04, 0.16)}>
              <MatchCard match={match} />
            </MotionReveal>
          </div>
        ))}
      </div>

      {canScrollRight && (
        <button
          aria-label="Scroll matches right"
          className={`${ARROW_BTN} right-2`}
          onClick={() => scroll(1)}
          type="button"
        >
          <ChevronRight className="size-4" />
        </button>
      )}
    </div>
  );
}
