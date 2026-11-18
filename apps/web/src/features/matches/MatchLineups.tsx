import { useId, useState } from "react";
import Image from "next/image";
import { UsersRound, ShieldCheck } from "lucide-react";
import type { Lineup, MatchDetails } from "@/types/football";
import { MatchPanel } from "./MatchPanel";

function formation(value?: string) {
  if (!value || !/^\d(?:-\d){1,4}$/.test(value)) return null;
  const lines = value.split("-").map(Number);
  return lines.every((n) => n > 0 && n <= 5) &&
    lines.reduce((a, b) => a + b, 0) === 10
    ? [1, ...lines]
    : null;
}

function FormationShape({
  lineup,
  side,
  unavailableLabel,
}: {
  lineup?: Lineup;
  side: "home" | "away";
  unavailableLabel: string;
}) {
  const lines = formation(lineup?.formation);
  return (
    <div className={`nm-formation nm-formation-${side}`}>
      {lines ? (
        lines.map((count, index) => (
          <div
            className="nm-formation-line"
            key={index}
            aria-label={`${count} ${count === 1 ? "player" : "players"}`}
          >
            {Array.from({ length: count }, (_, player) => (
              <span className="nm-player-dot" key={player} />
            ))}
          </div>
        ))
      ) : (
        <span className="nm-formation-pending">
          <ShieldCheck aria-hidden="true" />
          {unavailableLabel}
        </span>
      )}
    </div>
  );
}

export function MatchLineups({ details }: { details: MatchDetails }) {
  const { homeTeam, awayTeam, lineups } = details;
  const state = details.availability?.lineups?.state;
  const pending =
    state === "pending" || (!state && details.match.status === "upcoming");
  const unavailableLabel = pending
    ? "Awaiting formation"
    : state === "not_applicable"
      ? "Not applicable"
      : "Formation unavailable";
  const [selected, setSelected] = useState(homeTeam.id);
  const id = useId();
  const teams = [homeTeam, awayTeam];
  const hasPlayers = lineups.some((lineup) => lineup.starters.length);
  const hasFormation = lineups.some((lineup) => formation(lineup.formation));
  return (
    <MatchPanel title="Team lineups" icon={UsersRound} className="nm-lineups">
      <div
        className="nm-team-switch"
        role="group"
        aria-label="Choose starting lineup"
      >
        {teams.map((team) => {
          const lineup = lineups.find((lineup) => lineup.teamId === team.id);
          return (
            <button
              type="button"
              key={team.id}
              aria-pressed={selected === team.id}
              aria-controls={`${id}-${team.id}`}
              onClick={() => setSelected(team.id)}
            >
              {team.logoUrl ? (
                <Image src={team.logoUrl} alt="" width={24} height={28} />
              ) : null}
              <span>{team.shortName || team.name}</span>
              <small>
                {formation(lineup?.formation)
                  ? lineup?.formation
                  : pending
                    ? "Pending"
                    : state === "not_applicable"
                      ? "Not applicable"
                      : "Unavailable"}
              </small>
            </button>
          );
        })}
      </div>
      <div className={`nm-lineup-content ${hasPlayers ? "has-players" : ""}`}>
        <div className="nm-pitch-wrap">
          <div
            className="nm-pitch"
            role="img"
            aria-label={
              hasFormation
                ? `${homeTeam.name} ${lineups.find((l) => l.teamId === homeTeam.id)?.formation || "formation unavailable"} versus ${awayTeam.name} ${lineups.find((l) => l.teamId === awayTeam.id)?.formation || "formation unavailable"}. Published formation shapes.`
                : `Football pitch. ${unavailableLabel}.`
            }
          >
            <div className="nm-pitch-boundary" aria-hidden="true">
              <span className="nm-pitch-half" />
              <span className="nm-pitch-circle" />
              <span className="nm-pitch-box home" />
              <span className="nm-pitch-box away" />
              <span className="nm-pitch-six home" />
              <span className="nm-pitch-six away" />
            </div>
            <FormationShape
              lineup={lineups.find((lineup) => lineup.teamId === homeTeam.id)}
              side="home"
              unavailableLabel={unavailableLabel}
            />
            <FormationShape
              lineup={lineups.find((lineup) => lineup.teamId === awayTeam.id)}
              side="away"
              unavailableLabel={unavailableLabel}
            />
          </div>
          <span className="nm-pitch-caption">
            {hasFormation
              ? "Published formation shapes"
              : pending
                ? "Confirmed formations are pending"
                : state === "not_applicable"
                  ? "Formations do not apply to this fixture"
                  : "The provider has not supplied confirmed formations"}
          </span>
        </div>
        <div className="nm-rosters">
          <h3>
            <ShieldCheck aria-hidden="true" />
            Starting XI
          </h3>
          {teams.map((team) => {
            const lineup = lineups.find((lineup) => lineup.teamId === team.id);
            return (
              <div
                key={team.id}
                id={`${id}-${team.id}`}
                className="nm-roster-team"
                data-active={selected === team.id}
              >
                <h4>
                  {team.logoUrl ? (
                    <Image src={team.logoUrl} alt="" width={20} height={24} />
                  ) : null}
                  {team.name}
                </h4>
                {lineup?.starters.length ? (
                  <>
                    <ul>
                      {lineup.starters.map((name, index) => (
                        <li key={`${name}-${index}`}>
                          <span aria-hidden="true" className="nm-roster-dot" />
                          {name}
                        </li>
                      ))}
                    </ul>
                    {lineup.substitutes.length ? (
                      <details className="nm-substitutes">
                        <summary>
                          Substitutes <span>{lineup.substitutes.length}</span>
                        </summary>
                        <ul>
                          {lineup.substitutes.map((name, index) => (
                            <li key={`${name}-${index}`}>{name}</li>
                          ))}
                        </ul>
                      </details>
                    ) : null}
                  </>
                ) : (
                  <p className="nm-roster-empty">
                    {pending
                      ? "The starting lineup is pending."
                      : state === "not_applicable"
                        ? "A starting lineup does not apply to this fixture."
                        : "The provider has not supplied a starting lineup."}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </MatchPanel>
  );
}
