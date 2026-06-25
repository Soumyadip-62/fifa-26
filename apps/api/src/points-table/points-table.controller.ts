import { Controller, Get, Post } from '@nestjs/common';
import { PointsTableService } from './points-table.service';

@Controller('points-table')
export class PointsTableController {
  constructor(private readonly pointsTableService: PointsTableService) {}

  @Get('standings')
  async getStandings() {
    return this.pointsTableService.getStandings();
  }

  @Get('qualified-teams')
  async getQualifiedTeams() {
    return this.pointsTableService.getQualifiedTeams();
  }

  @Post('qualified-teams/sync')
  async syncQualifiedTeams() {
    return this.pointsTableService.syncQualifiedTeams();
  }
}
