import { TeamDetailsPage } from "@/features/teams/TeamDetailsPage";

type PageProps = {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ group?: string }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { teamId } = await params;
  const { group } = await searchParams;

  return <TeamDetailsPage teamId={teamId} group={group} />;
}
