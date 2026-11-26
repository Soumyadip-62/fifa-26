import { NotificationSettingsPage } from "@/features/settings/NotificationSettingsPage";
import { getSnapshot } from "@/lib/api/football";

export default async function Page() {
  // Device permission settings must remain usable when football data is down.
  const teams = await getSnapshot()
    .then((data) => data.teams)
    .catch(() => []);
  return <NotificationSettingsPage teams={teams} />;
}
