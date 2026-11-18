import { CompetitionPage } from "@/features/competitions/CompetitionPage";
type Props = {
  params: Promise<{ competitionId: string }>;
  searchParams: Promise<{ season?: string }>;
};
export default async function Page({ params, searchParams }: Props) {
  const [{ competitionId }, { season }] = await Promise.all([
    params,
    searchParams,
  ]);
  return <CompetitionPage competitionId={competitionId} season={season} />;
}
