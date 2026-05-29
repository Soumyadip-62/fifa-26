import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

describe('SearchController', () => {
  let controller: SearchController;
  const searchService = {
    searchMatchesByTeam: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: searchService,
        },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('searches matches by team query', () => {
    searchService.searchMatchesByTeam.mockReturnValue([{ id: 'match-1' }]);

    expect(controller.searchMatchesByTeam('mexico')).toEqual([
      { id: 'match-1' },
    ]);
    expect(searchService.searchMatchesByTeam).toHaveBeenCalledWith('mexico');
  });
});
