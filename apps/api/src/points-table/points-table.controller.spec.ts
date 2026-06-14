import { Test, TestingModule } from '@nestjs/testing';
import { PointsTableController } from './points-table.controller';

describe('PointsTableController', () => {
  let controller: PointsTableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PointsTableController],
    }).compile();

    controller = module.get<PointsTableController>(PointsTableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
