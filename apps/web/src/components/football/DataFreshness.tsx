import { getSnapshot } from "@/lib/api/football";
export async function DataFreshness({
  competition,
  season,
}: {
  competition?: string;
  season?: string;
}) {
  const data = await getSnapshot(competition, season);
  const entries = Object.entries(data.availability);
  const stale = entries.some(([, a]) => a.state === "stale");
  const unavailable = entries.some(([, a]) => a.state === "unavailable");
  const updates = (
    <ul className="grid gap-2 text-xs text-muted-foreground dark:text-muted-foreground">
      {entries.map(([id, a]) => (
        <li
          key={id}
          className={
            a.state === "stale"
              ? "text-amber-600 dark:text-amber-400"
              : undefined
          }
        >
          <strong>
            {data.competitions.find((c) => c.id === id)?.shortName ?? id}:
          </strong>{" "}
          {a.state === "stale" ? "Saved fixtures may be out of date. " : ""}
          {a.state === "unavailable"
            ? "Fixtures are currently unavailable. "
            : ""}
          {a.fetchedAt ? (
            <>
              Last refreshed{" "}
              <time dateTime={a.fetchedAt}>
                {new Intl.DateTimeFormat("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Asia/Kolkata",
                }).format(new Date(a.fetchedAt))}{" "}
                IST
              </time>
              .
            </>
          ) : (
            "The last refresh time wasn't recorded."
          )}
        </li>
      ))}
    </ul>
  );
  if (competition)
    return (
      <div className="data-freshness" role="status">
        {updates}
      </div>
    );
  return (
    <details className="data-freshness">
      <summary
        className={`cursor-pointer font-semibold ${stale || unavailable ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground dark:text-muted-foreground"}`}
      >
        {unavailable
          ? "Some fixture data is unavailable"
          : stale
            ? "Some fixture data needs refreshing"
            : "Fixture update details"}
      </summary>
      <div className="mt-3">{updates}</div>
    </details>
  );
}
