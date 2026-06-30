import { MatchesPage } from "@/features/matches/MatchesPage";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "FIFA World Cup 2026 Match Schedule & Results",
  description:
    "Browse FIFA World Cup 2026 match fixtures, kickoff times, venues, live scores, and completed results.",
  path: "/matches",
});

export default function Page() {
  return <MatchesPage />;
}
