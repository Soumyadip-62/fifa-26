import { DataSource } from 'typeorm';
import { FootballService } from './football.service';
import { FootballController } from './football.controller';
import { FootballDevices } from './football.devices';
import { FootballJobs } from './football.jobs';
import { TournamentsService } from '../tournaments/tournaments.service';
import { TournamentFixtureEntity } from '../tournaments/tournament.entities';
import { FootballDataClient } from '../football-data/football-data.client';
import { NewsService } from '../news/news.service';
import type { FootballSnapshot } from '../../../../packages/football-contracts';

function setup(
  providerStatus = 'FINISHED',
  venue: unknown = 'Published Stadium',
) {
  const raw = {
    id: 101,
    utcDate: '2026-11-08T20:00:00Z',
    status: providerStatus,
    stage: 'REGULAR_SEASON',
    matchday: 12,
    homeTeam: { id: 1, name: 'Home FC', shortName: 'Home' },
    awayTeam: { id: 2, name: 'Away FC', shortName: 'Away' },
    score: {
      fullTime:
        providerStatus === 'TIMED'
          ? { home: null, away: null }
          : { home: 1, away: 2 },
      halfTime:
        providerStatus === 'TIMED'
          ? { home: null, away: null }
          : { home: 1, away: 1 },
      winner: providerStatus === 'FINISHED' ? 'AWAY_TEAM' : null,
      duration: providerStatus === 'FINISHED' ? 'REGULAR' : null,
    },
    referees: [
      { id: 10, name: 'Main Official', type: 'REFEREE', nationality: null },
    ],
    venue,
  };
  const fixture = {
    id: 101,
    competitionId: 'premier-league',
    season: 2026,
    kickoff: new Date(raw.utcDate),
    status: providerStatus,
    payload: raw,
    score: raw.score,
    observedAt: new Date(),
  } as unknown as TournamentFixtureEntity;
  const db = {
    getRepository: () => ({ findOneBy: jest.fn().mockResolvedValue(fixture) }),
  };
  const tournaments = {
    seasonYear: jest.fn().mockReturnValue(undefined),
    details: jest.fn().mockResolvedValue({
      ...raw,
      freshness: { fetchedAt: new Date().toISOString(), stale: false },
    }),
  };
  const service = new FootballService(
    db as unknown as DataSource,
    tournaments as unknown as TournamentsService,
    {} as NewsService,
    {} as FootballDataClient,
  );
  const snapshot = {
    matches: [service.clubMatch(fixture)],
    competitions: [{ id: 'premier-league', name: 'Premier League' }],
    teams: [],
    players: [],
    stadiums: [
      { id: 'unrelated-ground', name: 'Home Ground', imageUrl: '/known.svg' },
    ],
    news: [],
    errors: {},
    availability: {},
  } as unknown as FootballSnapshot;
  jest.spyOn(service, 'snapshot').mockResolvedValue(snapshot);
  jest.spyOn(service, 'cachedNews').mockResolvedValue([]);
  const controller = new FootballController(
    service,
    {} as FootballDevices,
    {} as FootballJobs,
  );
  return { raw, fixture, service, controller, snapshot };
}

