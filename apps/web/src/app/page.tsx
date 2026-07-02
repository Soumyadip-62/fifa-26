import { HomePage } from "@/features/home/HomePage";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "FIFA World Cup 2026 Schedule, Scores, Teams & Bracket",
  description:
    "Track FIFA World Cup 2026 fixtures, live scores, teams, points tables, knockout brackets, news, and tournament history in one dashboard.",
  path: "/",
});

export default function Home() {
  return <HomePage />;
}
