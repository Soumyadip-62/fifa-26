import { useState } from "react";
import {
  Activity,
  ArrowLeftRight,
  CircleDot,
  RectangleVertical,
} from "lucide-react";
import Image from "next/image";
import { MatchEmpty, MatchPanel } from "./MatchPanel";
import type { MatchDetails, MatchEvent } from "@/types/football";

const filters = ["All", "Goals", "Cards", "Subs"] as const;
function minute(value: string) {
  const [regular, added] = value
    .replace(/[^\d+]/g, "")
    .split("+")
    .map(Number);
  return (regular || 0) + (added || 0) / 100;
}
function EventIcon({ type }: { type: MatchEvent["type"] }) {
  if (type === "yellow" || type === "red")
    return (
      <RectangleVertical
        className={`nm-event-card ${type}`}
        aria-label={type === "red" ? "Red card" : "Yellow card"}
      />
    );
  if (type === "substitution") return <ArrowLeftRight aria-hidden="true" />;
  return <CircleDot aria-hidden="true" />;
}

export function MatchTimeline({ details }: { details: MatchDetails }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const { match, events, homeTeam, awayTeam } = details;
  const state = details.availability?.events?.state;
  const pending =
    state === "pending" || (!state && match.status === "upcoming");
  const filtered = events
    .filter(
      (event) =>
        filter === "All" ||
        (filter === "Goals"
          ? event.type === "goal"
          : filter === "Cards"
            ? ["yellow", "red"].includes(event.type)
            : event.type === "substitution"),
    )
    .sort((a, b) => minute(b.minute) - minute(a.minute));
  return (
    <MatchPanel
      title="Match timeline"
      icon={Activity}
      className="nm-timeline"
      actions={
        <div
          className="nm-event-filters"
          role="group"
          aria-label="Filter match timeline"
        >
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
            >
              {item === "Goals" ? (
                <CircleDot />
              ) : item === "Cards" ? (
                <RectangleVertical className="yellow" />
              ) : item === "Subs" ? (
                <ArrowLeftRight />
              ) : null}
              {item}
            </button>
          ))}
        </div>
      }
    >
      {match.status === "finished" ? (
        <div className="nm-period">
          <span>FT</span>
          <strong>
            {match.homeScore ?? "—"} – {match.awayScore ?? "—"}
          </strong>
          <span>Full-time</span>
        </div>
      ) : null}
      {filtered.length ? (
        <ol className="nm-events">
          {filtered.map((event) => {
            const team = [homeTeam, awayTeam].find(
              (team) => team.id === event.teamId,
            );
            const label =
              event.type === "goal"
                ? "Goal"
                : event.type === "yellow"
                  ? "Yellow card"
                  : event.type === "red"
                    ? "Red card"
                    : event.type === "substitution"
                      ? "Substitution"
                      : event.type === "var"
                        ? "VAR"
                        : "Match event";
            return (
              <li key={event.id}>
                <time>{event.minute || "—"}</time>
                <span className="nm-event-node" aria-hidden="true" />
                <span className="nm-event-symbol">
                  <EventIcon type={event.type} />
                </span>
                <div>
                  <strong>{event.label}</strong>
                  <span>
                    {label}
                    {event.detail && event.type === "substitution"
                      ? ` · ${event.detail}`
                      : ""}
                  </span>
                </div>
                {team?.logoUrl ? (
                  <Image
                    src={team.logoUrl}
                    alt={team.name}
                    width={27}
                    height={32}
                    className="nm-event-crest"
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : (
        <MatchEmpty
          title={
            events.length
              ? `No ${filter.toLowerCase()} reported`
              : state === "not_applicable"
                ? "Timeline not applicable"
                : state === "available"
                  ? "No events reported"
                  : pending
                    ? match.status === "upcoming"
                      ? "Ready for kickoff"
                      : "Timeline pending"
                    : "Timeline unavailable"
          }
        >
          {events.length
            ? "Try another event filter."
            : state === "not_applicable"
              ? "Match events do not apply to this fixture."
              : state === "available"
                ? "No events were reported in the available match feed."
                : pending
                  ? "Match events are pending."
                  : "The provider has not supplied detailed match events."}
        </MatchEmpty>
      )}
    </MatchPanel>
  );
}
