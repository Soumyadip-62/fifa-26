"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
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
    <div className="page-shell">
      <SectionHeader
        eyebrow="History"
        title="Tournament history"
        description="Previous hosts, winners, finalists, and summaries from official data."
      />
      {isError ? (
        <ErrorState message="Failed to load tournament history." />
      ) : isLoading ? (
        <LoadingState label="Loading tournament history..." />
      ) : historyItems.length ? (
        <HistoryTimeline historyItems={historyItems} />
      ) : (
        <EmptyState
          title="No history found"
          description="Historical tournament records will appear here."
        />
      )}
    </div>
  );
}
