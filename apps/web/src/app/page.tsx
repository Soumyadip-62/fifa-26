import { HomePage } from "@/features/home/HomePage";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "NinetyPlus - Live Scores, Fixtures and Stats",
  description:
    "Follow the Champions League, Premier League, La Liga and Bundesliga in one football dashboard.",
  path: "/",
});

export default function Home() {
  return <HomePage />;
}
