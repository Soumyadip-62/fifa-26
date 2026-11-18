import { Test, TestingModule } from '@nestjs/testing';
import { PointsTableService } from './points-table.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QualifiedTeamEntity } from './entities/qualified-team.entity';
import { FootballDataClient } from '../football-data/football-data.client';
import { TournamentsService } from '../tournaments/tournaments.service';

describe('PointsTableService', () => {
  let service: PointsTableService;
  let originalFetch: typeof global.fetch;

  beforeEach(async () => {
    originalFetch = global.fetch;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointsTableService,
        {
          provide: getRepositoryToken(QualifiedTeamEntity),
          useValue: { find: jest.fn(async () => []) },
        },
        {
          provide: FootballDataClient,
          useValue: {
            get: jest.fn(async () =>
              (await global.fetch('http://provider.test')).json(),
            ),
          },
        },
        {
          provide: TournamentsService,
          useValue: {
            resource: jest.fn(async () =>
              (await global.fetch('http://provider.test')).json(),
            ),
          },
        },
      ],
    }).compile();

    service = module.get<PointsTableService>(PointsTableService);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('surfaces official-table failures instead of calculating a table from static JSON', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error('Official table unavailable'));
    await expect(service.getStandings()).rejects.toThrow(
      'Official table unavailable',
    );
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
