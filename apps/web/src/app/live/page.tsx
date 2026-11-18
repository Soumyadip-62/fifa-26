import { Radio } from "lucide-react";
import { PlatformMatchCard } from "@/components/football/PlatformMatchCard";
import { getFixtureData } from "@/lib/api/fixtures";
import { FixtureErrors } from "@/components/football/FixtureErrors";
export default async function Page() {
  const data = await getFixtureData();
  const live = data.items.filter((item) => item.match.status === "live");
  return (
    <div className="page-shell">
      <header>
        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-red-500">
          <Radio className="size-3" />
          Live now
        </span>
        <h1 className="mt-4 font-heading text-3xl font-black">Live football</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Latest saved scores from every competition.
        </p>
      </header>
      <FixtureErrors errors={data.errors} />
      {data.competitions.map((competition) => {
        const items = live.filter(
          (item) => item.match.competitionId === competition.id,
        );
        return (
          <section key={competition.id} className="grid gap-6">
            <h2 className="font-heading text-xl font-black">
              {competition.name}
            </h2>
            {items.length ? (
              <div className="grid gap-6 md:grid-cols-2">
                {items.map((item) => (
                  <PlatformMatchCard key={item.match.id} item={item} />
                ))}
              </div>
            ) : !data.errors[competition.id] ? (
              <p className="rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
                No saved live matches.
              </p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
