export type ScheduledFootballJob = 'scores' | 'schedules';

export interface FootballCadenceState {
  live: boolean;
  matchday: boolean;
  nextKickoff: Date | string | null;
  lastSuccessAt: Date | string | null;
}

export const FOOTBALL_RETRY_MS = 5 * 60_000;

/** Absolute due time, shared by the process timers and external scheduler gate. */
export function nextFootballRun(
  name: ScheduledFootballJob,
  state: FootballCadenceState,
  now: number,
): number | null {
  const lastSuccess = state.lastSuccessAt
    ? new Date(state.lastSuccessAt).getTime()
    : null;
  const after = (interval: number) =>
    lastSuccess === null ? now : lastSuccess + interval;

  if (name === 'schedules')
    return after((state.matchday || state.live ? 1 : 2) * 60 * 60_000);
  if (state.live) return after(FOOTBALL_RETRY_MS);

  const kickoff = state.nextKickoff
    ? new Date(state.nextKickoff).getTime()
    : null;
  if (!state.matchday) {
    if (kickoff === null) return null;
    // A provider may still report SCHEDULED immediately after kickoff.
    return kickoff <= now && lastSuccess !== null && lastSuccess >= kickoff
      ? after(FOOTBALL_RETRY_MS)
      : kickoff;
  }

  const next = after(
    kickoff !== null && kickoff <= now && now - kickoff <= FOOTBALL_RETRY_MS
      ? FOOTBALL_RETRY_MS
      : 60 * 60_000,
  );
  // Never let an hourly matchday refresh delay the kickoff refresh.
  return kickoff !== null && (lastSuccess === null || lastSuccess < kickoff)
    ? Math.min(next, kickoff)
    : next;
}
