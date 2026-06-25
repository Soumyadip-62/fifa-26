"use client";
import Image from "next/image";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { MotionReveal } from "@/components/common/MotionReveal";
import { SectionHeader } from "@/components/common/SectionHeader";
import { TeamList } from "@/components/teams/TeamList";
import { getTeams } from "@/lib/api/teams";
import { images } from "@/assets";
import type { Team } from "@/types/team";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useMemo, useState } from "react";

function getTeamSearchText(team: Team) {
  return [
    team.name,
    team.country,
    team.shortCode,
    team.fifa_code,
    team.name_normalised,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function TeamsPage() {
  const {
    data: teams,
    isFetched,
    isError,
  } = useSuspenseQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
  });

  const [input, setInput] = useState("");
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

  const filteredTeams = useMemo(() => {
    if (!teams) {
      return [];
    }

    const query = input.trim().toLowerCase();

    if (!query) {
      return teams;
    }

    return teams.filter((team) => getTeamSearchText(team).includes(query));
  }, [input, teams]);

  const suggestions = useMemo(
    () => filteredTeams.slice(0, 8),
    [filteredTeams],
  );

  const selectTeam = (team: Team) => {
    setInput(team.name);
    setIsAutocompleteOpen(false);
    setActiveSuggestionIndex(0);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isAutocompleteOpen || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestionIndex((index) => (index + 1) % suggestions.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex(
        (index) => (index - 1 + suggestions.length) % suggestions.length,
      );
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selectedTeam = suggestions[activeSuggestionIndex];

      if (selectedTeam) {
        selectTeam(selectedTeam);
      }
    }

    if (event.key === "Escape") {
      setIsAutocompleteOpen(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <SectionHeader
        eyebrow="Teams"
        title="Team profiles"
        description="Team details, rankings, coaches, and basic stats prepared for backend data."
      />

      <MotionReveal>
        <div className="relative">
          <input
            type="text"
            placeholder="Search teams..."
            value={input}
            onBlur={() => setTimeout(() => setIsAutocompleteOpen(false), 120)}
            onChange={(e) => {
              setInput(e.target.value);
              setActiveSuggestionIndex(0);
              setIsAutocompleteOpen(true);
            }}
            onFocus={() => setIsAutocompleteOpen(true)}
            onKeyDown={handleSearchKeyDown}
            role="combobox"
            aria-expanded={isAutocompleteOpen}
            aria-autocomplete="list"
            className="w-full rounded-[24px] border border-black/5 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md px-5 py-3 text-sm text-zinc-950 dark:text-white shadow-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10"
          />

          {isAutocompleteOpen && input.trim() && suggestions.length > 0 ? (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-[20px] border border-black/5 bg-white/95 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/95">
              <ul className="max-h-80 overflow-y-auto py-1" role="listbox">
                {suggestions.map((team, index) => {
                  const imageUrl =
                    team.logoUrl || team.image_url || images.teams.default;

                  return (
                    <li key={team.id} role="option" aria-selected={index === activeSuggestionIndex}>
                      <button
                        type="button"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          selectTeam(team);
                        }}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                          index === activeSuggestionIndex
                            ? "bg-primary/10 text-zinc-950 dark:text-white"
                            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/70"
                        }`}
                      >
                        <span className="relative size-9 shrink-0 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <Image
                            src={imageUrl}
                            alt={`${team.name} logo`}
                            fill
                            sizes="36px"
                            className="object-contain p-1.5"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-black">
                            {team.name}
                          </span>
                          <span className="block truncate text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            {team.fifa_code || team.shortCode || team.country}
                            {team.group ? ` · Group ${team.group}` : ""}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
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
