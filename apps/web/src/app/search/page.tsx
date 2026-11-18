import { SearchPage } from "@/features/search/SearchPage";
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
      <SearchPage
        {...data}
        competitions={fixtures.competitions}
        matches={fixtures.items}
      />
    </>
  );
}
