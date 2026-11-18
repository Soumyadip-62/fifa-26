import { MatchesPage } from "@/features/matches/MatchesPage";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Football Matches, Live Scores and Results",
  description:
    "Browse fixtures, live scores and results across four major club football competitions.",
  path: "/matches",
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    competition?: string | string[];
    status?: string | string[];
  }>;
}) {
  const { competition, status } = await searchParams;
  return (
    <MatchesPage
      initialCompetition={typeof competition === "string" ? competition : "all"}
      initialStatus={typeof status === "string" ? status : "all"}
    />
  );
}
