"use client";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
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
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Teams"
        title="Team profiles"
        description="Team details, rankings, coaches, and basic stats prepared for backend data."
      />

      <input
        type="text"
        placeholder="Search teams..."
        value={input}
        onChange={(e) => setinput(e.target.value)}
        className="mb-4 w-full rounded-md border border-gray-300 p-2"
      />

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
