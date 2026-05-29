import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from '../matches/matches.service';
import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;
  const matchesService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    matchesService.findAll.mockReturnValue([
      {
        id: 'wc2026-ga-01',
        homeTeam: 'Mexico',
        awayTeam: 'South Africa',
      },
      {
        id: 'wc2026-gb-01',
        homeTeam: 'Canada',
        awayTeam: 'Bosnia & Herzegovina',
      },
      {
        id: 'wc2026-gc-01',
        homeTeam: 'Brazil',
        awayTeam: 'Morocco',
      },
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: MatchesService,
          useValue: matchesService,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('searches matches by home team', () => {
    expect(service.searchMatchesByTeam('mex')).toEqual([
      expect.objectContaining({ id: 'wc2026-ga-01' }),
    ]);
  });

  it('searches matches by away team', () => {
    expect(service.searchMatchesByTeam('morocco')).toEqual([
      expect.objectContaining({ id: 'wc2026-gc-01' }),
    ]);
  });

  it('normalizes ampersands while searching', () => {
    expect(service.searchMatchesByTeam('bosnia and herzegovina')).toEqual([
      expect.objectContaining({ id: 'wc2026-gb-01' }),
    ]);
  });

  it('returns no matches for an empty query', () => {
    expect(service.searchMatchesByTeam('')).toEqual([]);
  });
});