describe('Match detail API compatibility', () => {
  it.each(['FINISHED', 'IN_PLAY', 'TIMED'])(
    'exposes nullable result metadata for %s without changing match listings',
    async (status) => {
      const h = setup(status);
      const listingBefore = h.service.clubMatch(h.fixture);
      const result = await h.controller.details('101');
      expect(result.score?.fullTime).toEqual(h.raw.score.fullTime);
      expect(result.score?.halfTime).toEqual(h.raw.score.halfTime);
      expect(result.referees?.[0]).toEqual(h.raw.referees[0]);
      expect(result.match.referee).toBe('Main Official');
      const serialized = JSON.parse(JSON.stringify(result)) as {
        match: { attendance: number | null };
      };
      expect(serialized.match.attendance).toBeNull();
      expect(result.venue).toMatchObject({
        name: 'Published Stadium',
        confirmed: true,
        source: 'provider',
      });
      expect(result.events).toEqual([]);
      expect(result.lineups).toEqual([]);
      expect(result.stats).toEqual([]);
      expect(h.service.clubMatch(h.fixture)).toEqual(listingBefore);
      const listing = await h.controller.matches({});
      expect(listing.matches).toEqual([listingBefore]);
      expect(listing.matches[0]).not.toHaveProperty('score');
    },
  );
  it('rejects placeholder grounds and does not infer the home stadium as the match venue', async () => {
    const h = setup('FINISHED', 'Venue to be confirmed');
    h.snapshot.matches[0].stadiumId = 'unrelated-ground';
    const result = await h.service.details('101');
    expect(result.venue).toMatchObject({ name: null, confirmed: false });
    expect(result.match.stadiumId).toBe('');
    expect(result.stadium.id).toBeUndefined();
    expect(result.availability?.venue.state).toBe('unavailable');
  });
  it('distinguishes pending live data from provider-unavailable completed data', async () => {
    expect(
      (await setup('IN_PLAY', null).service.details('101')).availability,
    ).toMatchObject({
      attendance: { state: 'pending' },
      venue: { state: 'pending' },
      events: { state: 'pending' },
      lineups: { state: 'pending' },
      statistics: { state: 'pending' },
    });
    expect(
      (await setup('FINISHED', null).service.details('101')).availability,
    ).toMatchObject({
      attendance: { state: 'unavailable' },
      venue: { state: 'unavailable' },
      events: { state: 'unavailable' },
      lineups: { state: 'unavailable' },
      statistics: { state: 'unavailable' },
    });
  });

  it('exposes existing World Cup entity metadata without guessing venue or results', async () => {
    const stored = {
      id: 'wc-stored',
      score: {
        home: 0,
        away: 1,
        halfTime: { home: 0, away: 0 },
        winner: 'AWAY_TEAM',
        duration: 'EXTRA_TIME',
      },
      referees: [{ id: 10, name: 'Main Official', type: 'REFEREE' }],
      venue: {
        stadium: 'Stored Match Stadium',
        city: 'Host City',
        country: 'Host Country',
      },
      goals: [],
    };
    const db = {
      getRepository: (entity: unknown) => ({
        findOneBy: jest
          .fn()
          .mockResolvedValue(
            entity === TournamentFixtureEntity ? null : stored,
          ),
      }),
    };
    const service = new FootballService(
      db as unknown as DataSource,
      {} as TournamentsService,
      {} as NewsService,
      {} as FootballDataClient,
    );
    jest.spyOn(service, 'snapshot').mockResolvedValue({
      matches: [
        {
          id: 'wc-stored',
          competitionId: 'world-cup',
          status: 'finished',
          homeTeamId: 'home',
          awayTeamId: 'away',
          stadiumId: 'stored-stadium',
          homeScore: 0,
          awayScore: 1,
        },
      ],
      competitions: [{ id: 'world-cup' }],
      teams: [],
      stadiums: [
        {
          id: 'stored-stadium',
          name: 'Stored Match Stadium',
          imageUrl: '/stored.svg',
        },
      ],
    } as unknown as FootballSnapshot);
    jest.spyOn(service, 'cachedNews').mockResolvedValue([]);
    const result = await service.details('wc-stored');
    expect(result.score).toEqual({
      fullTime: { home: 0, away: 1 },
      halfTime: { home: 0, away: 0 },
      winner: 'AWAY_TEAM',
      duration: 'EXTRA_TIME',
    });
    expect(result.match.referee).toBe('Main Official');
    expect(result.referees?.[0].nationality).toBeNull();
    expect(result.venue).toMatchObject({
      name: 'Stored Match Stadium',
      confirmed: true,
      source: 'database',
    });
    expect(result.stadium.id).toBe('stored-stadium');
  });
});
