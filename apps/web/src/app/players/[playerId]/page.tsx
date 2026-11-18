import { PlayerProfilePage } from "@/features/players/PlayerProfilePage";
type Props = { params: Promise<{ playerId: string }> };
export default async function Page({ params }: Props) { const { playerId } = await params; return <PlayerProfilePage playerId={playerId} />; }
