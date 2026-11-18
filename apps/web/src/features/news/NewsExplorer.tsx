"use client";
import { NewsImage } from "@/components/news/NewsImage";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CompetitionBadge } from "@/components/football/CompetitionBadge";
import { Input } from "@/components/ui/input";
import type { Competition, FootballNews, FootballTeam } from "@/types/football";

export function NewsExplorer({
  articles,
  competitions,
  teams,
}: {
  articles: FootballNews[];
  competitions: Competition[];
  teams: FootballTeam[];
}) {
  const [competition, setCompetition] = useState("all");
  const [team, setTeam] = useState("all");
  const [query, setQuery] = useState("");
  const selectableTeams = teams.filter((item) =>
    articles.some((article) => article.teamId === item.id),
  );
  const filtered = useMemo(
    () =>
      articles.filter(
        (article) =>
          (competition === "all" || article.competitionId === competition) &&
          (team === "all" || article.teamId === team) &&
          (!query ||
            `${article.title} ${article.excerpt} ${article.category}`
              .toLowerCase()
              .includes(query.toLowerCase())),
      ),
    [articles, competition, team, query],
  );
  const featured = filtered[0];
  const rest = filtered.slice(1);
  return (
    <div className="grid gap-5">
      <div
        className={`filter-bar filter-bar-grid ${selectableTeams.length ? "lg:grid-cols-[minmax(0,1fr)_220px_220px]" : "sm:grid-cols-[minmax(0,1fr)_240px]"}`}
      >
        <label className="relative">
          <Search className="absolute left-4 top-4 size-4 text-muted-foreground" />
          <Input
            aria-label="Search stories"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search stories"
            className="h-12 rounded-lg pl-11"
          />
        </label>
        <select
          aria-label="News competition"
          value={competition}
          onChange={(event) => setCompetition(event.target.value)}
          className="h-12 rounded-lg border border-border bg-card px-4 text-xs font-semibold dark:border-border dark:bg-card"
        >
          <option value="all">All competitions</option>
          {competitions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.shortName}
            </option>
          ))}
        </select>
        {selectableTeams.length ? (
          <select
            aria-label="News team"
            value={team}
            onChange={(event) => setTeam(event.target.value)}
            className="h-12 rounded-lg border border-border bg-card px-4 text-xs font-semibold dark:border-border dark:bg-card"
          >
            <option value="all">All teams</option>
            {selectableTeams.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        ) : null}
      </div>
      {featured ? (
        <a
          href={featured.sourceUrl ?? `/news/${featured.slug}`}
          target={featured.sourceUrl ? "_blank" : undefined}
          rel={featured.sourceUrl ? "noopener noreferrer" : undefined}
          className="news-featured group relative overflow-hidden rounded-lg bg-background text-foreground"
        >
          <NewsImage
            src={featured.imageUrl}
            priority
            sizes="100vw"
            className="object-cover opacity-65 transition group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 grid max-w-2xl gap-3 p-6 sm:p-8">
            <CompetitionBadge
              competition={
                competitions.find((item) => item.id === featured.competitionId)!
              }
              className="bg-white/15 text-white"
            />
            <h2 className="font-heading text-2xl font-black sm:text-3xl">
              {featured.title}
            </h2>
            <p className="text-sm text-secondary-foreground">
              {featured.excerpt}
            </p>
            {featured.sourceName ? (
              <p className="text-xs text-secondary-foreground">
                {featured.sourceName} · Read at source ↗
              </p>
            ) : null}
          </div>
        </a>
      ) : (
        <p className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No stories match these filters.
        </p>
      )}
      <div className="news-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rest.map((article) => (
          <a
            key={article.id}
            href={article.sourceUrl ?? `/news/${article.slug}`}
            target={article.sourceUrl ? "_blank" : undefined}
            rel={article.sourceUrl ? "noopener noreferrer" : undefined}
            className="news-card overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/30"
          >
            <div className="relative aspect-[16/9]">
              <NewsImage
                src={article.imageUrl}
                sizes="(min-width:1024px) 33vw,100vw"
                className="object-cover"
              />
            </div>
            <div className="grid gap-3 p-6">
              <CompetitionBadge
                competition={
                  competitions.find(
                    (item) => item.id === article.competitionId,
                  )!
                }
              />
              <h2 className="font-heading text-base font-black">
                {article.title}
              </h2>
              <p className="text-xs leading-5 text-muted-foreground">
                {article.excerpt}
              </p>
              <span className="text-[9px] font-bold uppercase text-muted-foreground">
                {article.sourceName ?? article.category} ·{" "}
                {new Intl.DateTimeFormat("en", {
                  dateStyle: "medium",
                  timeZone: "Asia/Kolkata",
                }).format(new Date(article.publishedAt))}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
