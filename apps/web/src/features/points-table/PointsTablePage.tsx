"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Search,
  Sparkles,
  Grid,
  ArrowRight,
  Award,
} from "lucide-react";
import { FlagIcon } from "@/components/common/FlagIcon";
import { SectionHeader } from "@/components/common/SectionHeader";
import { MotionReveal } from "@/components/common/MotionReveal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { getStandings } from "@/lib/api/standings";
import { getMatches } from "@/lib/api/matches";
import { FormattedDateTime } from "@/components/common/FormattedDateTime";

export function PointsTablePage() {
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const {
    data: standingsData,
    isLoading: isLoadingStandings,
    isError: isErrorStandings,
  } = useQuery({
    queryKey: ["standings"],
    queryFn: getStandings,
  });

  const { data: matches = [], isLoading: isLoadingMatches } = useQuery({
    queryKey: ["matches"],
    queryFn: getMatches,
  });

  // Unique group list
  const groupsList = useMemo(() => {
    if (!standingsData?.standings) return [];
    return standingsData.standings.map((g) => g.group).sort();
  }, [standingsData]);

  // Filter groups based on search query
  const filteredStandings = useMemo(() => {
    if (!standingsData?.standings) return [];
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      if (selectedGroup === "All") {
        return standingsData.standings;
      }
      return standingsData.standings.filter((g) => g.group === selectedGroup);
    }

    return standingsData.standings.filter((group) =>
      group.table.some(
        (entry) =>
          entry.team.name.toLowerCase().includes(query) ||
          entry.team.tla.toLowerCase().includes(query),
      ),
    );
  }, [standingsData, selectedGroup, searchQuery]);

  // Group stage matches for selected group
  const groupMatches = useMemo(() => {
    if (selectedGroup === "All" || !matches.length) return [];
    const groupLetter = selectedGroup.replace("Group ", "");
    return matches
      .filter(
        (m) =>
          m.group === groupLetter && (m.stage === "Group Stage" || !m.stage),
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedGroup, matches]);

  const handleGroupSelect = (group: string) => {
    setSelectedGroup(group);
    setSearchQuery(""); // Clear search when switching tabs
  };

  const isLoading = isLoadingStandings || isLoadingMatches;
  const isError = isErrorStandings;

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState message="Failed to load tournament standings. Please try again later." />
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          eyebrow="Tournament Standings"
          title="Points Table"
          description="Real-time group stage tables and qualification rankings for FIFA 2026."
        />
        <Link
          href="/matches/knockout-matches"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all"
        >
          <Sparkles className="h-4 w-4" /> Knockout Stage
        </Link>
      </div>

      {/* Filters & Search */}
      <MotionReveal>
        <div className="flex flex-col gap-4 rounded-xl border border-neutral-200/80 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-neutral-950/70 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Quick Tabs */}
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant={selectedGroup === "All" ? "default" : "outline"}
              onClick={() => handleGroupSelect("All")}
              className={`h-9 px-3.5 text-xs font-bold ${
                selectedGroup === "All"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : ""
              }`}
            >
              <Grid className="mr-1.5 h-3.5 w-3.5" /> All Groups
            </Button>
            {groupsList.map((g) => (
              <Button
                key={g}
                variant={selectedGroup === g ? "default" : "outline"}
                onClick={() => handleGroupSelect(g)}
                className={`h-9 px-3.5 text-xs font-bold ${
                  selectedGroup === g
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : ""
                }`}
              >
                {g.replace("Group ", "Group ")}
              </Button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 h-9 bg-white/90 dark:bg-neutral-950"
            />
          </div>
        </div>
      </MotionReveal>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
              Calculating standings...
            </p>
          </div>
        </div>
      ) : filteredStandings.length === 0 ? (
        <EmptyState
          title="No standings found"
          description={
            searchQuery
              ? `No teams matching "${searchQuery}" were found.`
              : "Group standings are currently unavailable."
          }
        />
      ) : selectedGroup === "All" || searchQuery ? (
        /* Grid of All Groups */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStandings.map((groupData) => (
            <MotionReveal key={groupData.group}>
              <Card className="overflow-hidden border-neutral-200 bg-white/90 shadow-sm transition hover:border-emerald-300 dark:border-white/10 dark:bg-neutral-950/80">
                <div className="flex items-center justify-between border-b border-neutral-200/80 bg-neutral-50/50 px-4 py-3 dark:border-white/5 dark:bg-neutral-950/35">
                  <h3 className="font-heading text-sm font-black tracking-normal text-emerald-950 dark:text-emerald-400">
                    {groupData.group}
                  </h3>
                  <button
                    onClick={() => handleGroupSelect(groupData.group)}
                    className="inline-flex items-center text-[10px] font-bold text-neutral-500 hover:text-emerald-600 dark:text-neutral-400 dark:hover:text-emerald-400 transition"
                  >
                    View Details <ArrowRight className="ml-1 h-3 w-3" />
                  </button>
                </div>
                <CardContent className="p-0">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-100 bg-neutral-50/30 font-bold text-neutral-500 dark:border-white/5 dark:bg-neutral-950/20">
                        <th className="py-2.5 pl-4 w-10 text-center">Pos</th>
                        <th className="py-2.5">Team</th>
                        <th className="py-2.5 text-center w-10">P</th>
                        <th className="py-2.5 text-center w-10">GD</th>
                        <th className="py-2.5 text-center pr-4 w-12 font-bold text-neutral-800 dark:text-emerald-400">
                          Pts
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupData.table.map((entry) => {
                        const isQualifying = entry.position <= 2;
                        const isPotential = entry.position === 3;

                        return (
                          <tr
                            key={entry.team.id}
                            className="group/row border-b border-neutral-100/50 last:border-0 hover:bg-neutral-50/80 dark:border-white/5 dark:hover:bg-white/5 transition-colors"
                          >
                            <td className="py-3 text-center pl-4 font-semibold relative">
                              {/* Position Left Border Indicator */}
                              {isQualifying && (
                                <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-emerald-500 rounded-r" />
                              )}
                              {isPotential && (
                                <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-amber-500 rounded-r" />
                              )}
                              <span
                                className={`inline-flex items-center justify-center size-5 rounded-full text-[10px] ${
                                  isQualifying
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                    : isPotential
                                      ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                                      : "text-neutral-500"
                                }`}
                              >
                                {entry.position}
                              </span>
                            </td>
                            <td className="py-3">
                              <Link
                                href={`/teams/${entry.team.sportsdbTeamId}?group=${groupData.group}`}
                                className="inline-flex items-center gap-2 font-bold text-neutral-800 dark:text-neutral-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                              >
                                <div className="size-5 shrink-0 overflow-hidden rounded-md border border-neutral-100 bg-neutral-50 dark:border-white/10 dark:bg-neutral-900">
                                  <FlagIcon
                                    country={entry.team.name}
                                    className="h-full w-full object-cover scale-110"
                                  />
                                </div>
                                <span className="truncate max-w-[120px] sm:max-w-[150px]">
                                  {entry.team.name}
                                </span>
                              </Link>
                            </td>
                            <td className="py-3 text-center text-neutral-600 dark:text-neutral-400">
                              {entry.playedGames}
                            </td>
                            <td
                              className={`py-3 text-center font-medium ${
                                entry.goalDifference > 0
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : entry.goalDifference < 0
                                    ? "text-red-500"
                                    : "text-neutral-500"
                              }`}
                            >
                              {entry.goalDifference > 0 ? "+" : ""}
                              {entry.goalDifference}
                            </td>
                            <td className="py-3 text-center pr-4 font-extrabold text-neutral-950 dark:text-white">
                              {entry.points}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </MotionReveal>
          ))}
        </div>
      ) : (
        /* Detailed View of Single Group */
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1.4fr]">
          {/* Detailed Table */}
          <MotionReveal className="grid gap-4">
            <h3 className="font-heading text-xl font-black text-neutral-950 dark:text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" /> Standings Table
            </h3>
            <Card className="overflow-hidden border-neutral-200 bg-white/95 shadow-md dark:border-white/10 dark:bg-neutral-950/80">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse min-w-[550px]">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50 font-bold text-neutral-500 dark:border-white/10 dark:bg-neutral-950/45">
                        <th className="py-3.5 pl-4 w-14 text-center">Pos</th>
                        <th className="py-3.5">Team</th>
                        <th className="py-3.5 text-center w-12">P</th>
                        <th className="py-3.5 text-center w-12">W</th>
                        <th className="py-3.5 text-center w-12">D</th>
                        <th className="py-3.5 text-center w-12">L</th>
                        <th className="py-3.5 text-center w-12">GF</th>
                        <th className="py-3.5 text-center w-12">GA</th>
                        <th className="py-3.5 text-center w-12">GD</th>
                        <th className="py-3.5 text-center pr-4 w-16 font-extrabold text-neutral-800 dark:text-emerald-400">
                          Pts
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStandings[0]?.table.map((entry) => {
                        const isQualifying = entry.position <= 2;
                        const isPotential = entry.position === 3;

                        return (
                          <tr
                            key={entry.team.id}
                            className="group border-b border-neutral-100 hover:bg-neutral-50/50 dark:border-white/5 dark:hover:bg-white/5 transition-colors"
                          >
                            <td className="py-4 text-center pl-4 font-bold relative">
                              {/* Position Left Border Indicator */}
                              {isQualifying && (
                                <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-emerald-500 rounded-r" />
                              )}
                              {isPotential && (
                                <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-amber-500 rounded-r" />
                              )}
                              <span
                                className={`inline-flex items-center justify-center size-6 rounded-full text-xs ${
                                  isQualifying
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400"
                                    : isPotential
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400"
                                      : "bg-neutral-100 text-neutral-600 dark:bg-white/5 dark:text-neutral-400"
                                }`}
                              >
                                {entry.position}
                              </span>
                            </td>
                            <td className="py-4">
                              <Link
                                href={`/teams/${entry.team.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                                className="inline-flex items-center gap-3 font-bold text-neutral-800 dark:text-neutral-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                              >
                                <div className="size-6 shrink-0 overflow-hidden rounded-md border border-neutral-100 bg-neutral-50 dark:border-white/10 dark:bg-neutral-900">
                                  <FlagIcon
                                    country={entry.team.name}
                                    className="h-full w-full object-cover scale-110"
                                  />
                                </div>
                                <span>{entry.team.name}</span>
                              </Link>
                            </td>
                            <td className="py-4 text-center font-medium text-neutral-600 dark:text-neutral-400">
                              {entry.playedGames}
                            </td>
                            <td className="py-4 text-center text-neutral-600 dark:text-neutral-400">
                              {entry.won}
                            </td>
                            <td className="py-4 text-center text-neutral-600 dark:text-neutral-400">
                              {entry.draw}
                            </td>
                            <td className="py-4 text-center text-neutral-600 dark:text-neutral-400">
                              {entry.lost}
                            </td>
                            <td className="py-4 text-center text-neutral-600 dark:text-neutral-400">
                              {entry.goalsFor}
                            </td>
                            <td className="py-4 text-center text-neutral-600 dark:text-neutral-400">
                              {entry.goalsAgainst}
                            </td>
                            <td
                              className={`py-4 text-center font-semibold ${
                                entry.goalDifference > 0
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : entry.goalDifference < 0
                                    ? "text-red-500"
                                    : "text-neutral-500"
                              }`}
                            >
                              {entry.goalDifference > 0 ? "+" : ""}
                              {entry.goalDifference}
                            </td>
                            <td className="py-4 text-center pr-4 font-black text-base text-neutral-950 dark:text-white">
                              {entry.points}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Qualification Key Legend */}
                <div className="flex flex-wrap gap-4 border-t border-neutral-100 bg-neutral-50/50 p-4 text-xs text-neutral-500 dark:border-white/5 dark:bg-neutral-950/35">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span>Top 2: Qualified (Round of 32)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span>3rd Place: Potential Qualification</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionReveal>

          {/* Group Fixtures */}
          <MotionReveal className="grid gap-4">
            <h3 className="font-heading text-xl font-black text-neutral-950 dark:text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-emerald-600" /> Group Fixtures
            </h3>
            {isLoadingMatches ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
              </div>
            ) : groupMatches.length === 0 ? (
              <Card className="border-dashed py-8">
                <CardContent className="text-center text-neutral-500 dark:text-neutral-400">
                  No fixtures scheduled for this group.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 max-h-[520px] overflow-y-auto pr-1">
                {groupMatches.map((match) => {
                  const hasScore =
                    match.score.home !== null && match.score.away !== null;
                  const isFinished = match.status === "finished";
                  const isLive = match.status === "live";

                  return (
                    <Link
                      key={match.id}
                      href={`/matches/${match.id}`}
                      className="group/match block border border-neutral-200/80 bg-white/95 rounded-xl p-4 shadow-sm hover:border-emerald-300 dark:border-white/10 dark:bg-neutral-950/80 dark:hover:border-emerald-500/50 transition duration-300"
                    >
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                          {match.matchNumber
                            ? `Match ${match.matchNumber}`
                            : ""}
                        </span>
                        <span
                          className={`inline-flex rounded px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
                            isFinished
                              ? "bg-neutral-100 text-neutral-700 dark:bg-white/5 dark:text-neutral-400"
                              : isLive
                                ? "bg-red-100 text-red-700 animate-pulse dark:bg-red-500/10 dark:text-red-400"
                                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          }`}
                        >
                          {match.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                        {/* Home Team */}
                        <div className="flex items-center justify-end gap-2.5 min-w-0">
                          <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 truncate group-hover/match:text-emerald-600 dark:group-hover/match:text-emerald-400 transition">
                            {match.homeTeam.name}
                          </span>
                          <div className="size-5 shrink-0 overflow-hidden rounded-md border border-neutral-100 bg-neutral-50 dark:border-white/10 dark:bg-neutral-900">
                            <FlagIcon
                              country={match.homeTeam.name}
                              className="h-full w-full object-cover scale-110"
                            />
                          </div>
                        </div>

                        {/* Score/VS Box */}
                        <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 py-1 font-heading text-xs font-black min-w-14 text-center group-hover/match:border-emerald-300 dark:border-white/5 dark:bg-neutral-950 dark:group-hover/match:border-emerald-500/30 transition duration-300">
                          {hasScore ? (
                            <span className="text-sm tracking-widest text-neutral-900 dark:text-white">
                              {match.score.home}-{match.score.away}
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-400">
                              VS
                            </span>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center justify-start gap-2.5 min-w-0">
                          <div className="size-5 shrink-0 overflow-hidden rounded-md border border-neutral-100 bg-neutral-50 dark:border-white/10 dark:bg-neutral-900">
                            <FlagIcon
                              country={match.awayTeam.name}
                              className="h-full w-full object-cover scale-110"
                            />
                          </div>
                          <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 truncate group-hover/match:text-emerald-600 dark:group-hover/match:text-emerald-400 transition">
                            {match.awayTeam.name}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3.5 border-t border-neutral-100 dark:border-white/5 pt-2 flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500">
                        <span>
                          <FormattedDateTime date={match.date} />
                        </span>
                        <span>{match.city || "Venue TBD"}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </MotionReveal>
        </div>
      )}
    </div>
  );
}
