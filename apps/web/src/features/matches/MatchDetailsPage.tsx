import Link from "next/link";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/common/ErrorState";
import { buttonVariants } from "@/components/ui/button";
import { getPlatformMatch } from "@/lib/api/football";
import { footballDataError } from "@/lib/api/premier-league";
import { MatchCentre } from "./MatchCentre";

export async function MatchDetailsPage({ matchId }: { matchId: string }) {
  let data;
  try {
    data = await getPlatformMatch(matchId);
  } catch (error) {
    return (
      <div className="page-shell">
        <ErrorState
          title="Match details unavailable"
          message={footballDataError(error)}
        />
        <Link
          href="/matches"
          className={buttonVariants({ variant: "outline" })}
        >
          Back to matches
        </Link>
      </div>
    );
  }
  if (!data) notFound();
  return <MatchCentre {...data} />;
}
