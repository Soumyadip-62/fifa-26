import { Test, TestingModule } from '@nestjs/testing';
import { HistoryService } from './history.service';

describe('HistoryService', () => {
  let service: HistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoryService],
    }).compile();

    service = module.get<HistoryService>(HistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return only World Cup final matches', () => {
    const finals = service.getAllFinals();

    expect(finals.length).toBeGreaterThan(0);
    expect(
      finals.every(({ match }) =>
        match.round.toLowerCase().startsWith('final'),
      ),
    ).toBe(true);
    expect(finals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          year: 2018,
          tournament: 'World Cup 2018',
          match: expect.objectContaining({
            round: 'Final',
            team1: 'France',
            team2: 'Croatia',
            team1SportsdbTeamId: '133913',
            team2SportsdbTeamId: '133912',
            team1LogoUrl: expect.stringContaining('r2.thesportsdb.com'),
            team2LogoUrl: expect.stringContaining('r2.thesportsdb.com'),
            team1Details: expect.objectContaining({
              name: 'France',
              sportsdbTeamId: '133913',
            }),
            team2Details: expect.objectContaining({
              name: 'Croatia',
              sportsdbTeamId: '133912',
            }),
          }),
        }),
      ]),
    );
  });
});
