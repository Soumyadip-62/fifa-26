import { FavouritesPage } from "@/features/favourites/FavouritesPage";
import { getFootballData } from "@/lib/api/football";
import { getFixtureData } from "@/lib/api/fixtures";
import { FixtureErrors } from "@/components/football/FixtureErrors";
export default async function Page() {
  const [data, fixtures] = await Promise.all([
    getFootballData(),
    getFixtureData(),
  ]);
  return (
    <>
      <FixtureErrors errors={fixtures.errors} />
      <FavouritesPage
        teams={data.teams}
        players={data.players}
        competitions={fixtures.competitions}
        matches={fixtures.items}
      />
    </>
  );
}
