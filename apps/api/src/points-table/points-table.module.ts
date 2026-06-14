import { Module } from '@nestjs/common';
import { PointsTableController } from './points-table.controller';
import { PointsTableService } from './points-table.service';

@Module({
  controllers: [PointsTableController],
  providers: [PointsTableService],
  exports: [PointsTableService],
})
export class PointsTableModule {}
