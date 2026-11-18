import Image from "next/image";
import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { SectionHeader } from "@/components/common/SectionHeader";
import { getFootballData } from "@/lib/api/football";
export default async function Page() {
  const { stadiums, teams } = await getFootballData();
  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Ground guide"
        title="Stadiums"
        description="Venues, capacities, home teams and match schedules."
      />
      <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-4">
        {stadiums.map((stadium) => (
          <Link
            href={`/stadiums/${stadium.id}`}
            key={stadium.id}
            className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:bg-card dark:bg-card dark:hover:bg-card"
          >
            <div className="relative aspect-[16/10]">
              <Image
                src={stadium.imageUrl}
                alt={`${stadium.name} stadium`}
                fill
                sizes="(min-width:1280px) 25vw,(min-width:640px) 50vw,100vw"
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h2 className="font-heading text-base font-black">
                {stadium.name}
              </h2>
              <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                {[stadium.city, stadium.country].filter(Boolean).join(", ") ||
                  "Location unavailable"}
              </p>
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="size-3" />
                {stadium.capacity?.toLocaleString() ?? "Unavailable"} ·{" "}
                {teams.find((team) => team.id === stadium.homeTeamId)?.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
