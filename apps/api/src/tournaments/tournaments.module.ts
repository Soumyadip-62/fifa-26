import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FootballDataModule } from '../football-data/football-data.module';
import {
  TournamentFixtureEntity,
  TournamentResourceCacheEntity,
  TournamentSeasonEntity,
} from './tournament.entities';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';

@Module({
  imports: [
    FootballDataModule,
    TypeOrmModule.forFeature([
      TournamentSeasonEntity,
      TournamentFixtureEntity,
      TournamentResourceCacheEntity,
    ]),
  ],
  controllers: [TournamentsController],
  providers: [TournamentsService],
  exports: [TournamentsService],
})
export class TournamentsModule {}
