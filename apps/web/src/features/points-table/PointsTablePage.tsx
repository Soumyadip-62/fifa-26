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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { getStandings, type StandingsTableEntry } from "@/lib/api/standings";
import { getMatches } from "@/lib/api/matches";
import { FormattedDateTime } from "@/components/common/FormattedDateTime";

function getQualificationBadge(entry: StandingsTableEntry) {
  const latestStage = entry.qualification?.latestStage;

  if (latestStage) {
    const stageLabel = latestStage
      .replace("ROUND_OF_", "R")
      .replaceAll("_", " ");

    return {
      label: `Qualified ${stageLabel}`,
      className:
        "border-emerald-500/20 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300",
    };
  }

  if (entry.playedGames >= 3) {
    return {
      label: "Eliminated",
      className:
        "border-red-500/20 bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300",
    };
  }

  if (entry.position === 3) {
    return {
      label: "Can qualify",
      className:
        "border-amber-500/20 bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
    };
  }

  return {
    label: "In contention",
    className:
      "border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-white/10 dark:bg-zinc-800/40 dark:text-zinc-300",
  };
}

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
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          eyebrow="Tournament Standings"
          title="Points Table"
          description="Real-time group stage standings and qualifications."
        />
        <Link
          href="/matches/knockout-matches"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-white dark:text-zinc-950 shadow-sm hover:opacity-90 transition-all"
        >
          <Sparkles className="h-4 w-4" /> Knockout Stage
        </Link>
      </div>

      {/* Filters & Search */}
      <MotionReveal>
        <div className="flex flex-col gap-4 rounded-[28px] border border-black/5 bg-zinc-200/25 p-4 shadow-sm dark:border-white/5 dark:bg-zinc-900/10 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Quick Tabs - iOS Segmented Control style */}
          <div className="flex flex-wrap gap-1 bg-zinc-200/50 dark:bg-zinc-800/40 p-2 rounded-[20px] sm:rounded-full border border-black/5 dark:border-white/5 max-w-full overflow-x-auto">
            <Button
              variant="ghost"
              onClick={() => handleGroupSelect("All")}
              className={`h-8.5 px-4 rounded-full text-xs font-bold transition-all ${
                selectedGroup === "All"
                  ? "bg-white text-black shadow-sm dark:bg-zinc-700 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Grid className="mr-1.5 h-3.5 w-3.5" /> All Groups
            </Button>
            {groupsList.map((g) => (
              <Button
                key={g}
                variant="ghost"
                onClick={() => handleGroupSelect(g)}
                className={`h-8.5 px-4 rounded-full text-xs font-bold transition-all ${
                  selectedGroup === g
                    ? "bg-white text-black shadow-sm dark:bg-zinc-700 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                {g.replace("Group ", "")}
              </Button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <Input
              placeholder="Search team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 h-9 rounded-full bg-white/90 dark:bg-zinc-900/60 border-black/5 dark:border-white/5 text-xs font-semibold"
            />
          </div>
        </div>
      </MotionReveal>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
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
              <Card className="overflow-hidden border border-black/5 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md rounded-[28px] shadow-sm hover:scale-[1.01] transition-all">
                <div className="flex items-center justify-between border-b border-black/5 bg-zinc-100/50 px-4 py-3 dark:border-white/5 dark:bg-zinc-800/10">
                  <h3 className="font-heading text-xs font-black tracking-normal text-zinc-900 dark:text-zinc-300">
                    {groupData.group}
                  </h3>
                  <button
                    onClick={() => handleGroupSelect(groupData.group)}
                    className="inline-flex items-center text-[10px] font-bold text-zinc-500 hover:text-primary transition"
                  >
                    Details <ArrowRight className="ml-1 h-3 w-3" />
                  </button>
                </div>
                <CardContent className="p-0">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-black/5 bg-zinc-100/30 font-bold text-zinc-400 dark:border-white/5 dark:bg-zinc-800/5">
                        <th className="py-2 pl-4 w-10 text-center">Pos</th>
                        <th className="py-2">Team</th>
                        <th className="py-2 text-center w-10">P</th>
                        <th className="py-2 text-center w-10">GD</th>
                        <th className="py-2 text-center pr-4 w-12 font-bold text-zinc-800 dark:text-primary">
                          Pts
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {groupData.table.map((entry) => {
                        const isQualifying = entry.position <= 2;
                        const isPotential = entry.position === 3;
                        const qualificationBadge = getQualificationBadge(entry);

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
                            <td className="py-3 inline-flex items-center gap-1">
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
                              <Badge
                                variant="outline"
                                className={`mt-1 max-w-[150px] truncate px-2 py-0 text-[9px] ${qualificationBadge.className}`}
                              >
                                {qualificationBadge.label}
                              </Badge>
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
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Detailed Table */}
          <MotionReveal className="grid gap-4">
            <h3 className="font-heading text-base font-black text-zinc-950 dark:text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" /> Standings Table
            </h3>
            <Card className="overflow-hidden border border-black/5 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md rounded-[28px] shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[550px]">
                    <thead>
                      <tr className="border-b border-black/5 bg-zinc-100/50 font-bold text-zinc-400 dark:border-white/5 dark:bg-zinc-800/10">
                        <th className="py-3 pl-4 w-12 text-center">Pos</th>
                        <th className="py-3">Team</th>
                        <th className="py-3 text-center w-10">P</th>
                        <th className="py-3 text-center w-10">W</th>
                        <th className="py-3 text-center w-10">D</th>
                        <th className="py-3 text-center w-10">L</th>
                        <th className="py-3 text-center w-10">GF</th>
                        <th className="py-3 text-center w-10">GA</th>
                        <th className="py-3 text-center w-10">GD</th>
                        <th className="py-3 text-center pr-4 w-14 font-extrabold text-zinc-800 dark:text-primary">
                          Pts
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStandings[0]?.table.map((entry) => {
                        const isQualifying = entry.position <= 2;
                        const isPotential = entry.position === 3;
                        const qualificationBadge = getQualificationBadge(entry);

                        return (
                          <tr
                            key={entry.team.id}
                            className="group border-b border-black/5 last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors"
                          >
                            <td className="py-3.5 text-center pl-4 font-bold relative">
                              {/* Position Left Border Indicator */}
                              {isQualifying && (
                                <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-emerald-500 rounded-r" />
                              )}
                              {isPotential && (
                                <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-amber-500 rounded-r" />
                              )}
                              <span
                                className={`inline-flex items-center justify-center size-5.5 rounded-full text-[10px] ${
                                  isQualifying
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                    : isPotential
                                      ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                                      : "bg-zinc-100 text-zinc-650 dark:bg-zinc-800/40 dark:text-zinc-400"
                                }`}
                              >
                                {entry.position}
                              </span>
                            </td>
                            <td className="py-3.5">
                              <Link
                                href={`/teams/${entry.team.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                                className="inline-flex items-center gap-2.5 font-bold text-zinc-900 dark:text-zinc-100 hover:text-primary transition"
                              >
                                <div className="size-5.5 shrink-0 overflow-hidden rounded-md border border-black/5 bg-zinc-100 dark:border-white/10 dark:bg-zinc-800/20">
                                  <FlagIcon
                                    country={entry.team.name}
                                    className="h-full w-full object-cover scale-110"
                                  />
                                </div>
                                <span>{entry.team.name}</span>
                              </Link>
                              <Badge
                                variant="outline"
                                className={`mt-1 px-2 py-0 text-[9px] ${qualificationBadge.className}`}
                              >
                                {qualificationBadge.label}
                              </Badge>
                            </td>
                            <td className="py-3.5 text-center font-semibold text-zinc-550 dark:text-zinc-400">
                              {entry.playedGames}
                            </td>
                            <td className="py-3.5 text-center text-zinc-550 dark:text-zinc-400">
                              {entry.won}
                            </td>
                            <td className="py-3.5 text-center text-zinc-550 dark:text-zinc-400">
                              {entry.draw}
                            </td>
                            <td className="py-3.5 text-center text-zinc-550 dark:text-zinc-400">
                              {entry.lost}
                            </td>
                            <td className="py-3.5 text-center text-zinc-550 dark:text-zinc-400">
                              {entry.goalsFor}
                            </td>
                            <td className="py-3.5 text-center text-zinc-550 dark:text-zinc-400">
                              {entry.goalsAgainst}
                            </td>
                            <td
                              className={`py-3.5 text-center font-bold ${
                                entry.goalDifference > 0
                                  ? "text-emerald-500"
                                  : entry.goalDifference < 0
                                    ? "text-red-500"
                                    : "text-zinc-400"
                              }`}
                            >
                              {entry.goalDifference > 0 ? "+" : ""}
                              {entry.goalDifference}
                            </td>
                            <td className="py-3.5 text-center pr-4 font-black text-sm text-zinc-950 dark:text-white">
                              {entry.points}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Qualification Key Legend */}
                <div className="flex flex-wrap gap-4 border-t border-black/5 bg-zinc-100/50 p-4 text-[10px] text-zinc-450 dark:border-white/5 dark:bg-zinc-800/10">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                      Qualified: DB confirmed
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                      Can qualify: still alive
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionReveal>

          {/* Group Fixtures */}
          <MotionReveal className="grid gap-4">
            <h3 className="font-heading text-base font-black text-zinc-950 dark:text-white flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" /> Group Fixtures
            </h3>
            {isLoadingMatches ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : groupMatches.length === 0 ? (
              <Card className="border-dashed py-8 rounded-[24px]">
                <CardContent className="text-center text-zinc-500 dark:text-zinc-400">
                  No fixtures scheduled for this group.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-1">
                {groupMatches.map((match) => {
                  const hasScore =
                    match.score.home !== null && match.score.away !== null;
                  const isFinished = match.status === "finished";
                  const isLive = match.status === "live";

                  return (
                    <Link
                      key={match.id}
                      href={`/matches/${match.id}`}
                      className="group/match block border border-black/5 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md rounded-[24px] p-4 shadow-sm hover:scale-[1.01] transition duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
                          {match.matchNumber
                            ? `Match ${match.matchNumber}`
                            : ""}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                            isFinished
                              ? "bg-zinc-100 text-zinc-650 dark:bg-zinc-800/40 dark:text-zinc-400"
                              : isLive
                                ? "bg-red-100 text-red-700 animate-pulse dark:bg-red-500/10 dark:text-red-450"
                                : "bg-primary/10 text-primary"
                          }`}
                        >
                          {match.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                        {/* Home Team */}
                        <div className="flex items-center justify-end gap-2.5 min-w-0">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover/match:text-primary transition">
                            {match.homeTeam.name}
                          </span>
                          <div className="size-5 shrink-0 overflow-hidden rounded-md border border-black/5 bg-zinc-100 dark:border-white/10 dark:bg-zinc-800/20">
                            <FlagIcon
                              country={match.homeTeam.name}
                              className="h-full w-full object-cover scale-110"
                            />
                          </div>
                        </div>

                        {/* Score/VS Box */}
                        <div className="rounded-full bg-zinc-150/80 dark:bg-zinc-800/40 px-3 py-0.5 font-heading text-xs font-black min-w-12 text-center group-hover/match:scale-105 transition duration-300 border border-black/5 dark:border-white/5">
                          {hasScore ? (
                            <span className="text-xs font-black tracking-widest text-zinc-900 dark:text-white">
                              {match.score.home}-{match.score.away}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500">
                              VS
                            </span>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center justify-start gap-2.5 min-w-0">
                          <div className="size-5 shrink-0 overflow-hidden rounded-md border border-black/5 bg-zinc-100 dark:border-white/10 dark:bg-zinc-800/20">
                            <FlagIcon
                              country={match.awayTeam.name}
                              className="h-full w-full object-cover scale-110"
                            />
                          </div>
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover/match:text-primary transition">
                            {match.awayTeam.name}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 border-t border-black/5 dark:border-white/5 pt-2 flex items-center justify-between text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
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
