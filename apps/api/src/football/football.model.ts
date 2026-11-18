import { createHash } from 'node:crypto';
import type {
  CompetitionId,
  FixtureStatus,
  FootballMatch,
  FootballTeam,
  Standing,
  BracketRound,
} from '../../../../packages/football-contracts';

// Deterministic UUIDs are scoped by provider AND entity type; numerical IDs can overlap.
export function entityId(kind: string, provider: string, id: string | number) {
  const hex = createHash('sha256')
    .update(`football:v1:${kind}:${provider}:${id}`)
    .digest('hex')
    .slice(0, 32)
    .split('');
  hex[12] = '5';
  hex[16] = '8';
  const value = hex.join('');
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}
export const status = (value: string): FixtureStatus =>
  (({
    SCHEDULED: 'upcoming',
    TIMED: 'upcoming',
    SCHEDULED_MATCH: 'upcoming',
    IN_PLAY: 'live',
    PAUSED: 'live',
    FINISHED: 'finished',
    POSTPONED: 'postponed',
    SUSPENDED: 'suspended',
    CANCELLED: 'cancelled',
    CANCELED: 'cancelled',
    AWARDED: 'awarded',
    LIVE: 'live',
    UPCOMING: 'upcoming',
    UNKNOWN: 'unknown',
  })[value?.toUpperCase()] as FixtureStatus | undefined) ?? 'unknown';
export const safeUrl = (value: unknown): string | null => {
  try {
    const u = new URL(String(value));
    return ['https:', 'http:'].includes(u.protocol) &&
      !u.username &&
      !u.password
      ? u.toString()
      : null;
  } catch {
    return null;
  }
};
export function resultsFor(teamId: string, matches: FootballMatch[]) {
  const played = matches
    .filter(
      (m) =>
        m.status === 'finished' &&
        m.homeScore != null &&
        m.awayScore != null &&
        [m.homeTeamId, m.awayTeamId].includes(teamId),
    )
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  const stats: FootballTeam['stats'] = {
    played: played.length,
    wins: 0,
    draws: 0,
    losses: 0,
    goals: 0,
    conceded: 0,
    cleanSheets: 0,
    xg: null,
    possession: null,
  };
  const form: FootballTeam['form'] = [];
  for (const m of played) {
    const home = m.homeTeamId === teamId,
      own = (home ? m.homeScore : m.awayScore)!,
      other = (home ? m.awayScore : m.homeScore)!;
    stats.goals += own;
    stats.conceded += other;
    if (other === 0) stats.cleanSheets++;
    const r = own === other ? 'D' : own > other ? 'W' : 'L';
    form.push(r);
    if (r === 'W') stats.wins++;
    else if (r === 'D') stats.draws++;
    else stats.losses++;
  }
  return { stats, form: form.slice(-5) };
}
export function deriveStandings(
  competitionId: CompetitionId,
  teams: FootballTeam[],
  matches: FootballMatch[],
): Standing[] {
  const groups = new Map<string, Set<string>>();
  for (const m of matches) {
    if (!/GROUP|LEAGUE|REGULAR/i.test(m.stage)) continue;
    const group = (m as FootballMatch & { group?: string }).group ?? '';
    if (!groups.has(group)) groups.set(group, new Set());
    groups.get(group)!.add(m.homeTeamId).add(m.awayTeamId);
  }
  return [...groups].flatMap(([group, ids]) =>
    teams
      .filter((t) => ids.has(t.id))
      .map((t) => {
        const { stats: s } = resultsFor(
          t.id,
          matches.filter(
            (m) =>
              ((m as FootballMatch & { group?: string }).group ?? '') ===
                group && /GROUP|LEAGUE|REGULAR/i.test(m.stage),
          ),
        );
        return {
          competitionId,
          group: group || undefined,
          teamId: t.id,
          position: 0,
          played: s.played,
          won: s.wins,
          drawn: s.draws,
          lost: s.losses,
          goalsFor: s.goals,
          goalsAgainst: s.conceded,
          points: s.wins * 3 + s.draws,
        };
      })
      .sort(
        (a, b) =>
          b.points - a.points ||
          b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst) ||
          b.goalsFor - a.goalsFor ||
          a.teamId.localeCompare(b.teamId),
      )
      .map((r, i) => ({ ...r, position: i + 1 })),
  );
}
export function bracketFor(matches: FootballMatch[]): BracketRound[] {
  const stages = [
    'PLAYOFFS',
    'LAST_32',
    'ROUND_OF_32',
    'LAST_16',
    'ROUND_OF_16',
    'QUARTER_FINALS',
    'SEMI_FINALS',
    'THIRD_PLACE',
    'FINAL',
  ];
  return stages
    .map((stage) => ({
      name: stage.replace(/_/g, ' '),
      matches: matches
        .filter((m) => m.stage === stage)
        .map((m) => ({
          id: m.id,
          homeTeamId: m.homeTeamId,
          awayTeamId: m.awayTeamId,
          homeScore: m.homeScore ?? undefined,
          awayScore: m.awayScore ?? undefined,
          status: m.status,
        })),
    }))
    .filter((r) => r.matches.length);
}
