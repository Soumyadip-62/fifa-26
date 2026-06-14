import { Test, TestingModule } from '@nestjs/testing';
import { PointsTableService } from './points-table.service';

describe('PointsTableService', () => {
  let service: PointsTableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PointsTableService],
    }).compile();

    service = module.get<PointsTableService>(PointsTableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
