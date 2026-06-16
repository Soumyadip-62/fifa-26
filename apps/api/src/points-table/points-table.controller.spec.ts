import { Test, TestingModule } from '@nestjs/testing';
import { PointsTableController } from './points-table.controller';
import { PointsTableService } from './points-table.service';

describe('PointsTableController', () => {
  let controller: PointsTableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PointsTableController],
      providers: [
        {
          provide: PointsTableService,
          useValue: {
            getStandings: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PointsTableController>(PointsTableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
