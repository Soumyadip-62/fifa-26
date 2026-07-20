import type { Match } from "@/types/match";

function hasScorePair(
  pair: { home: number | null; away: number | null } | undefined,
): pair is { home: number; away: number } {
  return typeof pair?.home === "number" && typeof pair.away === "number";
}

function teamCode(teamName: string, shortCode?: string) {
  return (shortCode || teamName).slice(0, 3).toUpperCase();
}

export function formatMatchScore(
  match: Match,
  options: { includeTeams?: boolean; pendingLabel?: string } = {},
) {
  const { includeTeams = false, pendingLabel = "vs" } = options;
  const score = match.score;
  const fullTime = hasScorePair(score?.fullTime) ? score.fullTime : score;
  const hasPenalties = hasScorePair(score.penalties);
  const regularTime = hasScorePair(score.regularTime)
    ? score.regularTime
    : null;
  const baseScore = hasPenalties ? (regularTime ?? fullTime) : fullTime;

  if (!hasScorePair(baseScore)) {
    return pendingLabel;
  }

  const hasExtraTime =
    !hasPenalties &&
    hasScorePair(score.extraTime) &&
    ((score.extraTime?.home ?? 0) > 0 || (score.extraTime?.away ?? 0) > 0);
  const bracketScore = hasPenalties ? score.penalties : score.extraTime;
  const homeScore =
    hasPenalties || hasExtraTime
      ? `${baseScore.home} (${bracketScore?.home})`
      : `${baseScore.home}`;
  const awayScore =
    hasPenalties || hasExtraTime
      ? `${baseScore.away} (${bracketScore?.away})`
      : `${baseScore.away}`;

  if (!includeTeams) {
    return `${homeScore} - ${awayScore}`;
  }

  return `${homeScore} - ${awayScore}`;
}
