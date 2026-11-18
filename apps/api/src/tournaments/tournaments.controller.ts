import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';

@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournaments: TournamentsService) {}

  @Get()
  list(@Query('season') season?: string) {
    return this.tournaments.list(this.tournaments.seasonYear(season));
  }

  @Get('matches/:matchId')
  details(@Param('matchId', ParseIntPipe) matchId: number) {
    return this.tournaments.details(matchId);
  }

  @Get(':id')
  competition(@Param('id') id: string, @Query('season') season?: string) {
    return this.tournaments.competition(
      this.tournaments.tournamentId(id),
      this.tournaments.seasonYear(season),
    );
  }

  @Get(':id/teams')
  teams(@Param('id') id: string, @Query('season') season?: string) {
    return this.tournaments.teams(
      this.tournaments.tournamentId(id),
      this.tournaments.seasonYear(season),
    );
  }

  @Get(':id/matches')
  matches(@Param('id') id: string, @Query('season') season?: string) {
    return this.tournaments.matches(
      this.tournaments.tournamentId(id),
      this.tournaments.seasonYear(season),
    );
  }

  @Get(':id/standings')
  standings(@Param('id') id: string, @Query('season') season?: string) {
    return this.tournaments.resource(
      this.tournaments.tournamentId(id),
      'standings',
      this.tournaments.seasonYear(season),
    );
  }

  @Get(':id/scorers')
  scorers(@Param('id') id: string, @Query('season') season?: string) {
    return this.tournaments.resource(
      this.tournaments.tournamentId(id),
      'scorers',
      this.tournaments.seasonYear(season),
    );
  }
}
