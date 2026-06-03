"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { MotionReveal } from "@/components/common/MotionReveal";
import { SectionHeader } from "@/components/common/SectionHeader";
import { MatchList } from "@/components/matches/MatchList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchMatchesByTeam } from "@/lib/api/matches";
import { useQuery } from "@tanstack/react-query";
import { Search, XIcon } from "lucide-react";
import { FormEvent, useState } from "react";

export function MatchesPage() {
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedSearch(teamSearch.trim());
  }
  const handleClearSearch = () => {
    setTeamSearch("");
    setSubmittedSearch("");
  };

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <SectionHeader
        eyebrow="Matches"
        title="Match schedules"
        description="Upcoming, live, and completed fixtures from FIFA's official data."
      />
      <MotionReveal>
        <form
          className="flex flex-col gap-3 rounded-lg border border-neutral-200/80 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-neutral-950/70 sm:flex-row sm:p-5"
          onSubmit={handleSubmit}
        >
          <Input
            aria-label="Search matches by team"
            placeholder="Search matches by team..."
            value={teamSearch}
            onChange={(event) => setTeamSearch(event.target.value)}
          />

          {isSuccess && submittedSearch.length > 0 && (
            <Button variant="outline" onClick={handleClearSearch}>
              <XIcon className="h-4 w-4" />
            </Button>
          )}

          <Button className="sm:w-auto" disabled={isFetching} type="submit">
            <Search aria-hidden="true" className="h-4 w-4" />
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
