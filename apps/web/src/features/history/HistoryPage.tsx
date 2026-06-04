"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { SectionHeader } from "@/components/common/SectionHeader";
import { HistoryTimeline } from "@/components/history/HistoryTimeline";
import { getTournamentHistory } from "@/lib/api/history";
import { useQuery } from "@tanstack/react-query";

export function HistoryPage() {
  const {
    data: historyItems = [],
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["history"],
    queryFn: getTournamentHistory,
  });

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <SectionHeader
        eyebrow="History"
        title="Tournament history"
        description="Previous hosts, winners, finalists, and summaries from official data."
      />
      {isError ? (
        <ErrorState message="Failed to load tournament history." />
      ) : isLoading ? (
        <EmptyState title="Loading history" description="Fetching historical tournament records." />
      ) : historyItems.length ? (
        <HistoryTimeline historyItems={historyItems} />
      ) : (
        <EmptyState title="No history found" description="Historical tournament records will appear here." />
      )}
    </div>
  );
}
