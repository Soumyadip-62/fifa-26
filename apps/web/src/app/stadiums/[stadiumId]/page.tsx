import Image from "next/image";
import Link from "next/link";
import { FixtureErrors } from "@/components/football/FixtureErrors";
import { EmptyState } from "@/components/common/EmptyState";
import { PlatformMatchCard } from "@/components/football/PlatformMatchCard";
import { TeamMark } from "@/components/football/TeamMark";
import { getPlatformStadium } from "@/lib/api/football";
type Props = { params: Promise<{ stadiumId: string }> };
export default async function Page({ params }: Props) {
  const { stadiumId } = await params;
  const data = await getPlatformStadium(stadiumId);
  if (!data)
    return (
      <div className="page-shell">
        <EmptyState
          title="Stadium not found"
          description="This venue is not in the imported venue catalog."
        />
      </div>
    );
  const resolved = data.matches;
  return (
    <div className="page-shell">
      <FixtureErrors errors={data.fixtureErrors} />
      <section className="venue-hero relative overflow-hidden rounded-lg border border-border bg-background text-foreground">
        <Image
          src={data.stadium.imageUrl}
          alt={`${data.stadium.name} stadium`}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-8 sm:p-12">
          <p className="text-[10px] font-black uppercase text-primary">
            {[data.stadium.city, data.stadium.country]
              .filter(Boolean)
              .join(", ") || "Location unavailable"}
          </p>
          <h1 className="font-heading text-3xl font-black sm:text-5xl">
            {data.stadium.name}
          </h1>
          <p className="mt-3 text-sm text-secondary-foreground">
            Capacity {data.stadium.capacity?.toLocaleString() ?? "Unavailable"}
          </p>
        </div>
      </section>
      {data.team ? (
        <section className="grid gap-5">
          <h2 className="font-heading text-xl font-black">Home team</h2>
          <Link
            href={`/teams/${data.team.id}`}
            className="inline-flex w-fit rounded-lg border border-border bg-card p-5 dark:bg-card"
          >
            <TeamMark team={data.team} />
          </Link>
        </section>
      ) : null}
      <section className="grid gap-6">
        <h2 className="font-heading text-xl font-black">
          Matches at this venue
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {resolved.map((item) => (
            <PlatformMatchCard key={item.match.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
