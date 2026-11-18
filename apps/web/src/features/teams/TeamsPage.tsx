import { SectionHeader } from "@/components/common/SectionHeader";
import { getFootballData } from "@/lib/api/football";
import { TeamDirectory } from "./TeamDirectory";

export async function TeamsPage() { const { teams, competitions } = await getFootballData(); return <div className="page-shell"><SectionHeader eyebrow="Clubs and nations" title="Teams" description="Squads, form, fixtures and performance across every competition." /><TeamDirectory teams={teams} competitions={competitions} /></div>; }
