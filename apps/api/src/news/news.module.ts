import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentResourceCacheEntity } from '../tournaments/tournament.entities';

@Module({
  imports: [TypeOrmModule.forFeature([TournamentResourceCacheEntity])],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
