import type { FixtureStatus } from "@/types/football";

type FixtureItem = {
  match: { id: string; kickoff: string; status: FixtureStatus };
};

export function isUpcomingFixture(match: FixtureItem["match"], now = Date.now()) {
  return match.status === "upcoming" && Date.parse(match.kickoff) >= now;
}

export function upcomingFixtures<T extends FixtureItem>(
  items: readonly T[],
  now = Date.now(),
): T[] {
  return items
    .filter((item) => isUpcomingFixture(item.match, now))
    .sort(
      (a, b) =>
        Date.parse(a.match.kickoff) - Date.parse(b.match.kickoff) ||
        a.match.id.localeCompare(b.match.id),
    );
}

// Keep current action at the top of the explorer. Completed seasons remain
// available through the same filters without preceding every current fixture.
export function orderFixtures<T extends FixtureItem>(items: readonly T[]): T[] {
  const priority = (status: FixtureStatus) =>
    status === "live"
      ? 0
      : status === "upcoming"
        ? 1
        : status === "finished"
          ? 2
          : 3;
  return [...items].sort((a, b) => {
    const group = priority(a.match.status) - priority(b.match.status);
    if (group) return group;
    const date = Date.parse(a.match.kickoff) - Date.parse(b.match.kickoff);
    return (
      (a.match.status === "finished" ? -date : date) ||
      a.match.id.localeCompare(b.match.id)
    );
  });
}
