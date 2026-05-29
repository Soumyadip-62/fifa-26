import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { SectionHeader } from "@/components/common/SectionHeader";
import { HistoryTimeline } from "@/components/history/HistoryTimeline";
import { getTournamentHistory } from "@/lib/api/history";

export async function HistoryPage() {
  try {
    const historyItems = await getTournamentHistory();

    return (
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="History"
          title="Tournament history"
          description="Previous hosts, winners, finalists, and summaries from typed mock data."
        />
        {historyItems.length ? (
          <HistoryTimeline historyItems={historyItems} />
        ) : (
          <EmptyState title="No history found" description="Historical tournament records will appear here." />
        )}
      </div>
    );
  } catch {
    return (
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="History" title="Tournament history" />
        <ErrorState message="Failed to load tournament history." />
      </div>
    );
  }
}
