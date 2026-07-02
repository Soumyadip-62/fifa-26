import { HistoryPage } from "@/features/history/HistoryPage";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "FIFA World Cup History, Winners & Finals",
  description:
    "Explore FIFA World Cup history, past winners, final scores, iconic tournaments, and historical football records.",
  path: "/history",
});

export default function Page() {
  return <HistoryPage />;
}
