import { Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { assertAdminSecret } from '../common/admin-auth';

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
  async syncMatches(@Headers() headers: Record<string, string | string[] | undefined>) {
    assertAdminSecret(headers);
    await this.matchesService.syncMatchesToDb();
    return { ok: true, syncedAt: new Date().toISOString() };
  }

  @Get(':matchId')
  getMatchDetails(@Param('matchId') matchId: string) {
    return this.matchesService.findOne(matchId);
  }
}
