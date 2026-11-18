import { HomePage } from "@/features/home/HomePage";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Football Companion - Live Scores, Fixtures and Stats",
  description:
    "Follow the World Cup, Champions League, Premier League, La Liga and Bundesliga in one football dashboard.",
  path: "/",
});

export default function Home() {
  return <HomePage />;
}
