import type { MatchDetails, MatchScorePair } from "@/types/football";

export function availabilityLabel(
  details: Pick<MatchDetails, "availability">,
  key: string,
) {
  const state = details.availability?.[key]?.state;
  return state === "pending"
    ? "Pending"
    : state === "not_applicable"
      ? "Not applicable"
      : "Not available";
}
export function scoreLabel(score: MatchScorePair) {
  return `${score.home ?? "—"} – ${score.away ?? "—"}`;
}
export function winnerLabel(details: MatchDetails) {
  if (!["finished", "awarded"].includes(details.match.status)) return null;
  const winner = details.score?.winner;
  return winner === "HOME_TEAM"
    ? details.homeTeam.name
    : winner === "AWAY_TEAM"
      ? details.awayTeam.name
      : winner === "DRAW"
        ? "Draw"
        : null;
}
export function durationLabel(duration?: string | null) {
  if (!duration) return null;
  return (
    (
      {
        REGULAR: "Regular time",
        EXTRA_TIME: "Extra time",
        PENALTY_SHOOTOUT: "Penalty shoot-out",
      } as Record<string, string>
    )[duration] ??
    duration
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/^./, (letter) => letter.toUpperCase())
  );
}
