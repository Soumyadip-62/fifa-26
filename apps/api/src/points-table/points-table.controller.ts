import { Controller, Get, Headers, Post } from '@nestjs/common';
import { PointsTableService } from './points-table.service';
import { assertAdminSecret } from '../common/admin-auth';

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
  async syncQualifiedTeams(
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    assertAdminSecret(headers);
    return this.pointsTableService.syncQualifiedTeams();
  }
}
