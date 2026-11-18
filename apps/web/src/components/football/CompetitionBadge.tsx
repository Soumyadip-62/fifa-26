import Link from "next/link";
import { Trophy } from "lucide-react";
import type { Competition } from "@/types/football";
import { cn } from "@/lib/utils/cn";

export function CompetitionBadge({
  competition,
  linked = false,
  className,
}: {
  competition: Competition;
  linked?: boolean;
  className?: string;
}) {
  const content = (
    <>
      <Trophy className="size-3" aria-hidden="true" />
      <span>{competition.shortName}</span>
    </>
  );
  const styles = cn(
    "inline-flex w-fit max-w-full items-center gap-1.5 rounded-full bg-violet-500/15 px-2.5 py-1 text-[10px] font-semibold text-violet-200",
    className,
  );
  return linked ? (
    <Link className={styles} href={`/competitions/${competition.id}`}>
      {content}
    </Link>
  ) : (
    <span className={styles}>{content}</span>
  );
}
