import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from './matches.service';

describe('MatchesService', () => {
  let service: MatchesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchesService],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns the group-stage matches from the FIFA data file', () => {
    const matches = service.findAll();

    expect(matches).toHaveLength(72);
    expect(matches[0]).toMatchObject({
      id: 'wc2026-ga-01',
      matchNumber: 1,
      stage: 'Group Stage',
      group: 'A',
      homeTeam: 'Mexico',
      awayTeam: 'South Africa',
    });
  });

  it('returns a single match by id or match number', () => {
    expect(service.findOne('wc2026-ga-01')).toMatchObject({
      id: 'wc2026-ga-01',
    });
    expect(service.findOne('1')).toMatchObject({
      id: 'wc2026-ga-01',
    });
  });
});
