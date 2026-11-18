import { TeamDetailsPage } from "@/features/teams/TeamDetailsPage";
import { createPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{
    group?: string;
    competition?: string;
    season?: string;
  }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { teamId } = await params;
  const teamName = decodeURIComponent(teamId).replace(/[-_]+/g, " ");

  return createPageMetadata({
    title: `${teamName} Football Club Profile`,
    description: `View ${teamName} club details, squad, fixtures, badge and competition information.`,
    path: `/teams/${teamId}`,
  });
}

export default async function Page({ params, searchParams }: PageProps) {
  const { teamId } = await params;
  const { group, competition, season } = await searchParams;

  return (
    <TeamDetailsPage
      teamId={teamId}
      group={group}
      competition={competition}
      season={season}
    />
  );
}
