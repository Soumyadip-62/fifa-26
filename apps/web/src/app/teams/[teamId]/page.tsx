import { TeamDetailsPage } from "@/features/teams/TeamDetailsPage";
import { createPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ group?: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { teamId } = await params;
  const teamName = decodeURIComponent(teamId).replace(/[-_]+/g, " ");

  return createPageMetadata({
    title: `${teamName} FIFA World Cup 2026 Team Profile`,
    description:
      `View ${teamName} team details for FIFA World Cup 2026, including group, squad, fixtures, badge, and country information.`,
    path: `/teams/${teamId}`,
  });
}

export default async function Page({ params, searchParams }: PageProps) {
  const { teamId } = await params;
  const { group } = await searchParams;

  return <TeamDetailsPage teamId={teamId} group={group} />;
}
