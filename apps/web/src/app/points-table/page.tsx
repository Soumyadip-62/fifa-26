import { PointsTablePage } from "@/features/points-table/PointsTablePage";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "FIFA World Cup 2026 Points Table & Group Standings",
  description:
    "See FIFA World Cup 2026 group standings, points table, wins, draws, losses, goal difference, and qualification positions.",
  path: "/points-table",
});

export default function PointsTable() {
  return <PointsTablePage />;
};
