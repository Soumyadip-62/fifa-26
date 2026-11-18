import { DataSource } from 'typeorm';
import { FootballService } from './football.service';
import { NewsService } from '../news/news.service';
import { TournamentsService } from '../tournaments/tournaments.service';
import { FootballDataClient } from '../football-data/football-data.client';
import { TournamentFixtureEntity } from '../tournaments/tournament.entities';

function setup(confirmed = true) {
  const getMatchNews = jest.fn().mockResolvedValue({
    news: [
      {
        id: 'story',
        title: 'Barcelona beat Atletico Madrid',
        description: 'A comeback victory.',
        url: 'https://publisher.example/match-report',
        published: '2026-11-08T23:00:00Z',
        image: null,
      },
    ],
    freshness: { fetchedAt: '2026-11-16T10:00:00Z', stale: false },
  });
  const findOneBy = jest.fn().mockResolvedValue({
    id: 564746,
    competitionId: 'la-liga',
    kickoff: new Date('2026-11-08T20:00:00Z'),
    payload: {
      homeTeam: {
        id: confirmed ? 78 : null,
        name: 'Club Atlético de Madrid',
        shortName: 'Atleti',
      },
      awayTeam: { id: 81, name: 'FC Barcelona', shortName: 'Barça' },
    },
  });
  const builder = {
    where: jest.fn(),
    orWhere: jest.fn(),
    getMany: jest.fn().mockResolvedValue([
      {
        key: 'news:v2:match:564746:digest',
        fetchedAt: new Date(),
        payload: {
          news: [
            {
              id: 'story',
              title: 'Barcelona beat Atletico Madrid',
              description: 'A comeback victory.',
              competitionId: 'la-liga',
              url: 'https://publisher.example/match-report',
              published: '2026-11-08T23:00:00Z',
            },
          ],
        },
      },
    ]),
  };
  builder.where.mockReturnValue(builder);
  builder.orWhere.mockReturnValue(builder);
  const db = {
    getRepository: jest.fn((entity: unknown) =>
      entity === TournamentFixtureEntity
        ? { findOneBy }
        : {
            createQueryBuilder: () => builder,
            findOneBy: jest.fn().mockResolvedValue(null),
          },
    ),
  };
  const service = new FootballService(
    db as unknown as DataSource,
    {} as TournamentsService,
    { getMatchNews } as unknown as NewsService,
    {} as FootballDataClient,
  );
  const snapshot = jest
    .spyOn(service, 'snapshot')
    .mockRejectedValue(
      new Error('Full snapshot should not be loaded for match news'),
    );
  return { service, getMatchNews, findOneBy, snapshot };
}

describe('Match news endpoint', () => {
  it('uses the actual fixture opponents and date and returns publisher previews', async () => {
    const h = setup();
    const result = await h.service.relatedNews('matches', '564746');
    expect(h.getMatchNews).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '564746',
        kickoff: '2026-11-08T20:00:00.000Z',
        homeTeam: { name: 'Club Atlético de Madrid', shortName: 'Atleti' },
        awayTeam: { name: 'FC Barcelona', shortName: 'Barça' },
      }),
    );
    expect(result).toMatchObject({
      articles: [
        {
          id: 'story',
          slug: 'story',
          sourceUrl: 'https://publisher.example/match-report',
        },
      ],
      availability: { state: 'available' },
    });
    expect(h.snapshot).not.toHaveBeenCalled();
  });
  it('serves match-search article links from the persistent cache', async () => {
    const h = setup();
    expect(await h.service.article('story')).toMatchObject({
      id: 'story',
      competitionId: 'la-liga',
      sourceUrl: 'https://publisher.example/match-report',
    });
  });
  it('does not search using unconfirmed opponents', async () => {
    const h = setup(false);
    expect(await h.service.relatedNews('matches', '564746')).toMatchObject({
      articles: [],
      availability: { state: 'unavailable' },
    });
    expect(h.getMatchNews).not.toHaveBeenCalled();
  });
  it('returns 404 for unknown fixtures without consuming provider quota', async () => {
    const h = setup();
    h.findOneBy.mockResolvedValue(null);
    await expect(h.service.relatedNews('matches', '564746')).rejects.toThrow(
      'Match not found',
    );
    expect(h.getMatchNews).not.toHaveBeenCalled();
  });
});
