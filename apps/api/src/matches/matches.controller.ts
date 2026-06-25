import { Controller, Get, Param, Post } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  getMatches() {
    return this.matchesService.findAll();
  }

  @Get('qualifier-matches')
  getQualifierMatches() {
    return this.matchesService.findAllQualifierMatches();
  }

  @Post('sync')
  async syncMatches() {
    await this.matchesService.syncMatchesToDb();
    return { ok: true, syncedAt: new Date().toISOString() };
  }

  @Get(':matchId')
  getMatchDetails(@Param('matchId') matchId: string) {
    return this.matchesService.findOne(matchId);
  }
}
