import { SectionHeader } from "@/components/common/SectionHeader";
import { StatisticsExplorer } from "@/features/statistics/StatisticsExplorer";
import { getFootballData } from "@/lib/api/football";
export default async function Page() { const { players, teams, competitions } = await getFootballData(); return <div className="page-shell"><SectionHeader eyebrow="Leaderboards" title="Player statistics" description="Compare the leading performers by competition, season and team." /><StatisticsExplorer players={players} teams={teams} competitions={competitions} /></div>; }
