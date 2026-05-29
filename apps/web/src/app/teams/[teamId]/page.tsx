import { TeamDetailsPage } from "@/features/teams/TeamDetailsPage";

type PageProps = {
  params: Promise<{ teamId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { teamId } = await params;

  return <TeamDetailsPage teamId={teamId} />;
}
