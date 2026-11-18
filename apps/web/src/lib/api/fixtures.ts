import "server-only";
import { cache } from "react";
import type { ResolvedMatch } from "@/components/football/PlatformMatchCard";
import { getSnapshot, resolveFixtures } from "./football";
export const getFixtureData = cache(async () => {
  const data = await getSnapshot();
  return {
    items: resolveFixtures(data),
    competitions: data.competitions,
    errors: data.errors,
  };
});
export function fixturesForTeam(items: ResolvedMatch[], team: { id: string }) {
  return items.filter(
    (r) => r.match.homeTeamId === team.id || r.match.awayTeamId === team.id,
  );
}
