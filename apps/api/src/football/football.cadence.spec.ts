import { nextFootballRun, type FootballCadenceState } from './football.cadence';

describe('Football due times', () => {
  const now = Date.parse('2026-11-19T07:00:00Z');
  const minute = 60_000;
  const state = (
    overrides: Partial<FootballCadenceState> = {},
  ): FootballCadenceState => ({
    live: false,
    matchday: false,
    nextKickoff: null,
    lastSuccessAt: new Date(now),
    ...overrides,
  });

  it('sleeps until a future kickoff on quiet days, or stays stopped without fixtures', () => {
    expect(nextFootballRun('scores', state(), now)).toBeNull();
    const kickoff = now + 3 * 24 * 60 * minute;
    expect(
      nextFootballRun('scores', state({ nextKickoff: new Date(kickoff) }), now),
    ).toBe(kickoff);
  });

  it('keeps hourly matchday refreshes while ensuring kickoff takes priority', () => {
    expect(nextFootballRun('scores', state({ matchday: true }), now)).toBe(
      now + 60 * minute,
    );
    expect(
      nextFootballRun(
        'scores',
        state({ matchday: true, nextKickoff: new Date(now + 10 * minute) }),
        now,
      ),
    ).toBe(now + 10 * minute);
  });

  it('does not repeatedly run immediately while the provider still reports a started match as scheduled', () => {
    expect(
      nextFootballRun(
        'scores',
        state({ matchday: true, nextKickoff: new Date(now) }),
        now,
      ),
    ).toBe(now + 5 * minute);
    expect(
      nextFootballRun(
        'scores',
        state({
          matchday: true,
          nextKickoff: new Date(now),
          lastSuccessAt: new Date(now - minute),
        }),
        now,
      ),
    ).toBe(now);
  });

  it('catches up overdue live scores and discovers schedules without existing job history', () => {
    expect(
      nextFootballRun(
        'scores',
        state({ live: true, lastSuccessAt: null }),
        now,
      ),
    ).toBe(now);
    expect(
      nextFootballRun('schedules', state({ lastSuccessAt: null }), now),
    ).toBe(now);
  });
});
