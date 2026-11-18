import {
  confirmedVenueText,
  matchAvailability,
  matchMetadata,
} from './match-metadata';

const completed = () => ({
  score: {
    fullTime: { home: 1, away: 2 },
    halfTime: { home: 1, away: 1 },
    winner: 'AWAY_TEAM',
    duration: 'REGULAR',
  },
  referees: [
    { id: 10, name: 'Main Official', type: 'REFEREE', nationality: 'Spain' },
    { id: 11, name: 'Assistant Official', type: 'ASSISTANT_REFEREE_N1' },
  ],
  attendance: 52000,
  venue: 'Published Stadium',
});

describe('Stored match metadata normalization', () => {
  it('exposes completed scores, result metadata, structured officials and the compatible referee name', () => {
    const result = matchMetadata(completed(), {}, 'finished');
    expect(result.score).toEqual(completed().score);
    expect(result.referees).toEqual([
      { id: 10, name: 'Main Official', type: 'REFEREE', nationality: 'Spain' },
      {
        id: 11,
        name: 'Assistant Official',
        type: 'ASSISTANT_REFEREE_N1',
        nationality: null,
      },
    ]);
    expect(result.referee).toBe('Main Official');
    expect(result.attendance).toBe(52000);
    expect(result.venue).toEqual({
      name: 'Published Stadium',
      city: null,
      country: null,
      confirmed: true,
      source: 'provider',
    });
    expect(
      Object.values(result.availability).every(
        (value) => value.state === 'available',
      ),
    ).toBe(true);
  });
  it('represents upcoming information as pending with explicit nullable values', () => {
    const result = matchMetadata(
      {
        score: {
          fullTime: { home: null, away: null },
          halfTime: { home: null, away: null },
        },
      },
      {},
      'upcoming',
    );
    expect(result.score).toEqual({
      fullTime: { home: null, away: null },
      halfTime: { home: null, away: null },
      winner: null,
      duration: null,
    });
    expect(result.attendance).toBeNull();
    expect(result.referee).toBeNull();
    expect(result.referees).toEqual([]);
    expect(result.venue.confirmed).toBe(false);
    expect(
      Object.values(result.availability).every(
        (value) => value.state === 'pending',
      ),
    ).toBe(true);
  });
  it('retains live zero scores and zero attendance without declaring a final winner', () => {
    const result = matchMetadata(
      {
        score: {
          fullTime: { home: 0, away: 0 },
          halfTime: { home: null, away: 0 },
          winner: 'HOME_TEAM',
        },
        attendance: 0,
      },
      {},
      'live',
    );
    expect(result.score.fullTime).toEqual({ home: 0, away: 0 });
    expect(result.score.halfTime).toEqual({ home: null, away: 0 });
    expect(result.score.winner).toBe('HOME_TEAM');
    expect(result.availability.winner.state).toBe('pending');
    expect(result.attendance).toBe(0);
    expect(result.availability.attendance.state).toBe('available');
    expect(result.availability.halfTimeScore.state).toBe('pending');
  });
  it('does not calculate an absent half-time score, winner or duration from full-time goals', () => {
    const result = matchMetadata(
      { score: { fullTime: { home: 1, away: 2 }, halfTime: null } },
      {},
      'finished',
    );
    expect(result.score.halfTime).toEqual({ home: null, away: null });
    expect(result.score.winner).toBeNull();
    expect(result.score.duration).toBeNull();
    expect(result.availability.halfTimeScore.state).toBe('unavailable');
    expect(result.availability.winner.state).toBe('unavailable');
    expect(result.attendance).toBeNull();
  });
  it('keeps partial nullable half-time values and respects explicit provider nulls over older scores', () => {
    const stored = {
      score: { halfTime: { home: 3, away: 2 }, winner: 'HOME_TEAM' },
    };
    expect(
      matchMetadata(
        { score: { halfTime: { home: 0, away: null }, winner: null } },
        stored,
        'finished',
      ).score,
    ).toMatchObject({ halfTime: { home: 0, away: null }, winner: null });
    expect(
      matchMetadata({ score: { halfTime: null } }, stored, 'finished').score
        .halfTime,
    ).toEqual({ home: null, away: null });
  });
  it.each([
    null,
    '',
    'TBD',
    'T.B.C.',
    'TBA',
    'Unknown stadium',
    'TBC',
    'Unknown',
    'Venue to be confirmed',
    'Stadium not available',
    'N/A',
    '—',
  ])('does not confirm placeholder venue %s', (value) => {
    expect(confirmedVenueText(value)).toBeNull();
    expect(matchMetadata({ venue: value }, {}, 'finished').venue).toMatchObject(
      { name: null, confirmed: false, source: null },
    );
  });
  it('reuses actual stored World Cup score, officials and venue fields without a schema change', () => {
    const stored = {
      score: {
        home: 0,
        away: 1,
        halfTime: { home: 0, away: 0 },
        winner: 'AWAY_TEAM',
        duration: 'EXTRA_TIME',
      },
      referees: completed().referees,
      venue: {
        stadium: 'Stored Match Stadium',
        city: 'Host City',
        country: 'Host Country',
      },
    };
    const result = matchMetadata({ venue: null }, stored, 'finished');
    expect(result.score).toEqual({
      fullTime: { home: 0, away: 1 },
      halfTime: { home: 0, away: 0 },
      winner: 'AWAY_TEAM',
      duration: 'EXTRA_TIME',
    });
    expect(result.venue).toEqual({
      name: 'Stored Match Stadium',
      city: 'Host City',
      country: 'Host Country',
      confirmed: true,
      source: 'database',
    });
    expect(result.referees).toHaveLength(2);
  });
  it('preserves an actual location without pretending that the stadium is confirmed', () => {
    const result = matchMetadata(
      { venue: { name: 'TBC', city: 'Known City', country: 'Known Country' } },
      {},
      'upcoming',
    );
    expect(result.venue).toEqual({
      name: null,
      city: 'Known City',
      country: 'Known Country',
      confirmed: false,
      source: 'provider',
    });
    expect(result.availability.venue.state).toBe('pending');
  });

  it('keeps stored location fields only when they belong to the same confirmed venue', () => {
    const stored = {
      venue: {
        stadium: 'Published Stadium',
        city: 'Stored City',
        country: 'Stored Country',
      },
    };
    expect(
      matchMetadata({ venue: 'Published Stadium' }, stored, 'finished').venue,
    ).toMatchObject({
      name: 'Published Stadium',
      city: 'Stored City',
      country: 'Stored Country',
    });
    expect(
      matchMetadata({ venue: 'Changed Stadium' }, stored, 'finished').venue,
    ).toMatchObject({ name: 'Changed Stadium', city: null, country: null });
  });
  it.each([-1, '10000', NaN, undefined, null])(
    'returns null for unavailable or invalid attendance %s',
    (attendance) => {
      expect(
        matchMetadata({ attendance }, {}, 'finished').attendance,
      ).toBeNull();
    },
  );
  it('marks missing play data as not applicable to cancelled matches and preserves any published metadata', () => {
    const result = matchMetadata(
      { venue: 'Assigned Stadium' },
      {},
      'cancelled',
    );
    expect(result.availability.halfTimeScore.state).toBe('not_applicable');
    expect(result.availability.winner.state).toBe('not_applicable');
    expect(result.availability.venue.state).toBe('available');
    expect(matchAvailability(false, 'cancelled', 'Statistics').state).toBe(
      'not_applicable',
    );
  });
  it('never substitutes an assistant for an unidentified main referee', () => {
    const result = matchMetadata(
      { referees: [{ name: 'Assistant', type: 'ASSISTANT_REFEREE_N1' }] },
      {},
      'finished',
    );
    expect(result.referee).toBeNull();
    expect(result.referees[0].id).toBeNull();
  });
});
