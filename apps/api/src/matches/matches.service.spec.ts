import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from './matches.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MatchEntity } from './entities/matches.entity';
import { FootballDataClient } from '../football-data/football-data.client';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('MatchesService', () => {
  let service: MatchesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchesService,
        { provide: getRepositoryToken(MatchEntity), useValue: { find: jest.fn(async () => JSON.parse(readFileSync(join(process.cwd(), 'fifa-data/group-stage-schedule.json'), 'utf8')).matches) } },
        { provide: FootballDataClient, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns stored group-stage matches in kickoff order', async () => {
    const matches = await service.findAll();

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

  it('returns a single stored match by id or match number', async () => {
    expect(await service.findOne('wc2026-ga-01')).toMatchObject({
      id: 'wc2026-ga-01',
    });
    expect(await service.findOne('1')).toMatchObject({
      id: 'wc2026-ga-01',
    });
  });

  it('does not return the bundled schedule when the database is unavailable', async () => {
    const repo = (service as unknown as { matchRepository: { find: jest.Mock } }).matchRepository;
    repo.find.mockRejectedValue(new Error('Database unavailable'));
    await expect(service.findAll()).rejects.toThrow('Stored fixtures are temporarily unavailable');
  });

  it('loads knockout fixtures from the database rather than bundled qualifier JSON', async () => {
    const repo = (service as unknown as { matchRepository: { find: jest.Mock } }).matchRepository;
    repo.find.mockResolvedValue([{id:'published-final',stage:'FINAL'}, {id:'group',stage:'GROUP_STAGE'}, {id:'legacy-group',stage:'Group Stage'}]);
    expect(await service.findAllQualifierMatches()).toEqual([{id:'published-final',stage:'FINAL'}]);
    expect(await service.findOne('published-final')).toMatchObject({id:'published-final'});
  });
});
