import { Controller, Get, Param } from '@nestjs/common';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  getTeams() {
    return this.teamsService.getTeams();
  }

  @Get(':id')
  getTeamById(@Param('id') id: string) {
    return this.teamsService.getTeamDataById(id);
  }
  @Get(':id/players')
  getTeamPlayersById(@Param('id') id: string) {
    return this.teamsService.getTeamPlayersById(id);
  }
}
