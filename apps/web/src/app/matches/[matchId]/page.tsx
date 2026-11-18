import { MatchDetailsPage } from "@/features/matches/MatchDetailsPage";
import { createPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ matchId: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { matchId } = await params;

  return createPageMetadata({
    title: `Match Centre: ${matchId}`,
    description:
      "View score, lineups, events, statistics and news in the football match centre.",
    path: `/matches/${matchId}`,
  });
}

export default async function Page({ params }: PageProps) {
  const { matchId } = await params;

  return <MatchDetailsPage matchId={matchId} />;
}
