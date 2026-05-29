import { MatchDetailsPage } from "@/features/matches/MatchDetailsPage";

type PageProps = {
  params: Promise<{ matchId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { matchId } = await params;

  return <MatchDetailsPage matchId={matchId} />;
}
