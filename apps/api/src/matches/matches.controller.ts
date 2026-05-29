import { Controller, Get, Param } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  getMatches() {
    return this.matchesService.findAll();
  }

  @Get(':matchId')
  getMatchDetails(@Param('matchId') matchId: string) {
    return this.matchesService.findOne(matchId);
  }
}
