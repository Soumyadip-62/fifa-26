import { getFootballData } from "@/lib/api/football";
import { PlayersPage } from "@/features/players/PlayersPage";
export default async function Page() { const { players, teams } = await getFootballData(); return <PlayersPage players={players} teams={teams} />; }
