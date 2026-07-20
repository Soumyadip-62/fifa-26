import { TeamsPage } from "@/features/teams/TeamsPage";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "FIFA World Cup 2026 Teams, Groups & Squads",
  description:
    "Explore FIFA World Cup 2026 teams, groups, profiles, badges, flags, squads, and tournament details.",
  path: "/teams",
});

export default function Page() {
  return <TeamsPage />;
}
