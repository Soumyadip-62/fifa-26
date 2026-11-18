import { TeamsPage } from "@/features/teams/TeamsPage";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Football Clubs, Teams & Squads",
  description:
    "Explore football clubs, team profiles, squads and fixtures across four major club competitions.",
  path: "/teams",
});

export default function Page() {
  return <TeamsPage />;
}
