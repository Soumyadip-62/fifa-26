import type {
  Availability,
  FixtureStatus,
  MatchReferee,
  MatchScore,
  MatchScorePair,
  MatchVenue,
} from '../../../../packages/football-contracts';

type Json = Record<string, unknown>;
const object = (value: unknown): Json =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Json)
    : {};
const has = (value: Json, key: string) => Object.hasOwn(value, key);
const nullableText = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : null;
const count = (value: unknown) =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
    ? value
    : null;
const pair = (value: unknown): MatchScorePair => ({
  home: count(object(value).home),
  away: count(object(value).away),
});

export function matchAvailability(
  present: boolean,
  status: FixtureStatus,
  label: string,
): Availability {
  if (present) return { state: 'available' };
  if (status === 'cancelled')
    return {
      state: 'not_applicable',
      message: `${label}: not applicable to a cancelled match.`,
    };
  if (['upcoming', 'live', 'postponed', 'suspended'].includes(status))
    return {
      state: 'pending',
      message: `${label}: not yet published for this pending or in-progress match.`,
    };
  return {
    state: 'unavailable',
    message: `${label}: not supplied by the provider or stored match data.`,
  };
}

export function confirmedVenueText(value: unknown): string | null {
  const text = nullableText(value);
  if (
    !text ||
    /^(?:(?:venue|stadium|ground)\s+)?(?:tbc|tbd|tba|unknown(?:\s+(?:venue|stadium|ground))?|unavailable|unspecified|none|null|n\/?a|not\s+(?:available|announced|confirmed|known)|to\s+be\s+(?:confirmed|announced|determined|decided)|[-—–]+)$/i.test(
      text.replaceAll('.', ''),
    )
  )
    return null;
  return text;
}
function venueValue(value: unknown) {
  const record = object(value);
  return {
    name: confirmedVenueText(
      typeof value === 'string' ? value : (record.name ?? record.stadium),
    ),
    city: confirmedVenueText(record.city),
    country: confirmedVenueText(record.country),
  };
}
function referees(value: unknown): MatchReferee[] {
  return (Array.isArray(value) ? value : [])
    .map((value) => {
      const row = object(value);
      return {
        id: count(row.id),
        name: nullableText(row.name),
        type: nullableText(row.type),
        nationality: nullableText(row.nationality),
      };
    })
    .filter((row) => Object.values(row).some((value) => value !== null));
}

/** Normalize only published/stored values. No score, winner, venue or duration is inferred. */
export function matchMetadata(raw: Json, stored: Json, status: FixtureStatus) {
  const rawScore = object(raw.score),
    storedScore = object(stored.score);
  const scoreField = (key: string) =>
    has(rawScore, key) ? rawScore[key] : storedScore[key];
  const score: MatchScore = {
    fullTime: pair(
      has(rawScore, 'fullTime') || has(storedScore, 'fullTime')
        ? scoreField('fullTime')
        : { home: storedScore.home, away: storedScore.away },
    ),
    halfTime: pair(scoreField('halfTime')),
    winner: nullableText(scoreField('winner')),
    duration: nullableText(scoreField('duration')),
  };
  const officials = referees(
    has(raw, 'referees') ? raw.referees : stored.referees,
  );
  const referee =
    officials.find(
      (official) => official.type?.toUpperCase() === 'REFEREE' && official.name,
    )?.name ?? null;
  const attendance = count(
    has(raw, 'attendance') ? raw.attendance : stored.attendance,
  );
  const publishedVenue = venueValue(raw.venue),
    savedVenue = venueValue(stored.venue);
  const selected = publishedVenue.name
    ? publishedVenue
    : savedVenue.name
      ? savedVenue
      : publishedVenue;
  const venue: MatchVenue = {
    ...selected,
    confirmed: selected.name !== null,
    source:
      selected === savedVenue
        ? 'database'
        : Object.values(publishedVenue).some((value) => value !== null)
          ? 'provider'
          : null,
  };
  if (
    publishedVenue.name &&
    savedVenue.name &&
    publishedVenue.name.toLowerCase() === savedVenue.name.toLowerCase()
  ) {
    venue.city ??= savedVenue.city;
    venue.country ??= savedVenue.country;
  }
  const complete = (value: MatchScorePair) =>
    value.home !== null && value.away !== null;
  const final = ['finished', 'awarded'].includes(status);
  const winnerAvailability = final
    ? matchAvailability(score.winner !== null, status, 'Match winner')
    : matchAvailability(false, status, 'Final match winner');
  const availability: Record<string, Availability> = {
    fullTimeScore: matchAvailability(complete(score.fullTime), status, 'Score'),
    halfTimeScore: matchAvailability(
      complete(score.halfTime),
      status,
      'Half-time score',
    ),
    winner: winnerAvailability,
    duration: matchAvailability(
      score.duration !== null,
      status,
      'Match duration',
    ),
    referees: matchAvailability(
      officials.length > 0,
      status,
      'Referee information',
    ),
    attendance: matchAvailability(attendance !== null, status, 'Attendance'),
    venue: matchAvailability(venue.confirmed, status, 'Venue'),
  };
  return {
    score,
    referees: officials,
    referee,
    attendance,
    venue,
    availability,
  };
}
