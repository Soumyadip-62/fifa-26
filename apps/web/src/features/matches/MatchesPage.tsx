"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { MotionReveal } from "@/components/common/MotionReveal";
import { SectionHeader } from "@/components/common/SectionHeader";
import { MatchList } from "@/components/matches/MatchList";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchMatchesByTeam } from "@/lib/api/matches";
import { useQuery } from "@tanstack/react-query";
import { Search, XIcon, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useMatchContext } from "Context/MatchContext";

export function MatchesPage() {
  const { liveMatches, setLiveMatches } = useMatchContext();
  const [teamSearch, setTeamSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const {
    data: matches = [],
    isError,
    isLoading,
    isFetching,
    isSuccess,
  } = useQuery({
    queryKey: ["matches", submittedSearch],
    queryFn: () => searchMatchesByTeam(submittedSearch),
  });

  useEffect(() => {
    const filteredLiveMatches = matches.filter(
      (match) => match.status.toLowerCase() === "live",
    );

    setLiveMatches(filteredLiveMatches);
  }, [matches, setLiveMatches]);

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
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          eyebrow="Matches"
          title="Match schedules"
          description="Upcoming, live, and completed fixtures from FIFA's official data."
        />
        <Link
          href="/matches/knockout-matches"
          className={buttonVariants({
            variant: "default",
            className:
              "bg-primary hover:bg-primary/60 text-white dark:text-zinc-950 font-bold inline-flex items-center gap-2 shadow-xs rounded-full transition-all",
          })}
        >
          <Sparkles className="h-4 w-4" /> Knockout Stage
        </Link>
      </div>

      <MotionReveal>
        <form
          className="flex flex-col gap-3 rounded-[28px] border border-black/5 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md p-4 shadow-xs dark:border-white/10 sm:flex-row sm:p-5"
          onSubmit={handleSubmit}
        >
          <Input
            aria-label="Search matches by team"
            placeholder="Search matches by team..."
            value={teamSearch}
            onChange={(event) => setTeamSearch(event.target.value)}
            className="rounded-full border-black/5 dark:border-white/10 dark:bg-zinc-850/40 focus-visible:ring-primary/80 focus-visible:ring-offset-0"
          />

          {isSuccess && submittedSearch.length > 0 && (
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
      </MotionReveal>
      {isError ? (
        <ErrorState message="Failed to load matches." />
      ) : isLoading ? (
        <EmptyState
          title="Loading matches"
          description="Fetching the latest fixture list."
        />
      ) : matches.length ? (
        <MatchList matches={matches} />
      ) : (
        <EmptyState
          title="No matches found"
          description="Fixtures will appear here once data is available."
        />
      )}
    </div>
  );
}
