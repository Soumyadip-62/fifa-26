"use client";

import { FormattedDateTime } from "@/components/common/FormattedDateTime";
import { useEffect, useState } from "react";

const STORAGE_KEY = "fifa26:first-match-countdown";

type StoredCountdown = {
  matchId: string;
  matchLabel: string;
  targetIso: string;
};

export type FirstMatchCountdownProps = StoredCountdown;

function getRemainingTime(targetIso: string) {
  const remaining = Math.max(0, new Date(targetIso).getTime() - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, isFinished: remaining === 0 };
}

function readStoredCountdown() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    return stored ? (JSON.parse(stored) as StoredCountdown) : null;
  } catch {
    return null;
  }
}

function saveCountdown(countdown: StoredCountdown) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(countdown));
}

function formatTimeValue(value: number) {
  return value.toString().padStart(2, "0");
}

export function FirstMatchCountdown({
  matchId,
  matchLabel,
  targetIso,
}: FirstMatchCountdownProps) {
  const [countdown, setCountdown] = useState<StoredCountdown | null>(null);
  const [remaining, setRemaining] = useState<ReturnType<
    typeof getRemainingTime
  > | null>(null);

  useEffect(() => {
    const nextCountdown = { matchId, matchLabel, targetIso };
    const storedCountdown = readStoredCountdown();
    const activeCountdown =
      storedCountdown?.matchId === matchId &&
      storedCountdown.targetIso === targetIso
        ? storedCountdown
        : nextCountdown;

    saveCountdown(activeCountdown);
    setCountdown(activeCountdown);
    setRemaining(getRemainingTime(activeCountdown.targetIso));
  }, [matchId, matchLabel, targetIso]);

  useEffect(() => {
    if (!countdown) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemaining(getRemainingTime(countdown.targetIso));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [countdown]);

  const activeCountdown = countdown ?? { matchId, matchLabel, targetIso };
  const units = [
    { label: "Days", value: remaining?.days },
    { label: "Hours", value: remaining?.hours },
    { label: "Minutes", value: remaining?.minutes },
    { label: "Seconds", value: remaining?.seconds },
  ];

  return (
    <div className="grid w-full max-w-xl gap-4 rounded-[28px] border border-black/5 dark:border-white/10 bg-black/70 dark:bg-zinc-900/60 p-5 shadow-lg backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
          First match countdown
        </p>
        <time
          className="text-xs font-semibold text-zinc-300 dark:text-zinc-400"
          dateTime={activeCountdown.targetIso}
        >
          <FormattedDateTime date={targetIso} />
        </time>
      </div>
      <p className="text-sm font-black tracking-tight text-white">
        {activeCountdown.matchLabel}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {units.map((unit) => (
          <div
            className="grid min-h-16 place-items-center rounded-[18px] border border-white/5 bg-white/10 px-1 sm:px-2 py-2.5 text-center shadow-xs"
            key={unit.label}
          >
            <span className="font-heading text-lg sm:text-2xl font-black leading-none text-white">
              {typeof unit.value === "number"
                ? formatTimeValue(unit.value)
                : "--"}
            </span>
            <span className="mt-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-300">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
      {remaining?.isFinished ? (
        <p className="text-xs font-bold text-primary mt-1">
          The opening match is underway.
        </p>
      ) : null}
    </div>
  );
}
