"use client";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { MotionReveal } from "@/components/common/MotionReveal";
import { SectionHeader } from "@/components/common/SectionHeader";
import { TeamList } from "@/components/teams/TeamList";
import { getTeams } from "@/lib/api/teams";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useMemo, useState } from "react";

export function TeamsPage() {
  const {
    data: teams,
    isFetched,
    isError,
  } = useSuspenseQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
  });

  const [input, setinput] = useState("");

  const filteredTeams = useMemo(() => {
    if (!teams) {
      return [];
    }

    return teams.filter((team) => team.name.toLowerCase().startsWith(input));
  }, [input, teams]);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <SectionHeader
        eyebrow="Teams"
        title="Team profiles"
        description="Team details, rankings, coaches, and basic stats prepared for backend data."
      />

      <MotionReveal>
        <input
          type="text"
          placeholder="Search teams..."
          value={input}
          onChange={(e) => setinput(e.target.value)}
          className="w-full rounded-md border border-neutral-200/80 bg-white/90 px-4 py-3 text-sm text-neutral-950 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-600/20 dark:border-white/10 dark:bg-neutral-950/75 dark:text-neutral-50"
        />
      </MotionReveal>

      <Suspense fallback={<LoadingState />}>
        {isFetched && teams.length ? (
          <TeamList teams={filteredTeams} />
        ) : isError ? (
          <ErrorState
            title="Failed to load teams"
            message="Please try again later."
            key={"teams"}
          />
        ) : (
          <EmptyState
            title="No teams found"
            description="Teams will appear here once data is available."
          />
        )}
      </Suspense>
    </div>
  );
}
