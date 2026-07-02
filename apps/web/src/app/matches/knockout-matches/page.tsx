import { QualifierMatchesPage } from "@/features/matches/QualifierMatchesPage";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "FIFA World Cup 2026 Knockout Bracket & Schedule",
  description:
    "Follow the FIFA World Cup 2026 knockout bracket from Round of 32 to the final, with qualified teams, fixtures, venues, and scores.",
  path: "/matches/knockout-matches",
});

export default function Page() {
  return <QualifierMatchesPage />;
}
