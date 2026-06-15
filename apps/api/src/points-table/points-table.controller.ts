import { Controller, Get } from '@nestjs/common';
import { PointsTableService } from './points-table.service';

@Controller('points-table')
export class PointsTableController {
  constructor(private readonly pointsTableService: PointsTableService) {}

  @Get('standings')
  async getStandings() {
    return this.pointsTableService.getStandings();
  }
}
