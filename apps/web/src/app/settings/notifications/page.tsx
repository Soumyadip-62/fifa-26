import { NotificationSettingsPage } from "@/features/settings/NotificationSettingsPage";
import { getFootballData } from "@/lib/api/football";
export default async function Page() { const { teams } = await getFootballData(); return <NotificationSettingsPage teams={teams} />; }
