import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { FootballService } from './football.service';
import { FootballDevices, credentialMatches } from './football.devices';
import { FootballJobs } from './football.jobs';
import { assertAdminSecret } from '../common/admin-auth';

type Filters = {
  competition?: string;
  season?: string;
  q?: string;
  page?: string;
  pageSize?: string;
};
@Controller('football')
export class FootballController {
  constructor(
    private readonly football: FootballService,
    private readonly devices: FootballDevices,
    private readonly jobs: FootballJobs,
  ) {}
  @Get('snapshot') snapshot(@Query() q: Filters) {
    return this.football.snapshot(
      q.competition,
      this.football.season(q.season),
    );
  }
  @Get('competitions') async competitions() {
    return (await this.football.snapshot()).competitions;
  }
  @Get('competitions/:id/seasons') seasons(@Param('id') id: string) {
    return this.football.seasons(id);
  }
  @Get('competitions/:id/standings') standings(
    @Param('id') id: string,
    @Query('season') season?: string,
  ) {
    return this.football.standings(id, this.football.season(season));
  }
  @Get('competitions/:id/scorers') scorers(
    @Param('id') id: string,
    @Query('season') season?: string,
  ) {
    return this.football.scorers(id, this.football.season(season));
  }
  @Get('competitions/:id/bracket') bracket(
    @Param('id') id: string,
    @Query('season') season?: string,
  ) {
    return this.football.bracket(id, this.football.season(season));
  }
  @Get('matches') async matches(@Query() q: Filters) {
    const d = await this.football.snapshot(
      q.competition,
      this.football.season(q.season),
    );
    return {
      matches: d.matches,
      teams: d.teams,
      competitions: d.competitions,
      errors: d.errors,
      availability: d.availability,
    };
  }
  @Get('matches/:id') details(@Param('id') id: string) {
    return this.football.details(id);
  }
  @Get('matches/:id/news') matchNews(@Param('id') id: string) {
    return this.football.relatedNews('matches', id);
  }
  @Get('teams/:id/news') teamNews(@Param('id') id: string) {
    return this.football.relatedNews('teams', id);
  }
  @Get('teams') teams(@Query() q: Filters) {
    return this.football.directory('teams', q);
  }
  @Get('teams/:id') team(@Param('id') id: string) {
    return this.football.profile('teams', id);
  }
  @Get('players') players(@Query() q: Filters) {
    return this.football.directory('players', q);
  }
  @Get('players/:id') player(@Param('id') id: string) {
    return this.football.profile('players', id);
  }
  @Get('stadiums') stadiums(@Query() q: Filters) {
    return this.football.directory('stadiums', q);
  }
  @Get('stadiums/:id') stadium(@Param('id') id: string) {
    return this.football.profile('stadiums', id);
  }
  @Get('news') news(@Query('competition') id?: string) {
    if (id) this.football.competitionId(id);
    return this.football.cachedNews(id);
  }
  @Get('articles/:id') article(@Param('id') id: string) {
    return this.football.article(id);
  }
  @Get('search') search(@Query() q: Filters) {
    return this.football.search(q);
  }
  @Get('history') history() {
    return this.football.history();
  }
  @Get('history/:year') historyYear(@Param('year') year: string) {
    return this.football.history(this.football.season(year));
  }
  @Post('devices') register(
    @Body() b: { preferences: unknown; token: unknown },
  ) {
    return this.devices.register(b.preferences, b.token);
  }
  @Patch('devices/:id') update(
    @Param('id') id: string,
    @Headers('x-device-secret') secret: string,
    @Body() b: { preferences: unknown; token: unknown },
  ) {
    return this.devices.update(id, secret, b.preferences, b.token);
  }
  @Get('admin/status') status(
    @Headers() headers: Record<string, string | undefined>,
  ) {
    assertAdminSecret(headers);
    return this.jobs.status();
  }
  @Post('admin/import') import(
    @Headers() headers: Record<string, string | undefined>,
    @Body() b: { competition?: string; season?: string },
  ) {
    assertAdminSecret(headers);
    return this.jobs.run('schedules', {
      competition: b.competition,
      season: this.football.season(b.season),
    });
  }
  @Post('admin/backfill') backfill(
    @Headers() headers: Record<string, string | undefined>,
  ) {
    assertAdminSecret(headers);
    return this.jobs.run('backfill');
  }
  @Post('jobs/:job') runJob(
    @Param('job') job: string,
    @Headers('x-scheduler-secret') secret: string,
  ) {
    const expected = process.env.FOOTBALL_SCHEDULER_SECRET;
    if (!expected || !secret || !credentialMatches(secret, expected))
      throw new UnauthorizedException('Invalid scheduler credential.');
    if (!['scores', 'schedules', 'reminders'].includes(job))
      throw new UnauthorizedException('Unknown job.');
    if (job === 'scores' || job === 'schedules')
      return this.jobs.runScheduled(job);
    return this.jobs.run('reminders');
  }
}
