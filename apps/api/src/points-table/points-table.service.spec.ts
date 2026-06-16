import { Test, TestingModule } from '@nestjs/testing';
import { PointsTableService } from './points-table.service';

describe('PointsTableService', () => {
  let service: PointsTableService;
  let originalFetch: typeof global.fetch;

  beforeEach(async () => {
    originalFetch = global.fetch;
    const module: TestingModule = await Test.createTestingModule({
      providers: [PointsTableService],
    }).compile();

    service = module.get<PointsTableService>(PointsTableService);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should enrich standings from football-data.org with sportsdb team IDs', async () => {
    const mockStandingsData = {
      standings: [
        {
          stage: 'GROUP_STAGE',
          type: 'TOTAL',
          group: 'Group A',
          table: [
            {
              position: 1,
              team: {
                id: 765,
                name: 'Mexico',
                shortName: 'Mexico',
                tla: 'MEX',
              },
            },
            {
              position: 2,
              team: {
                id: 123,
                name: 'Korea Republic',
                shortName: 'South Korea',
                tla: 'KOR',
              },
            },
          ],
        },
      ],
    };

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStandingsData),
      }),
    ) as any;

    const standings = await service.getStandings();
    expect(standings.standings[0].table[0].team.sportsdb_team_id).toBe(
      '134497',
    );
    expect(standings.standings[0].table[0].team.sportsdbTeamId).toBe('134497');

    expect(standings.standings[0].table[1].team.sportsdb_team_id).toBe(
      '134517',
    ); // South Korea / Korea Republic
    expect(standings.standings[0].table[1].team.sportsdbTeamId).toBe('134517');
  });
});
