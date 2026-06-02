"use client";

import { formatDate } from "@/lib/utils/formatDate";
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
    <div className="grid w-full max-w-xl gap-3 rounded-lg border border-white/15 bg-neutral-950/35 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-100">
          First match countdown
        </p>
        <time
          className="text-xs font-semibold text-white/80"
          dateTime={activeCountdown.targetIso}
        >
          {formatDate(targetIso)}
          {/* {formatTimeValue(activeCountdown.targetIso)} */}
        </time>
      </div>
      <p className="text-sm font-semibold text-white">
        {activeCountdown.matchLabel}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {units.map((unit) => (
          <div
            className="grid min-h-16 place-items-center rounded-md border border-white/10 bg-white/10 px-1 sm:px-2 py-2 text-center"
            key={unit.label}
          >
            <span className="text-md sm:text-xl font-black leading-none text-white sm:text-2xl">
              {typeof unit.value === "number"
                ? formatTimeValue(unit.value)
                : "--"}
            </span>
            <span className="mt-1 text-[6px] sm:text-[10px] font-bold uppercase tracking-wide text-emerald-100">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
      {remaining?.isFinished ? (
        <p className="text-sm font-semibold text-emerald-100">
          The opening match is underway.
        </p>
      ) : null}
    </div>
  );
}
