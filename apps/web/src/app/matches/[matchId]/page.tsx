import { MatchDetailsPage } from "@/features/matches/MatchDetailsPage";
import { createPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ matchId: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { matchId } = await params;

  return createPageMetadata({
    title: `FIFA World Cup 2026 Match ${matchId} Details, Score & Venue`,
    description:
      "View FIFA World Cup 2026 match details including teams, kickoff time, venue, score, status, and goals.",
    path: `/matches/${matchId}`,
  });
}

export default async function Page({ params }: PageProps) {
  const { matchId } = await params;

  return <MatchDetailsPage matchId={matchId} />;
}
