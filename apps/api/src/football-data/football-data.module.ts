import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentResourceCacheEntity } from '../tournaments/tournament.entities';
import { FootballDataClient } from './football-data.client';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([TournamentResourceCacheEntity])],
  providers: [FootballDataClient],
  exports: [FootballDataClient],
})
export class FootballDataModule {}
