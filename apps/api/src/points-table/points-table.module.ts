import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsTableController } from './points-table.controller';
import { PointsTableService } from './points-table.service';
import { QualifiedTeamEntity } from './entities/qualified-team.entity';
import { TournamentsModule } from '../tournaments/tournaments.module';

@Module({
  imports: [TypeOrmModule.forFeature([QualifiedTeamEntity]), TournamentsModule],
  controllers: [PointsTableController],
  providers: [PointsTableService],
  exports: [PointsTableService],
})
export class PointsTableModule {}
